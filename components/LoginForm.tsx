"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
export default function LoginForm(){
 const router=useRouter(); const {t}=useLanguage(); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const fd=new FormData(e.currentTarget);const res=await signIn("credentials",{email:fd.get("email"),password:fd.get("password"),redirect:false});setBusy(false);if(res?.error)return setError(t("login.invalid"));router.push("/");router.refresh()}
 return <form className="auth-card" onSubmit={submit}><div className="auth-language"><LanguageSwitcher/></div><div className="kicker">THARAT ACCOUNT</div><h1>{t("login.title")}</h1><p>{t("login.text")}</p><label>E-MAIL<input name="email" type="email" required autoComplete="email"/></label><label>{t("login.password")}<input name="password" type="password" required minLength={8} autoComplete="current-password"/></label>{error&&<div className="form-error">{error}</div>}<button className="accent-button wide" disabled={busy}>{busy?t("login.busy"):t("login.submit")}</button><div className="auth-switch">{t("login.noAccount")} <a href="/register">{t("login.signup")}</a></div></form>
}
