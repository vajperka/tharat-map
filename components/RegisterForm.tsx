"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };
    const r = await fetch("/api/register", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(payload) });
    const data = await r.json();
    if (!r.ok) { setBusy(false); return setError(data.error || "Registrace selhala."); }

    const login = await signIn("credentials", { email:payload.email, password:payload.password, redirect:false });
    setBusy(false);
    if (login?.error) return router.push("/login");
    router.push("/");
    router.refresh();
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="kicker">JOIN THARAT MAP</div>
      <h1>Registrace</h1>
      <p>Účet dostane roli <b>user</b>. Admin práva se nepřidělují registrací.</p>
      <label>JMÉNO<input name="name" required minLength={2} maxLength={40} autoComplete="name" /></label>
      <label>E-MAIL<input name="email" type="email" required autoComplete="email" /></label>
      <label>HESLO<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label>
      {error && <div className="form-error">{error}</div>}
      <button className="accent-button wide" disabled={busy}>{busy ? "Vytvářím účet…" : "VYTVOŘIT ÚČET"}</button>
      <div className="auth-switch">Už účet máš? <a href="/login">Přihlásit se</a></div>
    </form>
  );
}
