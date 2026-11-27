import time
import aiohttp
import urllib.parse
import ipaddress
import socket
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Organization, IntegrationLog

PROHIBITED_METADATA_IPS = {
    "169.254.169.254", # Cloud metadata endpoint (AWS, Azure, GCP)
    "169.254.170.2",   # ECS container metadata
    "fd00:ec2::254"    # IPv6 AWS metadata
}


class PublicOnlyResolver(aiohttp.abc.AbstractResolver):
    """Resolve once and pin outbound sockets to publicly routable addresses."""

    async def resolve(self, host: str, port: int = 0, family: int = socket.AF_INET) -> list[dict[str, Any]]:
        try:
            literal = ipaddress.ip_address(host)
            if not literal.is_global:
                raise OSError("Target IP is not publicly routable")
            addresses = [(socket.AF_INET6 if literal.version == 6 else socket.AF_INET, socket.SOCK_STREAM, 0, "", (str(literal), port))]
        except ValueError:
            try:
                addresses = await asyncio.get_running_loop().getaddrinfo(
                    host, port, family=family, type=socket.SOCK_STREAM
                )
            except OSError as exc:
                raise OSError("Target host could not be safely resolved") from exc

        results = []
        seen = set()
        for address_family, socket_type, protocol, _, sockaddr in addresses:
            address = sockaddr[0]
            if address in seen:
                continue
            seen.add(address)
            try:
                parsed_address = ipaddress.ip_address(address)
            except ValueError as exc:
                raise OSError("Target host resolved to an invalid address") from exc
            if not parsed_address.is_global:
                raise OSError(f"Target host resolves to a non-public address ({address})")
            results.append({
                "hostname": host,
                "host": address,
                "port": port,
                "family": address_family,
                "proto": protocol or socket_type,
                "flags": 0,
            })
        if not results:
            raise OSError("Target host could not be safely resolved")
        return results

    async def close(self) -> None:
        return None

def validate_target_url(url: str) -> Tuple[bool, str]:
    """
    Validates target URL to prevent SSRF and unsafe schemes.
    Only http and https protocols are permitted. Prohibits cloud metadata endpoints.
    """
    if not url or not isinstance(url, str):
        return False, "Target URL cannot be empty"
    
    parsed = urllib.parse.urlparse(url.strip())
    if parsed.scheme.lower() not in ("http", "https"):
        return False, "Only HTTP and HTTPS protocols are permitted"
    if parsed.username or parsed.password:
        return False, "Credentials in target URLs are not permitted"
    
    hostname = parsed.hostname
    if not hostname:
        return False, "Invalid target host"
        
    hostname_clean = hostname.strip().lower()
    if hostname_clean in PROHIBITED_METADATA_IPS or hostname_clean in {"localhost", "localhost.localdomain"} or hostname_clean.endswith(".localhost"):
        return False, "Target host is prohibited (SSRF security policy)"

    try:
        ip = ipaddress.ip_address(hostname_clean)
        if not ip.is_global:
            return False, f"Target IP {hostname_clean} is not publicly routable"
    except ValueError:
        # Reject hostnames that resolve to any private, loopback, metadata, or
        # otherwise non-public address before allowing the outbound request.
        try:
            port = parsed.port or (443 if parsed.scheme.lower() == "https" else 80)
            addresses = socket.getaddrinfo(hostname_clean, port, type=socket.SOCK_STREAM)
        except (OSError, ValueError):
            return False, "Target host could not be safely resolved"
        resolved_ips = {entry[4][0] for entry in addresses}
        if not resolved_ips:
            return False, "Target host could not be safely resolved"
        for address in resolved_ips:
            try:
                resolved_ip = ipaddress.ip_address(address)
            except ValueError:
                return False, "Target host resolved to an invalid address"
            if not resolved_ip.is_global:
                return False, f"Target host resolves to a non-public address ({address})"

    return True, "Valid"

