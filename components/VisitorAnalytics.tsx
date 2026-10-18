"use client";
import {useEffect} from "react";
export default function VisitorAnalytics(){
 useEffect(()=>{
  try{
   // One visit per browser tab session; no personal identifiers or IP addresses collected.
   if(sessionStorage.getItem("tharat-visit-recorded")==="1")return;
   const key="tharat-visit-id";
   let id=sessionStorage.getItem(key);
   if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id)}
   fetch("/api/analytics/visit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session:id}),keepalive:true})
    .then(r=>{if(r.ok)sessionStorage.setItem("tharat-visit-recorded","1")}).catch(()=>{});
  }catch{}
 },[]);
 return null;
}
