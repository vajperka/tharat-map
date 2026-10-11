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
  const units = [[days, "DNŮ"], [hours, "HOD"], [minutes, "MIN"], [secs, "SEK"]] as const;
  return <section className="tharat-countdown-clean" aria-label="Odpočet do ukončení údržby / Maintenance countdown">
    <div className="tharat-countdown-clean__heading">✧ WEB BUDE OPĚT ONLINE ZA <span>/ BACK ONLINE IN</span> ✧</div>
    <div className="tharat-countdown-clean__values">
      {units.map(([value, cs], index) => <div className="tharat-countdown-clean__value" key={cs}>
        <strong>{String(value).padStart(2,"0")}</strong>
        <small>{cs}</small>
        {index !== units.length - 1 && <span className="tharat-countdown-clean__separator" aria-hidden="true">✦</span>}
      </div>)}
    </div>
  </section>;
}
