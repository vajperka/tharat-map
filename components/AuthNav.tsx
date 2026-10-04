"use client";
import { signOut } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
export default function AuthNav({ user }: { user: any }) {
 const {t}=useLanguage();
 return <div className="auth-nav"><LanguageSwitcher/>{!user?<><a className="ghost-button" href="/login">{t("common.login")}</a><a className="accent-button" href="/register">{t("common.register")}</a></>:<>{user.role==="admin"&&<a className="ghost-button admin-link" href="/admin">{t("common.admin")}</a>}<span className="user-chip">{user.name||user.email}</span><button className="ghost-button" onClick={()=>signOut({callbackUrl:"/"})}>{t("common.logout")}</button></>}</div>
}
