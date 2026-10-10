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

  return (
    <main className="tharat-maintenance" aria-label="Tharat Resource Map — web prochází údržbou">
      <div className="tharat-maintenance__backdrop" aria-hidden="true" />
      <div className="tharat-maintenance__scene" role="img" aria-label="Dinosaurus opravář uprostřed egyptské krajiny Tharatu; oznámení o údržbě v češtině a angličtině" />
      <div className="tharat-maintenance__embers" aria-hidden="true" />
      <h1 className="tharat-maintenance__sr-only">Web právě prochází údržbou / Website under maintenance</h1>
      <p className="tharat-maintenance__sr-only">Pracujeme na vylepšeních mapy Tharat. Brzy budeme zpátky. We are improving the Tharat Resource Map and will be back soon.</p>
      <Link href="/login" className="tharat-maintenance__login">
        <span aria-hidden="true">⚙</span> Přihlášení správce <span className="tharat-maintenance__login-en">/ Admin sign in</span> <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