async def test_institution_connectivity(
    target_url: str,
    db: AsyncSession,
    org_id: Optional[int] = None,
    admin_id: Optional[int] = None,
    custom_headers: Optional[Dict[str, str]] = None,
    timeout_secs: float = 10.0
) -> Dict[str, Any]:
    """
    Tests website availability and authorized API connectivity.
    Measures latency in milliseconds, records status code, updates organization health status,
    and logs an audit trail in integration_logs.
    """
    valid, reason = await asyncio.to_thread(validate_target_url, target_url)
    if not valid:
        return {
            "success": False,
            "status_code": 400,
            "latency_ms": 0,
            "health_status": "UNREACHABLE",
            "message": f"Security validation failed: {reason}",
            "tested_url": target_url,
            "tested_at": datetime.now(timezone.utc).isoformat()
        }

    headers = {
        "User-Agent": "ExamHubIndia-IntegrationMonitor/1.0 (+https://examhub.gov.in)",
        "Accept": "text/html,application/xhtml+xml,application/json,*/*",
        **(custom_headers or {})
    }

    start_time = time.perf_counter()
    status_code = 0
    is_success = False
    health_status = "UNREACHABLE"
    log_message = ""

    try:
        timeout = aiohttp.ClientTimeout(total=timeout_secs)
        connector = aiohttp.TCPConnector(
            resolver=PublicOnlyResolver(),
            use_dns_cache=False,
            ssl=True,
            limit=1,
        )
        async with aiohttp.ClientSession(timeout=timeout, connector=connector) as client:
            async with client.get(target_url, headers=headers, allow_redirects=False) as resp:
                status_code = resp.status
                await resp.read()
            latency_ms = int((time.perf_counter() - start_time) * 1000)

            if 200 <= status_code < 400:
                is_success = True
                health_status = "HEALTHY"
                log_message = f"Connection verified. HTTP {status_code} in {latency_ms}ms"
            elif status_code in (401, 403):
                # Endpoint reachable but requires authorized credentials
                is_success = True
                health_status = "HEALTHY"
                log_message = f"Portal online. Protected endpoint returned HTTP {status_code} ({latency_ms}ms)"
            elif 400 <= status_code < 500:
                is_success = False
                health_status = "DEGRADED"
                log_message = f"Endpoint responded with client error HTTP {status_code} ({latency_ms}ms)"
            else:
                is_success = False
                health_status = "DEGRADED"
                log_message = f"Server returned error HTTP {status_code} ({latency_ms}ms)"

    except asyncio.TimeoutError:
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        status_code = 504
        is_success = False
        health_status = "UNREACHABLE"
        log_message = f"Request timed out after {timeout_secs}s ({latency_ms}ms)"
    except aiohttp.ClientError as exc:
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        status_code = 502
        is_success = False
        health_status = "UNREACHABLE"
        log_message = f"Network connection failed: {type(exc).__name__}"
    except Exception as exc:
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        status_code = 500
        is_success = False
        health_status = "UNREACHABLE"
        log_message = f"Unexpected test error: {str(exc)}"

    # Record log and update Organization if org_id is provided
    if org_id:
        stmt = select(Organization).where(Organization.id == org_id)
        org = (await db.execute(stmt)).scalar_one_or_none()
        if org:
            org.health_status = health_status
            org.last_latency_ms = latency_ms
            org.last_tested_at = datetime.now(timezone.utc)
            if not is_success:
                org.error_count = (org.error_count or 0) + 1
            else:
                org.error_count = 0

            log_entry = IntegrationLog(
                organization_id=org.id,
                action="CONNECTIVITY_TEST",
                tested_url=target_url,
                status_code=status_code,
                is_success=is_success,
                message=log_message,
                duration_ms=latency_ms,
                tested_by_admin_id=admin_id
            )
            db.add(log_entry)
            await db.commit()

    return {
        "success": is_success,
        "status_code": status_code,
        "latency_ms": latency_ms,
        "health_status": health_status,
        "message": log_message,
        "tested_url": target_url,
        "tested_at": datetime.now(timezone.utc).isoformat()
    }
