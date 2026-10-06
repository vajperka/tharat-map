"use client";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "./LanguageProvider";
import TharatLoadingScreen from "./TharatLoadingScreen";
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><LanguageProvider><TharatLoadingScreen />{children}</LanguageProvider></SessionProvider>;
}
