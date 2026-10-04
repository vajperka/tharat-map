import { auth } from "@/auth";
import AuthNav from "@/components/AuthNav";
import MapClient from "@/components/MapClient";

export default async function Home() {
  const session = await auth();
  return (
    <main className="site">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-mark"></span><span><b>THARAT</b><small>ANCIENT SANDS</small></span></a>
        <div className="top-copy">INTERACTIVE RESOURCE MAP</div>
        <AuthNav user={session?.user || null} />
      </header>
      <MapClient user={session?.user || null} />
    </main>
  );
}
