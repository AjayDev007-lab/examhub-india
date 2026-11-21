"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTrackerClient() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    // Respect user Do Not Track (DNT) preference
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") {
      return;
    }

    if (!pathname || pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    // Send privacy-first anonymous beacon
    try {
      const payload = {
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        screenWidth: typeof window !== "undefined" ? window.innerWidth : 1280,
      };

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {}
  }, [pathname]);

  // Keep alive heartbeat every 90 seconds while tab is focused
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden && pathname) {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: "",
            screenWidth: typeof window !== "undefined" ? window.innerWidth : 1280,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    }, 90000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
