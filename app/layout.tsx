import "./globals.css";
import "leaflet/dist/leaflet.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "THARAT — Ancient Sands Resource Map",
  description: "Community resource map for ARK: Survival Ascended — Tharat: Ancient Sands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="cs"><body><Providers>{children}</Providers></body></html>;
}
