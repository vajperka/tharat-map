import "./globals.css";
import "leaflet/dist/leaflet.css";
import "./ancient-sands.css";
import Providers from "@/components/Providers";

export const metadata = {
  metadataBase: new URL("https://tharat-map.vercel.app"),
  title: "THARAT — Ancient Sands Resource Map",
  description: "Community resource map for ARK: Survival Ascended — Tharat: Ancient Sands.",
  icons: { icon: "/tharat-dino-logo.png", shortcut: "/tharat-dino-logo.png", apple: "/tharat-dino-logo.png" },
  openGraph: {
    title: "THARAT — Ancient Sands Resource Map",
    description: "Community resource map for ARK: Survival Ascended — Tharat: Ancient Sands.",
    url: "/", siteName: "THARAT", type: "website",
    images: [{ url: "/tharat-dino-logo.png", width: 512, height: 512, alt: "THARAT" }],
  },
  twitter: { card: "summary", title: "THARAT — Ancient Sands Resource Map", description: "Community resource map for ARK: Survival Ascended — Tharat: Ancient Sands.", images: ["/tharat-dino-logo.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="cs"><body><Providers>{children}</Providers></body></html>;
}
