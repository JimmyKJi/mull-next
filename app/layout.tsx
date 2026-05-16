import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
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

// Critical for mobile — without this iOS Safari renders at desktop
// scale and the layout looks zoomed-out and broken. mull.html has
// the meta tag inline; this covers every Next.js route.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Don't lock max-scale; users zooming for accessibility is fine.
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mull.world"),
  title: {
    default: "Mull",
    template: "%s — Mull",
  },
  description: "Find your place on the map of how you think.",
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
      className={`${cormorant.variable} ${pressStart2P.variable} ${vt323.variable}`}
      style={
        {
          colorScheme: "light",
          // Three font tokens, three roles. See DESIGN-DIRECTION.md.
          ["--font-display" as string]:
            "var(--font-pixel-display), 'Courier New', monospace",
          ["--font-body" as string]:
            "var(--font-pixel-body), 'Courier New', monospace",
          ["--font-prose" as string]:
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
      </body>
    </html>
  );
}
