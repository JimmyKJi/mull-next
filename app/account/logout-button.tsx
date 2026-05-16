"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { t, type Locale } from "@/lib/translations";

// LogoutButton — sits in the top-right of /account. Pixel ghost chip
// (transparent fill, 2px ink border, no shadow) so it reads as a
// secondary action — the LanguageSwitcher next to it has similar
// visual weight.

export default function LogoutButton({ locale = 'en' }: { locale?: Locale }) {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="pixel-press"
      style={{
        padding: '6px 14px',
        background: 'transparent',
        border: '2px solid #221E18',
        borderRadius: 0,
        color: '#4A4338',
        fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
        fontSize: 11,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end), background 80ms steps(2, end)',
      }}
    >
      {t('auth.signout', locale).toUpperCase()}
    </button>
  );
}
