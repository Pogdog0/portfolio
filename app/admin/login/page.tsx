"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      if (response.ok) { router.replace("/admin"); router.refresh(); return; }
      const result = await response.json().catch(() => ({ error: "Invalid email or password." }));
      setError(result.error ?? "Invalid email or password.");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return <main className="login-shell"><div className="login-grid" /><section className="login-card"><Link className="admin-brand" href="/"><span className="brand-mark">P</span><span>Pogdog<br /><em>CONTENT OS</em></span></Link><span className="admin-breadcrumb">SECURE AREA / ADMIN</span><h1>Welcome back.</h1><p>Manage the work, signal, and stories behind the portfolio.</p><form onSubmit={submit}><label><span>Email</span><input required disabled={pending} name="email" type="email" autoComplete="username" placeholder="you@example.com" /></label><label><span>Password</span><input required disabled={pending} name="password" type="password" autoComplete="current-password" placeholder="••••••••••••" /></label><button className="admin-add" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"} <span>↗</span></button>{error && <p className="login-note" role="alert">{error}</p>}</form><Link className="login-back" href="/">← Back to portfolio</Link></section></main>;
}
