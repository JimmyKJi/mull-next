import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lora, Pixelify_Sans, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import CapabilityToast from "@/components/capability-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FeedbackButton from "@/components/feedback-button";

// v3 pixel-game typography stack. Three faces with very different
// roles — see DESIGN-DIRECTION.md "Visual language tokens".
//
// pressStart2P  — the pixel display face. Page titles, section
//                 labels, small UI captions ("MULL", "THE MAP",
//                 chunky button labels). Used sparingly because
//                 it's noisy at body sizes.
// vt323         — pixel monospace, readable at body size. Used
//                 for in-game text: hover tooltips, button labels,
//                 quiz prompts, philosopher names in the legend.
// cormorant     — kept for the long-form editorial body inside
//                 archetype/philosopher detail pages — the
//                 "library book inside the game" beat.

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pixel-display",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pixel-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Lora — substantial body serif. Kept available but no longer the
// default body face (see Pixelify Sans below — 2026-05-24 swap).
// Pages that have specifically opted into Lora keep working; new
// surfaces use Pixelify Sans for the "pixel-game world" unity.
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

// Pixelify Sans — the bridge font. Modern sans-serif with subtle
// pixel-art texture; readable at body sizes (16-18px) while still
// reading as "of the pixel-game world".
//
// Added 2026-05-24 after the editorial serif (Cormorant / Lora)
// felt out of place against the pixel chrome on most surfaces.
// Becomes the default body font for the BULK of the site.
//
// Cormorant Garamond stays for true long-form editorial essays
// (archetype detail, philosopher detail, /about, /methodology,
// topic explainers, vs matchups) — the "library book inside the
// game" beat that those long-read pages were designed around.
// Everything else picks Pixelify Sans.
const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixel-sans",
  display: "swap",
});

// Critical for mobile — without this iOS Safari renders at desktop
// scale and the layout looks zoomed-out and broken. mull.html has
// the meta tag inline; this covers every Next.js route.
//
// viewportFit: 'cover' is the trigger that enables env(safe-area-inset-*)
// values to be non-zero on iPhones with home-indicators. Without it,
// the inset values resolve to 0 and the .safe-bottom utilities have
// no effect. Pair this with the `themeColor` so iOS gives the
// standalone PWA a matching status-bar background when installed.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF6EC",
  // Don't lock max-scale; users zooming for accessibility is fine.
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mull.world"),
  title: {
    default: "Mull",
    template: "%s — Mull",
  },
  description: "Find your place on the map of how you think.",
  manifest: "/manifest.webmanifest",
  // appleWebApp tells iOS Safari "this site is a standalone app
  // when installed" — strips the URL bar, gives it the home-screen
  // title we choose, and uses the touch icon for the home grid.
  appleWebApp: {
    capable: true,
    title: "Mull",
    statusBarStyle: "default",
  },
  // Next.js's appleWebApp.capable: true emits the title + status-bar
  // tags but no longer emits the `*-capable` meta (deprecated in
  // favour of manifest display: standalone). Older iOS versions and
  // some Android launchers still read these — set both the Apple +
  // generic forms explicitly so the install experience is identical
  // across the install matrix.
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Mull",
    description: "Find your place on the map of how you think.",
    siteName: "Mull",
    type: "website",
    url: "https://mull.world",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Mull — find your place on the map of how you think." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mull",
    description: "Find your place on the map of how you think.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable} ${pixelifySans.variable} ${pressStart2P.variable} ${vt323.variable}`}
      style={
        {
          colorScheme: "light",
          // Font tokens. See STYLE-GUIDE.md §3.
          //   --font-display  = chunky pixel labels (Press Start 2P)
          //   --font-body     = pixel monospace (VT323)
          //   --font-prose    = the DEFAULT body font sitewide
          //                     (Pixelify Sans — pixel-styled sans,
          //                     readable at body sizes)
          //   --font-editorial = long-form essay serif (Cormorant
          //                     Garamond) — opt-in for archetype /
          //                     philosopher / about / methodology /
          //                     topic / vs pages where the "library
          //                     book inside the game" beat lives
          ["--font-display" as string]:
            "var(--font-pixel-display), 'Courier New', monospace",
          ["--font-body" as string]:
            "var(--font-pixel-body), 'Courier New', monospace",
          ["--font-prose" as string]:
            "var(--font-pixel-sans), system-ui, sans-serif",
          ["--font-editorial" as string]:
            "var(--font-cormorant), Georgia, serif",
        } as React.CSSProperties
      }
    >
      <body
        style={{
          background: "#FAF6EC",
          color: "#221E18",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          fontFamily:
            "ui-sans-serif, -apple-system, 'Inter', 'Helvetica Neue', Arial, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* Skip-to-content keyboard shortcut. Renders off-screen
            until it gets focus, then slides in. Lets keyboard users
            jump past the sticky nav (which has 6+ tabbable links)
            and land directly in the page body. */}
        <a href="#main-content" className="skip-link">▸ SKIP TO CONTENT</a>
        {/* SiteNav is the v2 sticky top bar — wordmark, page links,
            Cmd-K command palette, Account button. Visible on every
            route. Replaces the old GlobalTopBar / TopBarMount pair
            (kept in repo for now in case anything still imports them). */}
        <SiteNav />
        <div id="main-content">{children}</div>
        {/* Vercel Web Analytics — page views, referrers, locations.
            Custom events fire from individual pages via the `track()`
            helper from @vercel/analytics. Privacy-respecting (no
            cookies, no PII, GDPR-compliant). */}
        <Analytics />
        {/* Speed Insights — Core Web Vitals + page load times. Free
            on Hobby tier up to 10k data points/month. */}
        <SpeedInsights />
        {/* Feedback button — floating bottom-right on every Next.js
            route. Submissions land in the Supabase 'feedback' table
            (admin-readable only). Critical for capturing launch
            sentiment from friends in the first 48 hours. */}
        <FeedbackButton />
        {/* Capability toast — listens for the cross-tab event and
            fires a Stardew-style "+3 RIGOR" badge on completion of
            any retention surface action. Renders nothing until an
            event arrives. */}
        <CapabilityToast />
      </body>
    </html>
  );
}
