"use client";

import { signOut } from "next-auth/react";

export default function AuthNav({ user }: { user: any }) {
  if (!user) {
    return (
      <div className="auth-nav">
        <a className="ghost-button" href="/login">Přihlásit</a>
        <a className="accent-button" href="/register">Registrace</a>
      </div>
    );
  }

  return (
    <div className="auth-nav">
      {user.role === "admin" && <a className="ghost-button admin-link" href="/admin">ADMIN</a>}
      <span className="user-chip">{user.name || user.email}</span>
      <button className="ghost-button" onClick={() => signOut({ callbackUrl: "/" })}>Odhlásit</button>
    </div>
  );
}
