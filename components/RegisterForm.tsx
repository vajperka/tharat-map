"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
export default function RegisterForm(){
 const router=useRouter();const {t}=useLanguage();const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const fd=new FormData(e.currentTarget);const payload={name:String(fd.get("name")||""),email:String(fd.get("email")||""),password:String(fd.get("password")||"")};const r=await fetch("/api/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok){setBusy(false);return setError(t("register.fail"))}const login=await signIn("credentials",{email:payload.email,password:payload.password,redirect:false});setBusy(false);if(login?.error)return router.push("/login");router.push("/");router.refresh()}
 return <form className="auth-card" onSubmit={submit}><div className="auth-language"><LanguageSwitcher/></div><div className="kicker">JOIN THARAT MAP</div><h1>{t("register.title")}</h1><p>{t("register.text")}</p><label>{t("register.name")}<input name="name" required minLength={2} maxLength={40} autoComplete="name"/></label><label>E-MAIL<input name="email" type="email" required autoComplete="email"/></label><label>{t("register.password")}<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password"/></label>{error&&<div className="form-error">{error}</div>}<button className="accent-button wide" disabled={busy}>{busy?t("register.busy"):t("register.submit")}</button><div className="auth-switch">{t("register.hasAccount")} <a href="/login">{t("register.login")}</a></div></form>
}
