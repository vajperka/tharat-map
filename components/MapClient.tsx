"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Marker } from "@/lib/types";

const TYPES:any = {
  resources:[
    ["metal","Metal","⛏","#aeb8c5"],["richmetal","Rich Metal","◆","#e4c35a"],["crystal","Crystal","◆","#70d7ff"],
    ["obsidian","Obsidian","⬟","#a86cff"],["oil","Oil","●","#d8943f"],["oilvein","Oil Vein","⛽","#ff9e3d"],
    ["sulfur","Sulfur","●","#f0d84f"],["silica","Silica Pearls","◉","#a7e9ff"],["blackpearls","Black Pearls","◉","#8c62d8"],
    ["element","Element Vein","✦","#27e1c1"]
  ],
  locations:[
    ["cave","Caves","⌂","#9da9b8"],["artifact","Artifacts","◇","#b05cff"],["boss","Bosses","☠","#ff475d"],
    ["loot","Loot","▣","#58a6ff"],["base","Base Spots","⌖","#6fd69b"],["creature","Creature Spawn","◌","#ef7fce"]
  ]
};
const TYPE_MAP:any = {};
Object.values(TYPES).flat().forEach((x:any)=>TYPE_MAP[x[0]]={id:x[0],name:x[1],icon:x[2],color:x[3]});

