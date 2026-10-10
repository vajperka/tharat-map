"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useLanguage } from "./LanguageProvider";

type WidgetAPI = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: WidgetAPI } }

export default function HumanCheck({ onToken }: { onToken: (token: string) => void }) {
  const { t } = useLanguage();
  const element = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const callback = useRef(onToken);
  const [ready, setReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => { callback.current = onToken; }, [onToken]);
  useEffect(() => {
    if (!ready || !siteKey || !element.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(element.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token: string) => callback.current(token),
      "expired-callback": () => callback.current(""),
      "error-callback": () => callback.current(""),
    });
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [ready, siteKey]);
  if (!siteKey) return <p className="form-error">{t("captcha.notConfigured")}</p>;
  return <div className="human-check">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} />
    <div ref={element} />
  </div>;
}
