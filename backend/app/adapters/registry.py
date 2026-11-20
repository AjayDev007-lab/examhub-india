from typing import Dict, Type, Optional
from app.adapters.base import BasePortalAdapter
from app.adapters.upsc import UPSCAdapter
from app.adapters.ssc import SSCAdapter
from app.adapters.rrb import RRBAdapter
from app.adapters.nta import NTAAdapter
from app.adapters.tnpsc import TNPSCAdapter
from app.adapters.university import UniversityAdapter, PrivateCollegeAdapter

_ADAPTER_REGISTRY: Dict[str, BasePortalAdapter] = {
    "UPSC": UPSCAdapter(),
    "SSC": SSCAdapter(),
    "RRB": RRBAdapter(),
    "NTA": NTAAdapter(),
    "TNPSC": TNPSCAdapter(),
    "DU": UniversityAdapter("University of Delhi", "DU"),
    "MU": UniversityAdapter("University of Mumbai", "MU"),
    "VTU": UniversityAdapter("Visvesvaraya Technological University", "VTU"),
    "ANNA_UNIV": UniversityAdapter("Anna University", "ANNA_UNIV"),
    "BITS": PrivateCollegeAdapter("BITS Pilani", "BITS"),
    "AMITY": PrivateCollegeAdapter("Amity University", "AMITY"),
    "SRM": PrivateCollegeAdapter("SRM Institute of Science and Technology", "SRM"),
}

def get_adapter(org_code: str) -> BasePortalAdapter:
    """Returns the registered adapter for the organization, or fallback university/private adapter."""
    clean_code = org_code.upper().strip()
    if clean_code in _ADAPTER_REGISTRY:
        return _ADAPTER_REGISTRY[clean_code]
    
    # Generic fallback
    if "UNIV" in clean_code or "COLLEGE" in clean_code:
        return UniversityAdapter(clean_code, clean_code)
    return PrivateCollegeAdapter(clean_code, clean_code)

def list_all_adapters() -> list[dict]:
    """Returns all registered adapters and their health statuses."""
    items = []
    for code, adapter in _ADAPTER_REGISTRY.items():
        info = adapter.get_organization_info()
        status = adapter.get_integration_status()
        items.append({
            "code": code,
            "adapter_name": adapter.adapter_name,
            "organization_name": info.get("name"),
            "category": info.get("category"),
            "status": status.get("status"),
            "latency_ms": status.get("latency_ms"),
            "supported_methods": adapter.supported_methods
        })
    return items
