"use client";

import { useEffect, useMemo, useState } from "react";
import type { Marker } from "@/lib/types";

export default function AdminDashboard() {
  const [markers, setMarkers] = useState<(Marker & {submitter_email?:string})[]>([]);
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    const r = await fetch("/api/admin/markers", { cache:"no-store" });
    if (r.ok) setMarkers(await r.json());
  }
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => filter === "all" ? markers : markers.filter(m => m.approval_status === filter), [markers, filter]);
  const pending = markers.filter(m => m.approval_status === "pending").length;
  const approved = markers.filter(m => m.approval_status === "approved").length;
  const rejected = markers.filter(m => m.approval_status === "rejected").length;

  async function action(id:number, action:"approve"|"reject"|"delete") {
    if (action === "delete" && !confirm("Opravdu marker smazat?")) return;
    setBusy(id);
    await fetch(`/api/admin/markers/${id}`, { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({action}) });
    await load(); setBusy(null);
  }

  return (
    <div className="admin-page">
      <div className="admin-top">
        <div><div className="kicker">THARAT CONTROL CENTER</div><h1>Admin Dashboard</h1></div>
        <a className="ghost-button" href="/">← Zpět na mapu</a>
      </div>
      <div className="stats">
        <div><span>ČEKAJÍCÍ</span><b>{pending}</b></div>
        <div><span>SCHVÁLENÉ</span><b>{approved}</b></div>
        <div><span>ZAMÍTNUTÉ</span><b>{rejected}</b></div>
        <div><span>CELKEM</span><b>{markers.length}</b></div>
      </div>
      <div className="admin-tabs">
        {["pending","approved","rejected","all"].map(x => <button key={x} className={filter===x?"active":""} onClick={()=>setFilter(x)}>{x.toUpperCase()}</button>)}
      </div>
      <div className="moderation-list">
        {shown.length === 0 && <div className="empty">V této kategorii zatím nic není.</div>}
        {shown.map(m => (
          <article className="moderation-card" key={m.id}>
            <div className="moderation-main">
              <div className="marker-type">{m.type.toUpperCase()}</div>
              <h3>{m.name}</h3>
              <div className="moderation-meta">LAT {Number(m.lat).toFixed(2)} · LON {Number(m.lon).toFixed(2)} · {m.submitter_name || m.submitter_email || "neznámý uživatel"}</div>
              <p>{m.note || "Bez poznámky."}</p>
            </div>
            <div className="moderation-actions">
              {m.approval_status !== "approved" && <button className="approve" disabled={busy===m.id} onClick={()=>action(m.id,"approve")}>✓ SCHVÁLIT</button>}
              {m.approval_status !== "rejected" && <button className="reject" disabled={busy===m.id} onClick={()=>action(m.id,"reject")}>✕ ZAMÍTNOUT</button>}
              <button className="delete" disabled={busy===m.id} onClick={()=>action(m.id,"delete")}>SMAZAT</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
