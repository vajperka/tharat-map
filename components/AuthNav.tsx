"use client";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
export default function AuthNav({ user }: { user: any }) {
 const {t}=useLanguage(); const [profile,setProfile]=useState<any>(null);
 useEffect(()=>{if(user) fetch("/api/profile").then(r=>r.ok?r.json():null).then(d=>d?.user&&setProfile(d.user)).catch(()=>{})},[user]);
 const shown=profile||user;
 return <div className="auth-nav"><LanguageSwitcher/>{!user?<><a className="ghost-button" href="/login">{t("common.login")}</a><a className="accent-button" href="/register">{t("common.register")}</a></>:<>{user.role==="admin"&&<a className="ghost-button admin-link" href="/admin">{t("common.admin")}</a>}<a className="user-chip profile-chip" href="/profile">{shown?.avatar_url?<img src={shown.avatar_url} alt=""/>:<span className="profile-chip-fallback">{(shown?.name||shown?.email||"U").slice(0,1).toUpperCase()}</span>}<b>{shown?.name||shown?.email}</b></a><button className="ghost-button" onClick={()=>signOut({callbackUrl:"/"})}>{t("common.logout")}</button></>}</div>
}
