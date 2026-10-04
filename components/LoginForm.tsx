"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setBusy(false);
    if (res?.error) return setError("Neplatný e-mail nebo heslo.");
    router.push("/");
    router.refresh();
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="kicker">THARAT ACCOUNT</div>
      <h1>Přihlášení</h1>
      <p>Přihlas se, pokud chceš navrhovat nové lokace do mapy.</p>
      <label>E-MAIL<input name="email" type="email" required autoComplete="email" /></label>
      <label>HESLO<input name="password" type="password" required minLength={8} autoComplete="current-password" /></label>
      {error && <div className="form-error">{error}</div>}
      <button className="accent-button wide" disabled={busy}>{busy ? "Přihlašuji…" : "PŘIHLÁSIT"}</button>
      <div className="auth-switch">Nemáš účet? <a href="/register">Zaregistrovat se</a></div>
    </form>
  );
}
