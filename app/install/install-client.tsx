"use client";

// Install guide — client logic.
// - Detects platform from user agent so the right section shows first.
// - Hooks `beforeinstallprompt` on Android Chromium to surface a
//   native install button when available (this never fires on iOS).
// - Detects when the page is already running standalone (PWA installed)
//   and shows a success state instead of the guide.

import { useEffect, useState } from "react";
import Link from "next/link";

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

export function InstallClient() {
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
          border: "4px solid #221E18",
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
          ✓ Installed
        </div>
        <h2
          style={{
            fontFamily: serif,
            fontSize: 24,
            fontWeight: 500,
            margin: "0 0 8px",
            color: "#221E18",
          }}
        >
          You&rsquo;re running Mull standalone.
        </h2>
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 15,
            color: "#4A4338",
            margin: "0 0 18px",
            lineHeight: 1.55,
          }}
        >
          Mull is already on your home screen. Pin the Daily Spar or your
          Pilgrimage as a shortcut — long-press the icon.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            background: "#221E18",
            color: "#F8EBC9",
            border: "3px solid #221E18",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ▶ Back to Mull
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
            border: "4px solid #221E18",
            background: "#F8EBC9",
            boxShadow: "6px 6px 0 0 #B8862F",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "#8C6520",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            ◆ One-tap install
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 22,
              fontWeight: 500,
              margin: "0 0 6px",
              color: "#221E18",
            }}
          >
            Your browser can install Mull directly.
          </h2>
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 15,
              color: "#4A4338",
              margin: "0 0 14px",
              lineHeight: 1.55,
            }}
          >
            Skip the manual steps below — tap install and Chromium does the rest.
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
              background: "#221E18",
              color: "#F8EBC9",
              border: "3px solid #221E18",
              boxShadow: "3px 3px 0 0 #B8862F",
              fontFamily: pixel,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ▶ Install Mull
          </button>
          {androidPromptResult === "dismissed" ? (
            <p style={{ marginTop: 12, fontSize: 13, color: "#7A2E2E", fontFamily: serif, fontStyle: "italic" }}>
              No problem — follow the Android steps below whenever you&rsquo;re ready.
            </p>
          ) : null}
        </section>
      ) : null}

      {sections.map(p => (
        <PlatformGuide
          key={p}
          platform={p}
          isCurrent={p === platform}
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
            color: "#8C6520",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ◇ Why install?
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            fontFamily: serif,
            fontSize: 15,
            color: "#221E18",
            lineHeight: 1.6,
          }}
        >
          <li>The URL bar disappears — full screen, like a native app.</li>
          <li>One tap on the home tile opens the Daily Spar or your Pilgrimage.</li>
          <li>It&rsquo;s the same site — no data sync, no separate account.</li>
          <li>No App Store gatekeeper, no ratings, no auto-updates that change the layout overnight.</li>
        </ul>
      </section>
    </div>
  );
}

function PlatformGuide({
  platform,
  isCurrent,
}: {
  platform: Platform;
  isCurrent: boolean;
}) {
  const meta = PLATFORM_META[platform];
  return (
    <section
      style={{
        padding: "22px 24px",
        background: isCurrent ? "#FFFCF4" : "#FBFAF2",
        border: `4px solid ${isCurrent ? "#221E18" : "#C2A062"}`,
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
          ★ YOU&rsquo;RE ON THIS
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
            color: "#221E18",
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
          color: "#4A4338",
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
              border: "2px solid #221E18",
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
                  color: "#221E18",
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
                    color: "#4A4338",
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
            border: "2px dashed #B8862F",
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

const PLATFORM_META: Record<
  Platform,
  {
    title: string;
    glyph: string;
    accent: string;
    preface: string;
    steps: { title: string; detail?: string }[];
    notes?: string;
  }
> = {
  ios: {
    title: "iPhone or iPad (Safari)",
    glyph: "◍",
    accent: "#3D5A7E",
    preface: "iOS only lets Safari install web apps — Chrome and Firefox on iPhone can't do this. If you opened this in another browser, copy the URL and open it in Safari first.",
    steps: [
      {
        title: "Tap the Share button at the bottom of Safari",
        detail: "It's the square with an arrow pointing up. If you're in landscape on an iPad, it's at the top.",
      },
      {
        title: 'Scroll down and tap "Add to Home Screen"',
        detail: "It's about halfway down the share sheet, in the second row of grey actions.",
      },
      {
        title: 'Confirm the name "Mull" and tap "Add"',
        detail: "iOS may suggest a longer name — feel free to shorten it. The tile is now on your home screen.",
      },
    ],
    notes: "If you don't see \"Add to Home Screen\", you're either in private browsing or in a browser that isn't Safari. Both block the install.",
  },
  android: {
    title: "Android (Chrome, Edge, Brave)",
    glyph: "◑",
    accent: "#6B7F4F",
    preface: "Most Android browsers built on Chromium can install Mull. Firefox on Android also supports it, with slightly different menu wording.",
    steps: [
      {
        title: "Tap the three-dot menu in the top-right",
        detail: "It's labeled \"More\" or shown as ⋮. In Firefox the menu lives in the bottom-right.",
      },
      {
        title: 'Tap "Install app" or "Add to Home screen"',
        detail: "Chrome and Edge show \"Install app\" once they detect Mull as a PWA. Firefox calls it \"Install\" or \"Add to Home screen\" depending on version.",
      },
      {
        title: "Confirm and the tile drops onto your home screen",
        detail: "Some launchers (Samsung, Pixel) ask whether you want a shortcut or a full install — choose Install for the full-screen experience.",
      },
    ],
    notes: "Long-press the Mull tile after install for shortcuts straight to Daily Spar, Pilgrimage, or The Inheritor.",
  },
  desktop: {
    title: "Desktop (Chrome, Edge, Brave)",
    glyph: "◇",
    accent: "#B8862F",
    preface: "Chromium browsers on macOS, Windows, and Linux can install Mull as a standalone window. Safari on macOS doesn't support web app install — for that, just bookmark and pin the tab.",
    steps: [
      {
        title: "Look for the install icon in the address bar",
        detail: "A small monitor-with-a-down-arrow icon appears at the right edge of the URL bar when a site is installable.",
      },
      {
        title: 'Click it, then click "Install"',
        detail: "Mull opens in its own window, separate from your other tabs. The Dock / Taskbar gets a Mull entry.",
      },
      {
        title: "Pin it for quick access",
        detail: "Right-click the Dock icon (macOS) or Taskbar icon (Windows) and choose to keep it there.",
      },
    ],
  },
};
