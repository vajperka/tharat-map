"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import HumanCheck from "./HumanCheck";

export default function LoginForm(){
 const router=useRouter(); const {t}=useLanguage();
 const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 const [captchaToken,setCaptchaToken]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); if(!captchaToken){setError(t("captcha.required"));return;}
  setBusy(true);setError("");
  try {
   const fd=new FormData(e.currentTarget);
   const res=await signIn("credentials",{email:fd.get("email"),password:fd.get("password"),captchaToken,redirect:false});
   if(res?.error){setError(t("login.invalid"));setCaptchaToken("");return;}
   router.push("/");router.refresh();
  }catch{setError(t("captcha.failed"))}finally{setBusy(false);}
 }
 async function discordLogin(){
  if(!captchaToken){setError(t("captcha.required"));return;}
  setBusy(true);setError("");
  try {
   const response=await fetch("/api/auth/discord-human",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:captchaToken})});
   if(!response.ok){setError(t("captcha.failed"));setCaptchaToken("");return;}
   await signIn("discord",{callbackUrl:"/"});
  }catch{setError(t("captcha.failed"))}finally{setBusy(false);}
 }
 return <form className="auth-card" onSubmit={submit}>
 <div className="auth-language"><LanguageSwitcher/></div>
 <div className="kicker">THARAT ACCOUNT</div><h1>{t("login.title")}</h1><p>{t("login.text")}</p>
 <label>E-MAIL<input name="email" type="email" required autoComplete="email"/></label>
 <label>{t("login.password")}<input name="password" type="password" required minLength={8} autoComplete="current-password"/></label>
 <HumanCheck onToken={setCaptchaToken}/>
 {error&&<div className="form-error">{error}</div>}
 <button className="accent-button wide" disabled={busy||!captchaToken}>{busy?t("login.busy"):t("login.submit")}</button>
 <div className="auth-divider"><span>{t("captcha.or")}</span></div>
 <button type="button" className="discord-login wide" disabled={busy||!captchaToken} onClick={discordLogin}><b>◉</b> {t("captcha.discord")}</button>
 <div className="auth-switch">{t("login.noAccount")} <a href="/register">{t("login.signup")}</a></div>
 </form>;
}
