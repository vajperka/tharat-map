"use client";
import { useLanguage } from "./LanguageProvider";
export default function TopCopy(){const {t}=useLanguage();return <div className="top-copy">{t("header.map")}</div>}
