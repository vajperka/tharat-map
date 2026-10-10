import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMaintenanceMode } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const active = await getMaintenanceMode();
  if (!active) redirect("/");
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");
  return <main className="maintenance-screen">
    <section className="maintenance-card">
      <img src="/tharat-dino-logo.png" width="86" height="86" alt="THARAT" />
      <div className="maintenance-kicker">THARAT · ANCIENT SANDS</div>
      <div className="maintenance-icon">⚒</div>
      <h1>Web právě upravujeme</h1>
      <p>Na mapě Tharat momentálně probíhá údržba a vylepšování. Brzy budeme zpátky!</p>
      <div className="maintenance-rule"/>
      <h2>Website under maintenance</h2>
      <p>We’re currently improving the Tharat resource map. We’ll be back soon!</p>
      <Link href="/login" className="maintenance-admin-link">Přihlášení správce / Admin sign in →</Link>
    </section>
  </main>;
}
