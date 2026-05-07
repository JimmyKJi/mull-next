"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return <button onClick={handleLogout} style={s.btn}>Sign out</button>;
}

const s = {
  btn: { padding:"10px 18px", background:"transparent", border:"1px solid #4A4338", borderRadius:"999px", color:"#4A4338", fontFamily:"inherit", fontSize:"14px", cursor:"pointer" },
};