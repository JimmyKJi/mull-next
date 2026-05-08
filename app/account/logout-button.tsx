"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { t, type Locale } from "@/lib/translations";

export default function LogoutButton({ locale = 'en' }: { locale?: Locale }) {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return <button onClick={handleLogout} style={s.btn}>{t('auth.signout', locale)}</button>;
}

const s = {
  btn: { padding:"10px 18px", background:"transparent", border:"1px solid #4A4338", borderRadius:"999px", color:"#4A4338", fontFamily:"inherit", fontSize:"14px", cursor:"pointer" },
};