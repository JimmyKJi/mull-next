"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else { router.push("/account"); router.refresh(); }
  }

  return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Log in</h1>
      <p style={s.lede}>Welcome back.</p>
      <form onSubmit={handleLogin} style={s.form}>
        <input type="email" placeholder="your@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)} required style={s.input} />
        <input type="password" placeholder="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required style={s.input} />
        <button type="submit" disabled={loading} style={s.btn}>
          {loading ? "Signing in…" : "Log in"}
        </button>
        {error && <div style={s.err}>{error}</div>}
      </form>
      <p style={s.alt}>Don't have an account? <Link href="/signup" style={s.link}>Sign up</Link></p>
    </div>
  );
}

const s = {
  wrap: { maxWidth:"420px", margin:"80px auto", padding:"24px", fontFamily:"ui-sans-serif,-apple-system,sans-serif", color:"#221E18" },
  h1: { fontFamily:"Cormorant Garamond,Georgia,serif", fontSize:"44px", fontWeight:500, margin:"0 0 12px" },
  lede: { color:"#4A4338", fontSize:"16px", margin:"0 0 32px" },
  form: { display:"grid" as const, gap:"12px" },
  input: { padding:"12px 16px", border:"1px solid #D6CDB6", borderRadius:"10px", fontFamily:"inherit", fontSize:"15px", background:"#fff", outline:"none" },
  btn: { padding:"14px 18px", border:"none", borderRadius:"999px", background:"#221E18", color:"#FAF6EC", fontFamily:"inherit", fontSize:"15px", fontWeight:500, cursor:"pointer", marginTop:"8px" },
  err: { padding:"10px 14px", background:"#FBF1EE", border:"1px solid #E5C9C0", borderRadius:"8px", color:"#8C3717", fontSize:"14px" },
  alt: { marginTop:"24px", fontSize:"14px", color:"#4A4338" },
  link: { color:"#8C6520", textDecoration:"underline" },
};