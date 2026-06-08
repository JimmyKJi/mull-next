"use client";

// Install guide — client logic.
// - Detects platform from user agent so the right section shows first.
// - Hooks `beforeinstallprompt` on Android Chromium to surface a
//   native install button when available (this never fires on iOS).
// - Detects when the page is already running standalone (PWA installed)
//   and shows a success state instead of the guide.

import { useEffect, useState } from "react";
import Link from "next/link";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

type Platform = "ios" | "android" | "desktop";

// Chromium's beforeinstallprompt typing — not in standard lib.dom.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "desktop";
  const ua = window.navigator.userAgent || "";
  // iOS Safari + iPadOS — iPadOS UA pretends to be Mac, but maxTouchPoints
  // gives it away. We treat both as iOS for install-guide purposes.
  const isIPad = ua.includes("Mac") && window.navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || isIPad) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari uses navigator.standalone; Android/Chromium uses the
  // display-mode media query. Check both.
  type NavWithStandalone = Navigator & { standalone?: boolean };
  if ((window.navigator as NavWithStandalone).standalone) return true;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return false;
}

export function InstallClient({ locale }: { locale: Locale }) {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installed, setInstalled] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [androidPromptResult, setAndroidPromptResult] = useState<string | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // ── Already installed: skip the guide. ────────────────────────────
  if (installed) {
    return (
      <section
        style={{
          padding: "26px 24px",
          border: "4px solid var(--color-ink)",
          background: "#F8EBC9",
          boxShadow: "6px 6px 0 0 #6B7F4F",
          textAlign: "center",
          marginTop: 12,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "#6B7F4F",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          ✓ {t("inst.installed_badge", locale)}
        </div>
        <h2
          style={{
            fontFamily: serif,
            fontSize: 24,
            fontWeight: 500,
            margin: "0 0 8px",
            color: "var(--color-ink)",
          }}
        >
          {t("inst.installed_heading", locale)}
        </h2>
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--color-ink-soft)",
            margin: "0 0 18px",
            lineHeight: 1.55,
          }}
        >
          {t("inst.installed_body", locale)}
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            background: "var(--color-ink)",
            color: "#F8EBC9",
            border: "3px solid var(--color-ink)",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ▶ {t("inst.back_to_mull", locale)}
        </Link>
      </section>
    );
  }

  // Order the sections so the user's current platform leads. The other
  // platform stays on the page so the user can share or read on another
  // device.
  const sections: Platform[] =
    platform === "ios"
      ? ["ios", "android", "desktop"]
      : platform === "android"
        ? ["android", "ios", "desktop"]
        : ["ios", "android", "desktop"];

  return (
    <div style={{ display: "grid", gap: 28, marginTop: 12 }}>
      {/* Android native prompt — only surfaces if the browser fires
          beforeinstallprompt. Chromium-only. */}
      {prompt && platform !== "ios" ? (
        <section
          style={{
            padding: "20px 22px",
            border: "4px solid var(--color-ink)",
            background: "#F8EBC9",
            boxShadow: "6px 6px 0 0 var(--color-acc)",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--color-acc-deep)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            ◆ {t("inst.onetap_badge", locale)}
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 22,
              fontWeight: 500,
              margin: "0 0 6px",
              color: "var(--color-ink)",
            }}
          >
            {t("inst.onetap_heading", locale)}
          </h2>
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--color-ink-soft)",
              margin: "0 0 14px",
              lineHeight: 1.55,
            }}
          >
            {t("inst.onetap_body", locale)}
          </p>
          <button
            type="button"
            onClick={async () => {
              if (!prompt) return;
              await prompt.prompt();
              const { outcome } = await prompt.userChoice;
              setAndroidPromptResult(outcome);
              setPrompt(null);
            }}
            style={{
              padding: "10px 18px",
              background: "var(--color-ink)",
              color: "#F8EBC9",
              border: "3px solid var(--color-ink)",
              boxShadow: "3px 3px 0 0 var(--color-acc)",
              fontFamily: pixel,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ▶ {t("inst.install_button", locale)}
          </button>
          {androidPromptResult === "dismissed" ? (
            <p style={{ marginTop: 12, fontSize: 13, color: "#7A2E2E", fontFamily: serif, fontStyle: "italic" }}>
              {t("inst.dismissed_note", locale)}
            </p>
          ) : null}
        </section>
      ) : null}

      {sections.map(p => (
        <PlatformGuide
          key={p}
          platform={p}
          isCurrent={p === platform}
          locale={locale}
        />
      ))}

      {/* Why-install footer — small, calm. */}
      <section
        style={{
          marginTop: 6,
          padding: "20px 22px",
          background: "#FFFCF4",
          border: "3px dashed #C2A062",
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--color-acc-deep)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ◇ {t("inst.why_install", locale)}
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            fontFamily: serif,
            fontSize: 15,
            color: "var(--color-ink)",
            lineHeight: 1.6,
          }}
        >
          <li>{t("inst.why_fullscreen", locale)}</li>
          <li>{t("inst.why_onetap", locale)}</li>
          <li>{t("inst.why_samesite", locale)}</li>
          <li>{t("inst.why_no_appstore", locale)}</li>
        </ul>
      </section>
    </div>
  );
}

