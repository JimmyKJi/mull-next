import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import LogoutButton from "./logout-button";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Your account</h1>
      <p style={s.lede}>You're signed in as <strong>{user.email}</strong>.</p>
      <div style={s.card}>
        <p style={s.note}>Quiz results and dimensional history will live here once we wire that up. Right now this page just confirms auth is working end-to-end.</p>
      </div>
      <div style={s.actions}>
        <Link href="/" style={s.link}>← Back to Mull</Link>
        <LogoutButton />
      </div>
    </div>
  );
}

const s = {
  wrap: { maxWidth:"560px", margin:"80px auto", padding:"24px", fontFamily:"ui-sans-serif,-apple-system,sans-serif", color:"#221E18" },
  h1: { fontFamily:"Cormorant Garamond,Georgia,serif", fontSize:"44px", fontWeight:500, margin:"0 0 12px" },
  lede: { color:"#4A4338", fontSize:"16px", margin:"0 0 24px" },
  card: { padding:"20px 24px", background:"#F1EAD8", border:"1px solid #D6CDB6", borderRadius:"12px", marginBottom:"24px" },
  note: { margin:0, color:"#4A4338", fontSize:"14px", lineHeight:1.5 },
  actions: { display:"flex", justifyContent:"space-between", alignItems:"center", gap:"16px", flexWrap:"wrap" as const },
  link: { color:"#8C6520", textDecoration:"underline", fontSize:"15px" },
};