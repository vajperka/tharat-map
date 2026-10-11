"use client";
import { useEffect, useState } from "react";

export default function MaintenanceCountdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000));
  useEffect(() => {
    if (seconds === 0) window.location.replace("/");
  }, [seconds]);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const secs = seconds % 60;
  const units = [[days, "DNŮ", "DAYS"], [hours, "HOD", "HRS"], [minutes, "MIN", "MIN"], [secs, "SEK", "SEC"]] as const;
  return <section className="tharat-countdown-exact" aria-label="Odpočet do ukončení údržby / Maintenance countdown">
    {units.map(([value, cs, en], index) => <div className={`tharat-countdown-exact__unit tharat-countdown-exact__unit--${index}`} key={cs}>
      <strong>{String(value).padStart(2,"0")}</strong><small>{cs}</small>
    </div>)}
  </section>;
}
