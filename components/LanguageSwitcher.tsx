"use client";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
export default function LanguageSwitcher(){
 const {language,setLanguage,t}=useLanguage(); const [open,setOpen]=useState(false);
 return <div className="language-switcher">
  <button className="language-button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}><span>{language==="cs"?"🇨🇿":"🇬🇧"}</span><b>{language.toUpperCase()}</b><span className="lang-chevron">⌄</span></button>
  {open&&<div className="language-menu"><small>{t("header.language")}</small><button className={language==="cs"?"active":""} onClick={()=>{setLanguage("cs");setOpen(false)}}><span>🇨🇿</span><span>Čeština</span><b>{language==="cs"?"✓":""}</b></button><button className={language==="en"?"active":""} onClick={()=>{setLanguage("en");setOpen(false)}}><span>🇬🇧</span><span>English</span><b>{language==="en"?"✓":""}</b></button></div>}
 </div>
}
