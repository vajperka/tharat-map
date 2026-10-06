"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "./LanguageProvider";

function Flag({code}:{code:"cs"|"en"}){
  return <img className="lang-flag" src={code==="cs"?"/flags/cz.svg":"/flags/gb.svg"} alt="" aria-hidden="true"/>;
}

export default function LanguageSwitcher(){
 const {language,setLanguage,t}=useLanguage();
 const [open,setOpen]=useState(false);
 const [mounted,setMounted]=useState(false);
 const [pos,setPos]=useState({top:0,left:0,width:230});
 const buttonRef=useRef<HTMLButtonElement>(null);

 useEffect(()=>setMounted(true),[]);
 useEffect(()=>{
   if(!open)return;
   const update=()=>{
     const r=buttonRef.current?.getBoundingClientRect();
     if(!r)return;
     const width=Math.min(230,window.innerWidth-18);
     const left=Math.max(9,Math.min(r.left,window.innerWidth-width-9));
     setPos({top:r.bottom+7,left,width});
   };
   update();
   window.addEventListener("resize",update);
   window.addEventListener("orientationchange",update);
   window.addEventListener("scroll",update,true);
   return()=>{window.removeEventListener("resize",update);window.removeEventListener("orientationchange",update);window.removeEventListener("scroll",update,true)};
 },[open]);

 const menu=open&&mounted?createPortal(
   <div className="language-menu language-menu-portal" style={{top:pos.top,left:pos.left,width:pos.width}} role="menu">
    <small>{t("header.language")}</small>
    <button className={language==="cs"?"active":""} onClick={()=>{setLanguage("cs");setOpen(false)}}><Flag code="cs"/><span>Čeština</span><b>{language==="cs"?"✓":""}</b></button>
    <button className={language==="en"?"active":""} onClick={()=>{setLanguage("en");setOpen(false)}}><Flag code="en"/><span>English</span><b>{language==="en"?"✓":""}</b></button>
   </div>,document.body):null;

 return <div className="language-switcher">
  <button ref={buttonRef} className="language-button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}><Flag code={language}/><b>{language.toUpperCase()}</b><span className="lang-chevron">⌄</span></button>
  {menu}
 </div>;
}
