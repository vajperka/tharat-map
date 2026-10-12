"use client";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "./LanguageProvider";
import TharatLoadingScreen from "./TharatLoadingScreen";
import MaintenanceLiveRedirect from "./MaintenanceLiveRedirect";
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><LanguageProvider><TharatLoadingScreen /><MaintenanceLiveRedirect />{children}</LanguageProvider></SessionProvider>;
}
