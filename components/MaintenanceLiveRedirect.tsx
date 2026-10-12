"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Checks the server-side maintenance flag while a visitor is already on the page.
 * Middleware still enforces access on every navigation/API request.
 */
export default function MaintenanceLiveRedirect() {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    if (!pathname) return;
    const onMaintenance = pathname === "/maintenance" || pathname.startsWith("/maintenance/");
    const onLogin = pathname === "/login" || pathname.startsWith("/login/");
    const onAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
    // Keep login open so admins can sign in; do not disrupt admin workflows.
    if (onLogin || onAdmin || (!onMaintenance && session?.user?.role === "admin")) return;

    let stopped = false;
    let busy = false;
    async function check() {
      if (stopped || busy || document.visibilityState === "hidden") return;
      busy = true;
      try {
        const response = await fetch("/api/maintenance/status", { cache: "no-store" });
        if (!response.ok) return;
        const status = await response.json() as { enabled?: boolean };
        if (stopped) return;
        if (status.enabled === true && !onMaintenance) {
          window.location.replace("/maintenance");
        } else if (status.enabled === false && onMaintenance) {
          window.location.replace("/");
        }
      } catch {
        // Transient network failures should not force an incorrect redirect.
      } finally { busy = false; }
    }

    void check();
    const timer = window.setInterval(() => { void check(); }, 4000);
    const onFocus = () => { void check(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [pathname, session?.user?.role]);

  return null;
}
