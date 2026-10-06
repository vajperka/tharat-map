"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "cs" | "en";

const translations = {
  cs: {
    common:{login:"Přihlásit",register:"Registrace",logout:"Odhlásit",admin:"ADMINISTRACE",cancel:"ZRUŠIT",delete:"SMAZAT",backMap:"← Zpět na mapu",noNote:"Bez poznámky."},
    header:{map:"INTERACTIVE RESOURCE MAP",language:"Jazyk"},
    map:{filters:"FILTRY MAPY",clear:"VYMAZAT",farming:"⚡ DŮLEŽITÉ PRO FARMENÍ",resources:"ZDROJE",locations:"LOKACE",help:"Registrovaní uživatelé mohou navrhovat nové lokace. Veřejné jsou až po schválení adminem.",reset:"RESET FILTRŮ",quick:"RYCHLÉ AKCE",legend:"LEGENDA",approvedMarker:"Schválený marker",pendingMarker:"Čeká na schválení",yourMarker:"Tvůj marker",fitMap:"Zobrazit celou mapu",search:"Hledat zdroje, tvory, jeskyně…",add:"＋ PŘIDAT MARKER",pick:"📍 Klikni na mapu a vyber umístění markeru",done:"HOTOVO",published:"MARKER PUBLIKOVÁN",verified:"✓ OVĚŘENO",openPhoto:"↗ OTEVŘÍT FOTKU",photoAlt:"Fotka lokace"},
    types:{metal:"Kov",richmetal:"Bohatý kov",crystal:"Krystal",obsidian:"Obsidián",oil:"Olej",oilvein:"Ropná žíla",sulfur:"Síra",silica:"Křemičité perly",blackpearls:"Černé perly",element:"Elementový prach",cave:"Jeskyně",artifact:"Artefakty",boss:"Bossové",loot:"Loot",base:"Místa pro základnu",creature:"Výskyt tvorů"},
    creatures:{search:"Hledat tvora…",all:"VŠICHNI",selected:"vybraní",creature:"TVOR",choose:"Vyber tvora…",required:"Vyber tvora."},
    authModal:{title:"Přidej lokaci do Tharat Map",text:"Pro přidávání markerů potřebuješ bezplatný účet.",login:"PŘIHLÁSIT SE",create:"VYTVOŘIT ÚČET"},
    marker:{new:"Nový marker",changePos:"ZMĚNIT POZICI",type:"TYP LOKACE *",name:"NÁZEV *",note:"POZNÁMKA",photo:"FOTKA LOKACE",optional:"VOLITELNÉ · JPG / PNG / WEBP · MAX 4 MB",drop:"Přetáhni fotku sem",choose:"nebo klikni a vyber soubor",change:"ZMĚNIT",remove:"ODSTRANIT",uploading:"Nahrávám fotku…",adminPublish:"ADMIN PUBLIKACE",publishNow:"Publikovat okamžitě",moderation:"ⓘ Marker před zveřejněním zkontroluje administrátor.",sending:"ODESÍLÁM…",publish:"PUBLIKOVAT MARKER",submit:"ODESLAT MARKER",nameShort:"Název musí mít alespoň 2 znaky.",noteLong:"Maximum je 1000 znaků.",imageType:"Povolené jsou pouze JPG, PNG a WebP.",imageSize:"Fotka může mít maximálně 4 MB.",saveFail:"Fotografii nebo marker se nepodařilo uložit. Zkus to znovu.",saved:"Lokace byla odeslána administrátorovi ke schválení.",live:"Marker je nyní viditelný na veřejné mapě.",discardKicker:"NEULOŽENÉ ZMĚNY",discardTitle:"Zahodit rozepsaný marker?",discardText:"Rozepsané údaje budou ztraceny.",continueEdit:"POKRAČOVAT V ÚPRAVĚ",discard:"ZAHODIT"},
    login:{title:"Přihlášení",text:"Přihlas se, pokud chceš navrhovat nové lokace do mapy.",password:"HESLO",submit:"PŘIHLÁSIT",busy:"Přihlašuji…",invalid:"Neplatný e-mail nebo heslo.",noAccount:"Nemáš účet?",signup:"Zaregistrovat se"},
    register:{title:"Registrace",text:"Účet dostane roli user. Admin práva se nepřidělují registrací.",name:"JMÉNO",password:"HESLO",submit:"VYTVOŘIT ÚČET",busy:"Vytvářím účet…",fail:"Registrace selhala.",hasAccount:"Už účet máš?",login:"Přihlásit se"},
    admin:{kicker:"THARAT CONTROL CENTER",title:"Admin Dashboard",pending:"ČEKAJÍCÍ",approved:"SCHVÁLENÉ",rejected:"ZAMÍTNUTÉ",all:"CELKEM",empty:"V této kategorii zatím nic není.",unknown:"neznámý uživatel",approve:"✓ SCHVÁLIT",reject:"✕ ZAMÍTNOUT",delete:"SMAZAT",confirmDelete:"Opravdu marker smazat?",tabs:{pending:"ČEKAJÍCÍ",approved:"SCHVÁLENÉ",rejected:"ZAMÍTNUTÉ",all:"VŠE"}}
  },
  en: {
    common:{login:"Log in",register:"Register",logout:"Log out",admin:"ADMINISTRATION",cancel:"CANCEL",delete:"DELETE",backMap:"← Back to map",noNote:"No notes."},
    header:{map:"INTERACTIVE RESOURCE MAP",language:"Language"},
    map:{filters:"MAP FILTERS",clear:"CLEAR",farming:"⚡ FARMING ESSENTIALS",resources:"RESOURCES",locations:"LOCATIONS",help:"Registered users can suggest new locations. They become public after admin approval.",reset:"RESET FILTERS",quick:"QUICK ACTIONS",legend:"LEGEND",approvedMarker:"Approved marker",pendingMarker:"Pending approval",yourMarker:"Your marker",fitMap:"Fit full map",search:"Search resources, creatures, caves…",add:"＋ ADD MARKER",pick:"📍 Click the map to choose the marker location",done:"DONE",published:"MARKER PUBLISHED",verified:"✓ VERIFIED",openPhoto:"↗ OPEN PHOTO",photoAlt:"Location photo"},
    types:{metal:"Metal",richmetal:"Rich Metal",crystal:"Crystal",obsidian:"Obsidian",oil:"Oil",oilvein:"Oil Vein",sulfur:"Sulfur",silica:"Silica Pearls",blackpearls:"Black Pearls",element:"Element Dust",cave:"Caves",artifact:"Artifacts",boss:"Bosses",loot:"Loot",base:"Base Spots",creature:"Creature Spawn"},
    creatures:{search:"Search creatures…",all:"ALL",selected:"selected",creature:"CREATURE",choose:"Choose a creature…",required:"Choose a creature."},
    authModal:{title:"Add a location to Tharat Map",text:"You need a free account to add markers.",login:"LOG IN",create:"CREATE ACCOUNT"},
    marker:{new:"New marker",changePos:"CHANGE POSITION",type:"LOCATION TYPE *",name:"NAME *",note:"NOTE",photo:"LOCATION PHOTO",optional:"OPTIONAL · JPG / PNG / WEBP · MAX 4 MB",drop:"Drop a photo here",choose:"or click to choose a file",change:"CHANGE",remove:"REMOVE",uploading:"Uploading photo…",adminPublish:"ADMIN PUBLISHING",publishNow:"Publish immediately",moderation:"ⓘ An administrator will review the marker before it becomes public.",sending:"SENDING…",publish:"PUBLISH MARKER",submit:"SUBMIT MARKER",nameShort:"Name must contain at least 2 characters.",noteLong:"Maximum length is 1000 characters.",imageType:"Only JPG, PNG and WebP are allowed.",imageSize:"The photo can be up to 4 MB.",saveFail:"The photo or marker could not be saved. Please try again.",saved:"The location was sent to an administrator for approval.",live:"The marker is now visible on the public map.",discardKicker:"UNSAVED CHANGES",discardTitle:"Discard this marker draft?",discardText:"Your unsaved information will be lost.",continueEdit:"CONTINUE EDITING",discard:"DISCARD"},
    login:{title:"Log in",text:"Log in if you want to suggest new locations for the map.",password:"PASSWORD",submit:"LOG IN",busy:"Logging in…",invalid:"Invalid email or password.",noAccount:"Don't have an account?",signup:"Register"},
    register:{title:"Register",text:"The account will receive the user role. Admin rights cannot be obtained through registration.",name:"NAME",password:"PASSWORD",submit:"CREATE ACCOUNT",busy:"Creating account…",fail:"Registration failed.",hasAccount:"Already have an account?",login:"Log in"},
    admin:{kicker:"THARAT CONTROL CENTER",title:"Admin Dashboard",pending:"PENDING",approved:"APPROVED",rejected:"REJECTED",all:"TOTAL",empty:"There is nothing in this category yet.",unknown:"unknown user",approve:"✓ APPROVE",reject:"✕ REJECT",delete:"DELETE",confirmDelete:"Are you sure you want to delete this marker?",tabs:{pending:"PENDING",approved:"APPROVED",rejected:"REJECTED",all:"ALL"}}
  }
} as const;

type Ctx = { language:Language; setLanguage:(l:Language)=>void; t:(path:string)=>string };
const LanguageContext=createContext<Ctx|null>(null);
function lookup(obj:any,path:string){return path.split(".").reduce((a,k)=>a?.[k],obj) ?? path}

export function LanguageProvider({children}:{children:React.ReactNode}){
  const [language,setLanguageState]=useState<Language>("cs");
  useEffect(()=>{const saved=localStorage.getItem("tharat-language");if(saved==="cs"||saved==="en")setLanguageState(saved)},[]);
  const setLanguage=(l:Language)=>{setLanguageState(l);localStorage.setItem("tharat-language",l);document.documentElement.lang=l};
  useEffect(()=>{document.documentElement.lang=language},[language]);
  const value=useMemo(()=>({language,setLanguage,t:(path:string)=>String(lookup(translations[language],path))}),[language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
export function useLanguage(){const c=useContext(LanguageContext);if(!c)throw new Error("useLanguage must be inside LanguageProvider");return c}
