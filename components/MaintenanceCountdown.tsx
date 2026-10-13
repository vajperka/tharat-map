"use client";
import { useEffect, useState } from "react";

export default function MaintenanceCountdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = now === null ? null : Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000));
  useEffect(() => {
    if (seconds === 0) window.location.replace("/");
  }, [seconds]);
  const units = seconds === null ? null : [
    [Math.floor(seconds / 86400), "DNŮ"],
    [Math.floor(seconds % 86400 / 3600), "HODIN"],
    [Math.floor(seconds % 3600 / 60), "MINUT"],
    [seconds % 60, "SEKUND"],
  ] as const;
  return <section className="tharat-cinematic-timer" aria-label="Odpočet do konce údržby">
    {units?.map(([value, label], index) => (
      <div className={`tharat-cinematic-timer__cell tharat-cinematic-timer__cell--${index}`} key={label} aria-label={`${value} ${label}`}>
        <strong>{String(value).padStart(2, "0")}</strong>

      </div>
    ))}
  </section>;
}
