import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMaintenanceStatus } from "@/lib/maintenance";
import MaintenanceCountdown from "@/components/MaintenanceCountdown";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const status = await getMaintenanceStatus();
  if (!status.enabled) redirect("/");
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");
  return <main className="tharat-cinematic-maintenance">
    <div className="tharat-cinematic-maintenance__art">
      {status.endsAt && <MaintenanceCountdown endsAt={status.endsAt} />}
    </div>
    <h1 className="tharat-maintenance__sr-only">Web právě prochází údržbou / Website under maintenance</h1>
    <Link href="/login" className="tharat-cinematic-maintenance__login">⚙ Přihlášení správce / Admin sign in →</Link>
  </main>;
}
