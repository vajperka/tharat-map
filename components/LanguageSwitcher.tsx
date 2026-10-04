"use client";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

function Flag({code}:{code:"cs"|"en"}){
  return <img className="lang-flag" src={code==="cs"?"/flags/cz.svg":"/flags/gb.svg"} alt="" aria-hidden="true"/>;
}

export default function LanguageSwitcher(){
 const {language,setLanguage,t}=useLanguage(); const [open,setOpen]=useState(false);
 return <div className="language-switcher">
  <button className="language-button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}><Flag code={language}/><b>{language.toUpperCase()}</b><span className="lang-chevron">⌄</span></button>
  {open&&<div className="language-menu"><small>{t("header.language")}</small><button className={language==="cs"?"active":""} onClick={()=>{setLanguage("cs");setOpen(false)}}><Flag code="cs"/><span>Čeština</span><b>{language==="cs"?"✓":""}</b></button><button className={language==="en"?"active":""} onClick={()=>{setLanguage("en");setOpen(false)}}><Flag code="en"/><span>English</span><b>{language==="en"?"✓":""}</b></button></div>}
 </div>
}