export default function MapClient({ user }: { user:any }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any[]>([]);
  const leafletRef = useRef<any>(null);
  const [markers,setMarkers] = useState<Marker[]>([]);
  const [enabled,setEnabled] = useState<Set<string>>(new Set(Object.keys(TYPE_MAP)));
  const [query,setQuery] = useState("");
  const [coords,setCoords] = useState({lat:"—",lon:"—"});
  const [selected,setSelected] = useState<Marker|null>(null);
  const [form,setForm] = useState<any>(null);
  const [message,setMessage] = useState("");

  useEffect(()=>{ fetch("/api/markers",{cache:"no-store"}).then(r=>r.json()).then(setMarkers).catch(()=>{}); },[]);

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      if(!mapNode.current || mapRef.current) return;
      const L = await import("leaflet");
      if(cancelled) return;
      leafletRef.current=L;
      const map=L.map(mapNode.current,{crs:L.CRS.Simple,minZoom:-2,maxZoom:4,zoomControl:false,attributionControl:false});
      L.imageOverlay("/tharat-map.jpg",[[0,0],[100,100]]).addTo(map);
      map.fitBounds([[0,0],[100,100]],{padding:[10,10]});
      map.setMaxBounds([[-12,-12],[112,112]]);
      map.on("mousemove",(e:any)=>{
        setCoords({lat:Math.max(0,Math.min(100,100-e.latlng.lat)).toFixed(2),lon:Math.max(0,Math.min(100,e.latlng.lng)).toFixed(2)});
      });
      map.on("contextmenu",(e:any)=>{
        const lat=Math.max(0,Math.min(100,100-e.latlng.lat));
        const lon=Math.max(0,Math.min(100,e.latlng.lng));
        if(user) setForm({type:"oilvein",name:"",lat:+lat.toFixed(2),lon:+lon.toFixed(2),note:""});
        else setMessage("Pro přidání lokace se nejdřív přihlas.");
      });
      mapRef.current=map;
    })();
    return ()=>{cancelled=true};
  },[user]);

  const visible=useMemo(()=>markers.filter(m=>enabled.has(m.type) && (!query || `${m.name} ${m.note} ${TYPE_MAP[m.type]?.name||""}`.toLowerCase().includes(query.toLowerCase()))),[markers,enabled,query]);

  useEffect(()=>{
    const L=leafletRef.current, map=mapRef.current;
    if(!L||!map)return;
    layerRef.current.forEach(x=>map.removeLayer(x)); layerRef.current=[];
    visible.forEach(item=>{
      const t=TYPE_MAP[item.type]||TYPE_MAP.base;
      const icon=L.divIcon({className:"",html:`<div class="map-marker" style="color:${t.color};border-color:${t.color}88">${t.icon}</div>`,iconSize:[34,34],iconAnchor:[17,17]});
      const m=L.marker([100-Number(item.lat),Number(item.lon)],{icon}).addTo(map);
      m.bindTooltip(`${item.name}<br><small>${Number(item.lat).toFixed(2)} / ${Number(item.lon).toFixed(2)}</small>`,{direction:"top",offset:[0,-14]});
      m.on("click",()=>setSelected(item)); layerRef.current.push(m);
    });
  },[visible]);

  function toggle(id:string){ setEnabled(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n}) }
  async function submitMarker(e:React.FormEvent){
    e.preventDefault();
    const r=await fetch("/api/markers",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok){setMessage(d.error||"Uložení selhalo.");return}
    setForm(null); setMessage("Lokace byla odeslána adminovi ke schválení.");
    setTimeout(()=>setMessage(""),3500);
  }

  return (
    <div className="map-shell">
      <aside className="map-sidebar">
        <div className="side-title"><span>MAP FILTERS</span><button onClick={()=>setEnabled(new Set())}>CLEAR</button></div>
        <button className="quick-filter" onClick={()=>setEnabled(new Set(["metal","richmetal","crystal","obsidian","oil","oilvein","silica","blackpearls"]))}>⚡ FARMING ESSENTIALS</button>
        {Object.entries(TYPES).map(([cat,arr]:any)=>(
          <section className="filter-section" key={cat}>
            <h3>⌄ {cat.toUpperCase()}</h3>
            {arr.map((x:any)=>{
              const count=markers.filter(m=>m.type===x[0]).length;
              return <button key={x[0]} className={`filter-row ${enabled.has(x[0])?"active":""}`} onClick={()=>toggle(x[0])}>
                <i style={{background:x[3],color:x[3]}}></i><span>{x[1]}</span><b>{count}</b>
              </button>
            })}
          </section>
        ))}
        <div className="sidebar-help">Pravý klik na mapu = navrhnout lokaci. Nové body se zobrazí až po schválení adminem.</div>
      </aside>
      <div className="map-main">
        <div className="map-search"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Hledat resources, creatures, caves…" /></div>
        <div ref={mapNode} className="leaflet-map" />
        <div className="coords-box"><span>LAT</span><b>{coords.lat}</b><span>LON</span><b>{coords.lon}</b></div>
        {message && <div className="toast-msg">{message}</div>}
      </div>

      {selected && <aside className="marker-detail">
        <button className="detail-x" onClick={()=>setSelected(null)}>×</button>
        <div className="kicker">{TYPE_MAP[selected.type]?.name || selected.type}</div>
        <h2>{selected.name}</h2>
        <div className="verified">✓ VERIFIED</div>
        <div className="coord-grid"><div><span>LATITUDE</span><b>{Number(selected.lat).toFixed(2)}</b></div><div><span>LONGITUDE</span><b>{Number(selected.lon).toFixed(2)}</b></div></div>
        <p>{selected.note || "Bez poznámky."}</p>
        <button className="accent-button wide" onClick={()=>navigator.clipboard.writeText(`LAT ${Number(selected.lat).toFixed(2)}, LON ${Number(selected.lon).toFixed(2)}`)}>KOPÍROVAT LAT / LON</button>
      </aside>}

      {form && <div className="modal-bg">
        <form className="marker-form" onSubmit={submitMarker}>
          <h2>Navrhnout lokaci</h2>
          <p>Po odeslání ji uvidí admin. Veřejná bude až po schválení.</p>
          <label>TYP<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{Object.values(TYPES).flat().map((x:any)=><option key={x[0]} value={x[0]}>{x[2]} {x[1]}</option>)}</select></label>
          <label>NÁZEV<input required maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
          <div className="two"><label>LAT<input type="number" step=".01" min="0" max="100" value={form.lat} onChange={e=>setForm({...form,lat:+e.target.value})} /></label><label>LON<input type="number" step=".01" min="0" max="100" value={form.lon} onChange={e=>setForm({...form,lon:+e.target.value})} /></label></div>
          <label>POZNÁMKA<textarea maxLength={1000} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} /></label>
          <div className="form-actions"><button type="button" className="ghost-button" onClick={()=>setForm(null)}>ZRUŠIT</button><button className="accent-button">ODESLAT KE SCHVÁLENÍ</button></div>
        </form>
      </div>}
    </div>
  );
}