function PlatformGuide({
  platform,
  isCurrent,
  locale,
}: {
  platform: Platform;
  isCurrent: boolean;
  locale: Locale;
}) {
  const meta = platformMeta(locale)[platform];
  return (
    <section
      style={{
        padding: "22px 24px",
        background: isCurrent ? "#FFFCF4" : "#FBFAF2",
        border: `4px solid ${isCurrent ? "var(--color-ink)" : "#C2A062"}`,
        boxShadow: isCurrent ? `5px 5px 0 0 ${meta.accent}` : "none",
        position: "relative",
      }}
    >
      {isCurrent ? (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: 14,
            fontFamily: pixel,
            fontSize: 9,
            padding: "3px 8px",
            background: meta.accent,
            color: "#FFFCF4",
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          ★ {t("inst.youre_on_this", locale)}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <span
          aria-hidden
          style={{
            fontFamily: pixel,
            fontSize: 28,
            color: meta.accent,
            lineHeight: 1,
          }}
        >
          {meta.glyph}
        </span>
        <h2
          style={{
            fontFamily: serif,
            fontSize: 22,
            fontWeight: 500,
            margin: 0,
            color: "var(--color-ink)",
            letterSpacing: "-0.2px",
          }}
        >
          {meta.title}
        </h2>
      </div>
      <p
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 14.5,
          color: "var(--color-ink-soft)",
          margin: "0 0 18px",
          lineHeight: 1.55,
        }}
      >
        {meta.preface}
      </p>

      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 12,
        }}
      >
        {meta.steps.map((step, i) => (
          <li
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 14,
              alignItems: "start",
              padding: "12px 14px",
              background: "#FFFCF4",
              border: "2px solid var(--color-ink)",
              boxShadow: `2px 2px 0 0 ${meta.accent}`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: meta.accent,
                color: "#FFFCF4",
                fontFamily: pixel,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 15.5,
                  fontWeight: 500,
                  color: "var(--color-ink)",
                  marginBottom: 2,
                  lineHeight: 1.4,
                }}
              >
                {step.title}
              </div>
              {step.detail ? (
                <div
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: 13.5,
                    color: "var(--color-ink-soft)",
                    lineHeight: 1.5,
                  }}
                >
                  {step.detail}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {meta.notes ? (
        <p
          style={{
            marginTop: 14,
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 13,
            color: "#7A4A2E",
            background: "#F5EDC8",
            border: "2px dashed var(--color-acc)",
            padding: "10px 14px",
            lineHeight: 1.5,
          }}
        >
          ★ {meta.notes}
        </p>
      ) : null}
    </section>
  );
}

function platformMeta(locale: Locale): Record<
  Platform,
  {
    title: string;
    glyph: string;
    accent: string;
    preface: string;
    steps: { title: string; detail?: string }[];
    notes?: string;
  }
> {
  return {
    ios: {
      title: t("inst.ios_title", locale),
      glyph: "◍",
      accent: "#3D5A7E",
      preface: t("inst.ios_preface", locale),
      steps: [
        {
          title: t("inst.ios_step1_title", locale),
          detail: t("inst.ios_step1_detail", locale),
        },
        {
          title: t("inst.ios_step2_title", locale),
          detail: t("inst.ios_step2_detail", locale),
        },
        {
          title: t("inst.ios_step3_title", locale),
          detail: t("inst.ios_step3_detail", locale),
        },
      ],
      notes: t("inst.ios_notes", locale),
    },
    android: {
      title: t("inst.android_title", locale),
      glyph: "◑",
      accent: "#6B7F4F",
      preface: t("inst.android_preface", locale),
      steps: [
        {
          title: t("inst.android_step1_title", locale),
          detail: t("inst.android_step1_detail", locale),
        },
        {
          title: t("inst.android_step2_title", locale),
          detail: t("inst.android_step2_detail", locale),
        },
        {
          title: t("inst.android_step3_title", locale),
          detail: t("inst.android_step3_detail", locale),
        },
      ],
      notes: t("inst.android_notes", locale),
    },
    desktop: {
      title: t("inst.desktop_title", locale),
      glyph: "◇",
      accent: "var(--color-acc)",
      preface: t("inst.desktop_preface", locale),
      steps: [
        {
          title: t("inst.desktop_step1_title", locale),
          detail: t("inst.desktop_step1_detail", locale),
        },
        {
          title: t("inst.desktop_step2_title", locale),
          detail: t("inst.desktop_step2_detail", locale),
        },
        {
          title: t("inst.desktop_step3_title", locale),
          detail: t("inst.desktop_step3_detail", locale),
        },
      ],
    },
  };
}
