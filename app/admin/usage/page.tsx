// /admin/usage — admin dashboard for AI spend + kill-switch status.
//
// Renders the current daily/monthly spend, the caps, the pause
// status, and per-bucket counts. Admin-gated; non-admins get 404.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isAdminUserId } from "@/lib/admin";
import { readAiSpend } from "@/lib/rate-limit";

export const metadata: Metadata = {
  title: "Usage · Admin · Mull",
  robots: { index: false, follow: false, nocache: true },
};

const AI_BUCKETS = [
  "dilemma_submit",
  "reflection",
  "diary",
  "exercise",
  "spar_play",
  "arena_turn",
  "arena_judge",
  "argument_diary",
];

const BUCKET_LABELS: Record<string, string> = {
  dilemma_submit: "Daily Dilemma",
  reflection: "Reflection (exercise)",
  diary: "Diary",
  exercise: "Exercise reflect",
  spar_play: "Daily Spar",
  arena_turn: "Arena turn (Haiku)",
  arena_judge: "Arena judge (Sonnet)",
  argument_diary: "Argument Diary",
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default async function AdminUsagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminUserId(user?.id)) {
    notFound();
  }

  const spend = await readAiSpend();

  // Per-bucket counts.
  let perBucketDay: Record<string, number> = {};
  let perBucketMonth: Record<string, number> = {};
  try {
    const admin = createAdminClient();
    const now = Date.now();
    const dayCutoff = new Date(now - 24 * 3600_000).toISOString();
    const monthCutoff = new Date(now - 31 * 24 * 3600_000).toISOString();
    const { data: dayRows } = await admin
      .from("rate_limit_events")
      .select("bucket")
      .gte("created_at", dayCutoff);
    const { data: monthRows } = await admin
      .from("rate_limit_events")
      .select("bucket")
      .gte("created_at", monthCutoff);
    for (const b of AI_BUCKETS) {
      perBucketDay[b] = (dayRows ?? []).filter((r) => r.bucket === b).length;
      perBucketMonth[b] = (monthRows ?? []).filter((r) => r.bucket === b).length;
    }
  } catch {
    // ignore — admin can still see spend status
  }

  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <div
        className="mb-6 text-[10px] tracking-[0.24em] text-acc-deep"
        style={{ fontFamily: pixel }}
      >
        ▶ ADMIN · USAGE DASHBOARD
      </div>
      <h1
        className="text-[36px] leading-[1.45] tracking-[0.04em] text-ink sm:text-[44px]"
        style={{ fontFamily: pixel, textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))" }}
      >
        AI SPEND + KILL SWITCH
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SpendStat
          label="TODAY"
          cents={spend.dailyCents}
          capCents={spend.dailyCapCents}
        />
        <SpendStat
          label="MONTH (31D)"
          cents={spend.monthlyCents}
          capCents={spend.monthlyCapCents}
        />
        <div
          className="border-[3px] border-ink p-3 text-center"
          style={{
            background: spend.paused ? "#8C3717" : "#2F5D5C",
            color: "var(--color-acc-soft)",
            boxShadow: "3px 3px 0 0 var(--color-acc)",
          }}
        >
          <div
            className="text-[28px] leading-none"
            style={{ fontFamily: pixel }}
          >
            {spend.paused ? "PAUSED" : "OPEN"}
          </div>
          <div
            className="mt-1 text-[9px] tracking-[0.22em]"
            style={{ fontFamily: pixel, color: "#F8C75E" }}
          >
            AI STATUS
          </div>
        </div>
      </div>

      {spend.paused && spend.reason && (
        <div
          className="mt-4 border-[3px] border-ink bg-[#FEE9E0] p-4"
          style={{ boxShadow: "3px 3px 0 0 #8C3717" }}
        >
          <div
            className="text-[10px] tracking-[0.22em] text-[#8C3717]"
            style={{ fontFamily: pixel }}
          >
            ▶ WHY PAUSED
          </div>
          <p
            className="mt-2 text-[15px] leading-[1.55] text-[#1A1820]"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {spend.reason}
          </p>
        </div>
      )}

      <h2
        className="mt-12 text-[10px] tracking-[0.24em] text-acc-deep"
        style={{ fontFamily: pixel }}
      >
        ▶ PER-BUCKET BREAKDOWN
      </h2>
      <div
        className="mt-3 overflow-x-auto border-[3px] border-ink bg-[#FFFCF4]"
        style={{ boxShadow: "3px 3px 0 0 var(--color-acc)" }}
      >
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr
              className="border-b-2 border-ink bg-[#FBF6E8] text-[10px] tracking-[0.18em]"
              style={{ fontFamily: pixel, color: "var(--color-acc-deep)" }}
            >
              <th className="px-3 py-2 text-left">BUCKET</th>
              <th className="px-3 py-2 text-right">TODAY</th>
              <th className="px-3 py-2 text-right">MONTH</th>
            </tr>
          </thead>
          <tbody>
            {AI_BUCKETS.map((b) => (
              <tr key={b} className="border-b border-[#EBE3CA]">
                <td
                  className="px-3 py-2 text-ink"
                  style={{ fontFamily: "var(--font-editorial)" }}
                >
                  {BUCKET_LABELS[b] ?? b}
                </td>
                <td
                  className="px-3 py-2 text-right text-ink"
                  style={{ fontFamily: pixel }}
                >
                  {perBucketDay[b] ?? 0}
                </td>
                <td
                  className="px-3 py-2 text-right text-ink"
                  style={{ fontFamily: pixel }}
                >
                  {perBucketMonth[b] ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2
        className="mt-10 text-[10px] tracking-[0.24em] text-acc-deep"
        style={{ fontFamily: pixel }}
      >
        ▶ CONTROLS (ENV VARS)
      </h2>
      <div
        className="mt-3 border-2 border-ink bg-[#1A1612] p-4 text-[13px] text-acc-soft"
        style={{ fontFamily: "Menlo, monospace" }}
      >
        <div>
          <strong className="text-[#F8C75E]">MULL_DAILY_SPEND_CAP_CENTS</strong>
          {" = "}
          {process.env.MULL_DAILY_SPEND_CAP_CENTS ?? "2500 (default $25)"}
        </div>
        <div className="mt-1">
          <strong className="text-[#F8C75E]">MULL_MONTHLY_SPEND_CAP_CENTS</strong>
          {" = "}
          {process.env.MULL_MONTHLY_SPEND_CAP_CENTS ?? "60000 (default $600)"}
        </div>
        <div className="mt-1">
          <strong className="text-[#F8C75E]">MULL_KILL_SWITCH</strong>
          {" = "}
          {process.env.MULL_KILL_SWITCH ?? "(unset — caps apply normally)"}
        </div>
        <div className="mt-3 text-[12px] text-[#E5DCC0]">
          Set <strong>MULL_KILL_SWITCH=on</strong> in Vercel env to
          force-pause all AI immediately. Set{" "}
          <strong>=off</strong> to disable caps (testing only). Any
          other value or unset = caps apply normally.
        </div>
      </div>

      <p className="mt-10 text-center text-[13px] text-acc-deep">
        <Link
          href="/account"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          ← Account
        </Link>
      </p>
    </main>
  );
}

function SpendStat({
  label,
  cents,
  capCents,
}: {
  label: string;
  cents: number;
  capCents: number;
}) {
  const pct = Math.min(100, Math.round((cents / capCents) * 100));
  const color =
    pct >= 100 ? "#8C3717" : pct >= 80 ? "#C7522A" : pct >= 50 ? "var(--color-acc)" : "#2F5D5C";
  return (
    <div
      className="border-[3px] border-ink bg-[#FFFCF4] p-3 text-center"
      style={{ boxShadow: `3px 3px 0 0 ${color}` }}
    >
      <div className="text-[24px] leading-none text-ink" style={{ fontFamily: pixel }}>
        ${(cents / 100).toFixed(2)}
      </div>
      <div
        className="mt-1 text-[10px] tracking-[0.18em] text-acc-deep"
        style={{ fontFamily: pixel }}
      >
        OF ${(capCents / 100).toFixed(0)} CAP · {pct}%
      </div>
      <div className="mt-2 h-2 border border-ink bg-[#FBF6E8]">
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
      <div
        className="mt-1 text-[9px] tracking-[0.22em]"
        style={{ fontFamily: pixel, color }}
      >
        {label}
      </div>
    </div>
  );
}
