"use client";

import { useCallback, useEffect, useState } from "react";

type Status = { enabled: boolean; endsAt: string | null };

function localDate(iso: string): string {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function MaintenanceSettings({ language }: { language: string }) {
  const cs = language === "cs";
  const [status, setStatus] = useState<Status | null>(null);
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/maintenance", { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
    const next = result as Status;
    setStatus(next);
    setDate(next.endsAt && new Date(next.endsAt).getTime() > Date.now() ? localDate(next.endsAt) : "");
  }, []);

  useEffect(() => { refresh().catch(e => setError(String(e))); }, [refresh]);

  async function save(enabled: boolean) {
    if (!status || busy) return;
    setError(""); setNotice("");
    if (enabled !== status.enabled) {
      const question = enabled
        ? (cs ? "Zapnout režim údržby? Návštěvníci uvidí oznámení." : "Enable maintenance mode for visitors?")
        : (cs ? "Vypnout údržbu a zpřístupnit web všem?" : "Disable maintenance and reopen the site?");
      if (!window.confirm(question)) return;
    }
    let endsAt: string | null = null;
    if (enabled && date) {
      const ms = new Date(date).getTime();
      if (!Number.isFinite(ms)) { setError(cs ? "Neplatné datum nebo čas." : "Invalid date or time."); return; }
      if (ms <= Date.now() + 60_000) {
        // Stale input should never prevent a manual maintenance switch.
        setDate("");
        setNotice(cs ? "Zadaný čas už uplynul nebo je příliš blízko. Údržba se zapne bez automatického ukončení." : "The selected time has passed or is too soon. Maintenance will run without an automatic end.");
      } else if (ms > Date.now() + 90 * 86400_000) {
        setError(cs ? "Automatické ukončení může být nejvýše za 90 dní." : "The automatic end must be within 90 days.");
        return;
      } else {
        endsAt = new Date(ms).toISOString();
      }
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, endsAt }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
      setStatus({ enabled: !!result.enabled, endsAt: result.endsAt || null });
      if (!enabled) setDate("");
      else if (result.endsAt) setDate(localDate(result.endsAt));
      if (!(enabled && date && !endsAt)) setNotice(cs ? "Nastavení úspěšně uloženo." : "Settings saved successfully.");
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  return <section className="tharat-maintenance-admin" aria-label={cs ? "Nastavení režimu údržby" : "Maintenance settings"}>
    <header className="tharat-maintenance-admin__header">
      <div className="tharat-maintenance-admin__icon" aria-hidden="true">⚒</div>
      <div><span className="tharat-maintenance-admin__eyebrow">THARAT · SITE CONTROL</span>
        <h2>{cs ? "Režim údržby" : "Maintenance mode"}</h2>
        <p>{cs ? "Ovládej dostupnost webu a naplánuj automatické spuštění." : "Control site availability and schedule automatic reopening."}</p>
      </div>
    </header>
    <div className="tharat-maintenance-admin__body">
      <div className="tharat-maintenance-admin__status">
        <div><span className="tharat-maintenance-admin__status-label">{cs ? "AKTUÁLNÍ STAV WEBU" : "CURRENT SITE STATUS"}</span>
          <strong className={status?.enabled ? "is-offline" : "is-online"}>
            <span className="tharat-maintenance-admin__dot" aria-hidden="true" />
            {status === null ? (cs ? "Načítání…" : "Loading…") : status.enabled ? (cs ? "PROBÍHÁ ÚDRŽBA" : "MAINTENANCE ACTIVE") : (cs ? "WEB JE VEŘEJNÝ" : "WEBSITE IS LIVE")}
          </strong>
        </div>
        <span className="tharat-maintenance-admin__status-note">{cs ? "Administrátoři mají přístup i během údržby." : "Administrators retain access during maintenance."}</span>
      </div>
      <div className="tharat-maintenance-admin__schedule">
        <div className="tharat-maintenance-admin__schedule-heading"><span aria-hidden="true">◷</span><div>
          <strong>{cs ? "Automatické ukončení údržby" : "Automatic maintenance end"}</strong>
          <small>{cs ? "Volitelné · místní čas · maximálně 90 dní" : "Optional · local time · maximum 90 days"}</small>
        </div></div>
        <div className="tharat-maintenance-admin__date-row">
          <input aria-label={cs ? "Datum a čas ukončení údržby" : "Maintenance end date and time"} type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
          <button type="button" className="tharat-maintenance-admin__clear" disabled={!date || busy} onClick={() => setDate("")}>{cs ? "Vymazat čas" : "Clear time"}</button>
        </div>
        <p>{cs ? "Bez vyplněného času poběží údržba až do ručního vypnutí." : "Leave the date empty to keep maintenance active until manually disabled."}</p>
        {status?.enabled && status.endsAt && <div className="tharat-maintenance-admin__planned">{cs ? "Naplánované spuštění:" : "Scheduled reopening:"} <b>{new Date(status.endsAt).toLocaleString(cs ? "cs-CZ" : "en-GB")}</b></div>}
      </div>
      <div className="tharat-maintenance-admin__actions">
        <button type="button" disabled={busy || !status} className={status?.enabled ? "tharat-maintenance-admin__btn tharat-maintenance-admin__btn--green" : "tharat-maintenance-admin__btn tharat-maintenance-admin__btn--red"} onClick={() => save(!status!.enabled)}>
          {busy ? (cs ? "Ukládání…" : "Saving…") : status?.enabled ? (cs ? "✓ VYPNOUT ÚDRŽBU" : "✓ DISABLE MAINTENANCE") : (cs ? "⚒ ZAPNOUT ÚDRŽBU" : "⚒ ENABLE MAINTENANCE")}
        </button>
        {status?.enabled && <button type="button" className="tharat-maintenance-admin__btn tharat-maintenance-admin__btn--outline" disabled={busy} onClick={() => save(true)}>{cs ? "ULOŽIT ČAS UKONČENÍ" : "SAVE END TIME"}</button>}
      </div>
      {notice && <p className="tharat-maintenance-admin__notice" role="status">{notice}</p>}
      {error && <p className="tharat-maintenance-admin__error" role="alert">{error}</p>}
    </div>
  </section>;
}
