"use client";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
export default function AuthNav({ user }: { user: any }) {
 const {t}=useLanguage(); const [profile,setProfile]=useState<any>(null); const [notifs,setNotifs]=useState<any>({items:[],unread:0}); const [notifOpen,setNotifOpen]=useState(false);
 useEffect(()=>{if(user) fetch("/api/notifications").then(r=>r.json()).then(setNotifs).catch(()=>{})},[user]);
 useEffect(()=>{if(user) fetch("/api/profile").then(r=>r.ok?r.json():null).then(d=>d?.user&&setProfile(d.user)).catch(()=>{})},[user]);
 const shown=profile||user;
 return <div className="auth-nav"><LanguageSwitcher/>{!user?<><a className="ghost-button" href="/login">{t("common.login")}</a><a className="accent-button" href="/register">{t("common.register")}</a></>:<><div className="notif-wrap"><button className="notif-button" onClick={async()=>{setNotifOpen(v=>!v);if(!notifOpen&&notifs.unread){await fetch("/api/notifications",{method:"POST"});setNotifs((n:any)=>({...n,unread:0}))}}}>🔔{notifs.unread>0&&<b>{notifs.unread}</b>}</button>{notifOpen&&<div className="notif-menu"><strong>UPOZORNĚNÍ</strong>{notifs.items.length?notifs.items.map((n:any)=><a key={n.id} href={n.href||"#"}>{n.text}<small>{new Date(n.created_at).toLocaleDateString("cs-CZ")}</small></a>):<p>Zatím žádná upozornění.</p>}</div>}</div>{user.role==="admin"&&<a className="ghost-button admin-link" href="/admin">{t("common.admin")}</a>}<a className="user-chip profile-chip" href="/profile">{shown?.avatar_url?<img src={shown.avatar_url} alt=""/>:<span className="profile-chip-fallback">{(shown?.name||shown?.email||"U").slice(0,1).toUpperCase()}</span>}<b>{shown?.name||shown?.email}</b></a><button className="ghost-button" onClick={()=>signOut({callbackUrl:"/"})}>{t("common.logout")}</button></>}</div>
}
