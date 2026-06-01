// AccountAdminPanel — admin-only at-a-glance card on /account.
//
// Surfaces the launch-night vitals (signups, AI spend, quiz attempts
// today, errors in the last hour) directly on Jimmy's account page
// so he doesn't have to navigate to /admin or /admin/usage for a
// quick check. Each cell links through to the full dashboard for
// the deeper view.
//
// Server component. Uses the service-role admin client; only renders
// for users whose id is in ADMIN_USER_IDS (caller verifies — passing
// `false` as `isAdmin` short-circuits to render nothing).

import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { readAiSpend } from "@/lib/rate-limit";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

type Props = {
  isAdmin: boolean;
};

type AdminStats = {
  signups: { total: number; day: number; hour: number };
  quizToday: number;
  dilemmaToday: number;
  errorsHour: number;
  spend: {
    dailyCents: number;
    monthlyCents: number;
    dailyCapCents: number;
    monthlyCapCents: number;
    paused: boolean;
    reason: string | null;
  };
};

async function loadAdminStats(): Promise<AdminStats | null> {
  try {
    const admin = createAdminClient();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600_000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 86400_000).toISOString();
    const todayKey = now.toISOString().slice(0, 10);

    const [usersRes, quizToday, dilemmaToday, errorsHour, spend] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("quiz_attempts").select("*", { count: "exact", head: true }).gte("taken_at", oneDayAgo),
      admin.from("dilemma_responses").select("*", { count: "exact", head: true }).eq("dilemma_date", todayKey),
      admin.from("error_log").select("*", { count: "exact", head: true }).gte("created_at", oneHourAgo),
      readAiSpend(),
    ]);

    const users = usersRes.data?.users || [];
    return {
      signups: {
        total: users.length,
        day: users.filter(u => u.created_at && u.created_at >= oneDayAgo).length,
        hour: users.filter(u => u.created_at && u.created_at >= oneHourAgo).length,
      },
      quizToday: quizToday.count ?? 0,
      dilemmaToday: dilemmaToday.count ?? 0,
      errorsHour: errorsHour.count ?? 0,
      spend,
    };
  } catch (err) {
    // Don't blow up /account if the admin queries fail — log + render
    // the fallback link card. This page is the user's home base and
    // shouldn't 500 because the admin stats are flaky.
    console.warn("[account-admin-panel] failed to load stats:", err);
    return null;
  }
}

function fmtCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function pct(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return Math.min(100, Math.round((num / denom) * 100));
}

export async function AccountAdminPanel({ isAdmin }: Props) {
  if (!isAdmin) return null;
  const stats = await loadAdminStats();

  // Fallback: render at least the dashboard links so admin can still
  // get to the deeper pages even if the inline stats failed.
  if (!stats) {
    return (
      <section
        aria-label="Admin shortcuts"
        style={{
          marginBottom: 24,
          padding: "18px 22px",
          background: "#FFFCF4",
          border: "4px solid #221E18",
          boxShadow: "4px 4px 0 0 #B8862F",
        }}
      >
        <div style={{ fontFamily: pixel, fontSize: 10, color: "#8C6520", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
          ▸ ADMIN · STATS UNAVAILABLE
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <AdminLink href="/admin" label="LAUNCH DASHBOARD" />
          <AdminLink href="/admin/usage" label="AI USAGE" />
          <AdminLink href="/admin/research" label="RESEARCH" />
        </div>
      </section>
    );
  }

  const dailyPct = pct(stats.spend.dailyCents, stats.spend.dailyCapCents);
  const monthlyPct = pct(stats.spend.monthlyCents, stats.spend.monthlyCapCents);
  const dailyHot = dailyPct >= 75;
  const monthlyHot = monthlyPct >= 75;

  return (
    <section
      aria-label="Admin at-a-glance"
      style={{
        marginBottom: 28,
        padding: "20px 22px",
        background: "#FFFCF4",
        border: "4px solid #221E18",
        boxShadow: "5px 5px 0 0 #B8862F",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontFamily: pixel, fontSize: 10, color: "#8C6520", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          ▸ ADMIN · AT A GLANCE
        </div>
        {stats.spend.paused ? (
          <span style={{
            fontFamily: pixel, fontSize: 10,
            padding: "3px 8px",
            background: "#7A2E2E", color: "#F5E0E0",
            letterSpacing: 0.6, textTransform: "uppercase",
          }}>
            ✖ AI PAUSED — {(stats.spend.reason || "kill switch").toUpperCase()}
          </span>
        ) : null}
      </div>

      <ul
        style={{
          listStyle: "none", padding: 0, margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
        }}
      >
        <StatCell
          label="Users"
          value={stats.signups.total.toLocaleString()}
          delta={`+${stats.signups.day} · 24h`}
          accent="#2F5D5C"
        />
        <StatCell
          label="Quiz · 24h"
          value={stats.quizToday.toLocaleString()}
          delta={null}
          accent="#B8862F"
        />
        <StatCell
          label="Dilemma · today"
          value={stats.dilemmaToday.toLocaleString()}
          delta={null}
          accent="#7A4A2E"
        />
        <StatCell
          label="AI · today"
          value={fmtCents(stats.spend.dailyCents)}
          delta={`${dailyPct}% of ${fmtCents(stats.spend.dailyCapCents)}`}
          accent={dailyHot ? "#7A2E2E" : "#5A3A6A"}
        />
        <StatCell
          label="AI · month"
          value={fmtCents(stats.spend.monthlyCents)}
          delta={`${monthlyPct}% of ${fmtCents(stats.spend.monthlyCapCents)}`}
          accent={monthlyHot ? "#7A2E2E" : "#5A3A6A"}
        />
        <StatCell
          label="Errors · 1h"
          value={stats.errorsHour.toLocaleString()}
          delta={stats.errorsHour > 0 ? "investigate" : "quiet"}
          accent={stats.errorsHour > 0 ? "#7A2E2E" : "#2F5D5C"}
        />
      </ul>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <AdminLink href="/admin" label="LAUNCH DASHBOARD ▶" />
        <AdminLink href="/admin/research" label="RESEARCH CONSOLE ▶" />
        <AdminLink href="/admin/usage" label="AI USAGE DEEP DIVE ▶" />
        <AdminLink href="/account/curate" label="CURATE PICKS ▶" />
      </div>
    </section>
  );
}

function StatCell({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string;
  delta: string | null;
  accent: string;
}) {
  return (
    <li
      style={{
        padding: "10px 12px",
        background: "#FBFAF2",
        border: `2px solid ${accent}`,
        borderRadius: 0,
      }}
    >
      <div
        style={{
          fontFamily: pixel, fontSize: 9, letterSpacing: 0.4,
          color: accent, textTransform: "uppercase", marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: pixel, fontSize: 22,
          color: "#221E18", lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {delta ? (
        <div
          style={{
            fontFamily: serif, fontStyle: "italic", fontSize: 12,
            color: "#4A4338", marginTop: 4, lineHeight: 1.3,
          }}
        >
          {delta}
        </div>
      ) : null}
    </li>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="pixel-press"
      style={{
        display: "inline-block",
        padding: "8px 12px",
        background: "#221E18",
        color: "#F8EBC9",
        border: "2px solid #221E18",
        boxShadow: "2px 2px 0 0 #B8862F",
        fontFamily: pixel,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}
