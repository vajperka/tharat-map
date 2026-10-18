"use client";
import {useEffect,useState} from "react";
import {useLanguage} from "./LanguageProvider";
type Point={lat:number;lon:number;name:string;tag?:string;k?:string;type?:string};
type Reply={role:"user"|"assistant";text:string;points?:Point[]};
const aliases:Record<string,string[]>={oilvein:["ropna zila","ropne zily","oil vein"],artifact:["artefakt","artifact"],loot:["bedna","bedny","loot","crate"],cratevolume:["spawn beden","spawn bedny","crate spawn"],creature:["dinosaurus","dinosaura","dino","tvor","creature"],metal:["kov","metal"],crystal:["krystal","crystal"],obsidian:["obsidian"],polymer:["polymer"],oil:["ropa","oil"]};
function norm(s:string){return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function category(p:Point){return p.k==="dino"?"creature":p.k==="oil"?"oilvein":p.k==="crate"?"loot":p.k==="volume"?"cratevolume":p.k==="artifact"?"artifact":p.type||""}
export default function TharatAssistant(){
 const {language}=useLanguage(),cs=language==="cs";
 const [open,setOpen]=useState(false),[value,setValue]=useState(""),[busy,setBusy]=useState(false);
 const [points,setPoints]=useState<Point[]>([]);
 const [chat,setChat]=useState<Reply[]>([]);
 useEffect(()=>{Promise.all([fetch("/official-tharat-locations.json").then(r=>r.ok?r.json():[]).catch(()=>[]),fetch("/api/markers").then(r=>r.ok?r.json():[]).catch(()=>[])]).then(([official,community])=>{
 const items=Array.isArray(community)?community:Array.isArray(community?.markers)?community.markers:[];
 setPoints([...official,...items.filter((x:any)=>x.approval_status==="approved").map((x:any)=>({lat:Number(x.lat),lon:Number(x.lon),name:String(x.name||""),type:String(x.type||""),tag:String(x.creature_name||"")}))].filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)));
 })},[]);
 const welcome=cs?"Ahoj! 🦖 Napiš, jakou surovinu nebo dinosaura hledáš. Ukážu ti nalezené lokace na mapě.":"Hi! 🦖 Ask for a resource or creature and I'll show matching locations on the map.";
 const suggestions=cs?["Kde najdu Titanoboa?","Ukaž ropné žíly","Kde jsou artefakty?"]:["Where is Titanoboa?","Show oil veins","Where are artifacts?"];
 function send(raw:string){
 const q=norm(raw);if(!q)return;
 setValue("");setBusy(true);
 const candidates=points.map(p=>({p,tag:norm(p.tag||""),name:norm(p.name||""),kind:category(p)}));
 const matches=candidates.map(({p,tag,name,kind})=>{
 let score=0;
 if(tag&&tag.length>2&&q.includes(tag))score=100+tag.length;
 if(name&&name.length>3&&q.includes(name))score=Math.max(score,100+name.length);
 const variants=aliases[kind]||[];
 if(variants.some(v=>q.includes(norm(v))))score=Math.max(score,70);
 if(kind&&q.includes(norm(kind)))score=Math.max(score,70);
 return {p,score};
 }).filter(x=>x.score>0);
 const max=Math.max(0,...matches.map(x=>x.score));
 const found=matches.filter(x=>x.score===max).slice(0,30).map(x=>x.p);
 const text=found.length?(cs?`Našel jsem ${matches.filter(x=>x.score===max).length} odpovídajících záznamů. Zobrazuji až 30 lokací. Klikni na souřadnice pro přiblížení mapy. Jde o jednorázový sken, nikoliv zaručené aktuální spawny.`:`I found ${matches.filter(x=>x.score===max).length} matching records and show up to 30 locations. Click coordinates to zoom in. Server-scan positions are not guaranteed current spawns.`):(cs?"Pro tento dotaz nemám v mapových datech ověřenou odpověď. Zkus konkrétní název dinosaura nebo suroviny.":"I couldn't find this in the map data. Try a specific creature or resource name.");
 setChat(old=>[...old,{role:"user",text:raw},{role:"assistant",text,points:found}]);setBusy(false);
 if(found.length)window.dispatchEvent(new CustomEvent("tharat-assistant-locations",{detail:{points:found}}));
 }
 function focus(p:Point){window.dispatchEvent(new CustomEvent("tharat-assistant-focus",{detail:{lat:p.lat,lon:p.lon}}));setOpen(false)}
 return <div className="tharat-ai-shell">
 {open&&<section className="tharat-ai-panel" role="dialog" aria-label={cs?"Průvodce mapou":"Map guide"}>
 <header><div><strong>✦ THARAT GUIDE</strong><small>{cs?"Asistent mapových dat":"Map data assistant"}</small></div><button onClick={()=>setOpen(false)} aria-label={cs?"Zavřít":"Close"}>×</button></header>
 <div className="tharat-ai-messages"><p className="tharat-ai-bubble">{welcome}</p>{chat.map((m,i)=><div key={i} className={"tharat-ai-bubble "+(m.role==="user"?"mine":"")}><span>{m.text}</span>{m.points&&m.points.length>0&&<div className="tharat-ai-results">{m.points.slice(0,8).map((p,j)=><button key={j} onClick={()=>focus(p)}>{p.tag||p.name||category(p)} · {p.lat.toFixed(2)}, {p.lon.toFixed(2)} ↗</button>)}</div>}</div>)}{busy&&<p>…</p>}</div>
 {chat.length===0&&<div className="tharat-ai-chips">{suggestions.map(s=><button key={s} onClick={()=>send(s)}>{s}</button>)}</div>}
 <form onSubmit={e=>{e.preventDefault();send(value)}}><input maxLength={140} value={value} onChange={e=>setValue(e.target.value)} placeholder={cs?"Kde najdu…?":"Where can I find…?"} aria-label={cs?"Dotaz":"Question"}/><button type="submit" disabled={!value.trim()||busy}>➤</button></form>
 <footer>{cs?"Odpovědi vycházejí z mapových dat, nikoliv z AI modelu.":"Answers use map data, not a generative AI model."}</footer>
 </section>}
 <button className="tharat-ai-launch" onClick={()=>setOpen(x=>!x)} aria-label={cs?"Otevřít průvodce mapou":"Open map guide"} aria-expanded={open}>{open?"×":"✦"}</button>
 </div>
}
