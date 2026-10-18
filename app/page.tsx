import VisitorAnalytics from "@/components/VisitorAnalytics";
import { auth } from "@/auth";
import AuthNav from "@/components/AuthNav";
import MapClient from "@/components/MapClient";
import TopCopy from "@/components/TopCopy";
import TharatAssistant from "@/components/TharatAssistant";

export default async function Home() {
  const session = await auth();
  return (
    <main className="site">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-mark"><img src="/tharat-dino-logo.png" alt="" /></span><span><b>THARAT</b><small>ARKSURVIVAL.CZ</small></span></a>
        <TopCopy />
        <AuthNav user={session?.user || null} />
      </header>
      <MapClient user={session?.user || null} />
      <TharatAssistant />
      <VisitorAnalytics />
    </main>
  );
}
