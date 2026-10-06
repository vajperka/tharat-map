"use client";

import { useEffect, useState } from "react";

export default function TharatLoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    let value = 8;
    const timer = window.setInterval(() => {
      value = Math.min(96, value + Math.max(2, Math.round((100 - value) * 0.12)));
      setProgress(value);
    }, 90);

    const ready = () => {
      window.clearInterval(timer);
      setProgress(100);
      window.setTimeout(() => setLeaving(true), 220);
      window.setTimeout(() => setVisible(false), 780);
    };

    if (document.readyState === "complete") {
      window.setTimeout(ready, 900);
    } else {
      window.addEventListener("load", () => window.setTimeout(ready, 650), { once: true });
    }

    const safety = window.setTimeout(ready, 3200);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(safety);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`tharat-loader${leaving ? " is-leaving" : ""}`} role="status" aria-live="polite" aria-label="Loading THARAT">
      <div className="tharat-loader-grid" />
      <div className="tharat-loader-radar radar-one" />
      <div className="tharat-loader-radar radar-two" />
      <div className="tharat-loader-content">
        <div className="tharat-loader-kicker"><span /> ARKSURVIVAL.CZ <span /></div>
        <div className="tharat-loader-emblem">
          <div className="tharat-loader-orbit orbit-a" />
          <div className="tharat-loader-orbit orbit-b" />
          <div className="tharat-loader-diamond"><img src="/tharat-dino-logo.png" alt="" /></div>
        </div>
        <div className="tharat-loader-title">THARAT</div>
        <div className="tharat-loader-subtitle">ANCIENT SANDS <b>•</b> RESOURCE MAP</div>
        <div className="tharat-loader-progress">
          <div className="tharat-loader-progress-head"><span>INITIALIZING MAP SYSTEM</span><b>{progress}%</b></div>
          <div className="tharat-loader-track"><i style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="tharat-loader-status"><i /> CONNECTING TO THARAT NETWORK</div>
      </div>
      <div className="tharat-loader-corner corner-tl" /><div className="tharat-loader-corner corner-tr" />
      <div className="tharat-loader-corner corner-bl" /><div className="tharat-loader-corner corner-br" />
    </div>
  );
}
