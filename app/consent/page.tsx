// /consent — the long-form explanation of Mull's research-data
// policy + a toggle so users can change their consent any time.
//
// The short version is captured in <ResearchConsentGate> before the
// quiz. This page is for the user who wants to read the full thing,
// or who wants to revisit their decision later.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelWindow, PixelPageHeader } from "@/components/pixel-window";
import ConsentToggle from "./consent-toggle";

export const metadata: Metadata = {
  title: "Research consent · Mull",
  description:
    "What Mull does with your quiz data: academic research only, never sold, opt-in by choice, change your mind any time.",
  alternates: { canonical: "https://mull.world/consent" },
};

export default function ConsentPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ RESEARCH CONSENT"
        title="ABOUT YOUR DATA"
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            The honest version of what happens to your quiz answers,
            and how to change your mind.
          </p>
        }
      />

      <div className="space-y-8">
        {/* Live toggle — pulled out into a client component so the
            page can stay server-rendered around it. */}
        <PixelWindow title="YOUR CURRENT CHOICE" badge="▶ CHANGE ANY TIME">
          <ConsentToggle />
        </PixelWindow>

        <PixelWindow title="THE SHORT VERSION" badge="▶ TL;DR">
          <Prose>
            <p>
              Mull is a one-person passion project. Anonymized,
              aggregated quiz answers may be used in academic research
              about how people philosophically situate themselves.
              Nothing is sold, nothing is shared with advertisers,
              nothing is tied to your email. Opting out doesn&apos;t
              gate anything — the quiz, the Arena, the map, the daily
              dilemma, all of it works the same either way.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHAT IS COLLECTED" badge="▶ THE DATA">
          <Prose>
            <p>If you opt in, the following may be used for research:</p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <Bullet>
              Your <strong>quiz answer vector</strong> (a 16-D
              point in the philosophical space) and which archetype it
              landed in.
            </Bullet>
            <Bullet>
              Your <strong>daily dilemma responses</strong>, diary
              entries, and exercise reflections — only the written
              text and the vector deltas they produced.
            </Bullet>
            <Bullet>
              Your <strong>Arena debate transcripts</strong> and
              judge verdicts — your turns, the philosopher&apos;s
              turns, the scoring.
            </Bullet>
            <Bullet>
              Aggregate <strong>trajectory data</strong> — how your
              vector has moved over time, the patterns of drift
              across the user base.
            </Bullet>
          </ul>
          <Prose className="mt-4">
            <p>
              What is <strong>never</strong> shared:
            </p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <Bullet>
              Your <strong>email address</strong> or any identifying
              account info.
            </Bullet>
            <Bullet>
              Your <strong>IP address</strong>, geographical location,
              or any browsing telemetry beyond what Vercel Analytics
              collects (which is itself privacy-respecting).
            </Bullet>
            <Bullet>
              Anything that could be used to <strong>re-identify</strong>{" "}
              you from the dataset.
            </Bullet>
          </ul>
        </PixelWindow>

        <PixelWindow title="WHO USES IT" badge="▶ THE RESEARCH">
          <Prose>
            <p>
              The only person currently with access is{" "}
              <strong>Jimmy Ji</strong> (philosophy student at
              King&rsquo;s College London,{" "}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              ). If the data ends up contributing to a published
              paper, the paper&apos;s authors and any peer reviewers
              would see anonymized aggregates — never your individual
              responses tied to any identifier.
            </p>
            <p>
              If a research collaboration is ever proposed beyond this
              setup (e.g. a partnership with a university research
              group), an updated notice will appear here and previous
              opt-ins will be asked to re-confirm. Your default state
              cannot quietly change.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHAT WE WILL NEVER DO" badge="▶ COMMITMENTS">
          <ul className="space-y-3">
            <Bullet>
              Sell your data to commercial buyers.{" "}
              <em>Ever.</em> This is not a hedge — it is a fixed
              property of Mull.
            </Bullet>
            <Bullet>
              Use your data to train commercial AI models.
            </Bullet>
            <Bullet>
              Share individual responses with anyone outside the
              maintainer + any future named research collaborators.
            </Bullet>
            <Bullet>
              Penalize you, downgrade your experience, or hide
              features if you opt out.
            </Bullet>
            <Bullet>
              Change your consent silently — any change is opt-in,
              explicit, and explained.
            </Bullet>
          </ul>
        </PixelWindow>

        <PixelWindow title="STILL OWNS YOUR DATA" badge="▶ ALWAYS YOURS">
          <Prose>
            <p>
              You can <strong>delete your account</strong> outright at{" "}
              <Link
                href="/account/profile"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                Account → Profile
              </Link>
              . This removes your data from Mull&apos;s database in
              full. If you previously opted in, any historic exports
              already used in completed research cannot be retracted
              (academic publications are typically not editable after
              the fact), but no further data will be drawn.
            </p>
            <p>
              You can <strong>download all of your data as JSON</strong>{" "}
              from the same page — emails, quiz attempts, dilemma
              responses, diary entries, debate transcripts, the lot.
            </p>
          </Prose>
        </PixelWindow>
      </div>

      <p className="mt-12 text-[13px] leading-[1.6] text-[#8C6520] opacity-80">
        Questions, push-back, or factual corrections welcome at{" "}
        <a
          href="mailto:jimmy.kaian.ji@gmail.com"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          jimmy.kaian.ji@gmail.com
        </a>
        .
      </p>

      <p className="mt-10 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← Back to Mull
        </Link>
      </p>
    </main>
  );
}

function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "space-y-4 text-[15.5px] leading-[1.65] text-[#4A4338] [&_strong]:text-[#221E18] " +
        (className ?? "")
      }
      style={{ fontFamily: "var(--font-editorial)" }}
    >
      {children}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-2.5 text-[14.5px] leading-[1.6] text-[#4A4338]"
      style={{
        borderColor: "#B8862F",
        background: "#FFFCF4",
        fontFamily: "var(--font-editorial)",
      }}
    >
      {children}
    </li>
  );
}
