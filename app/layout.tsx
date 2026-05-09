import type { Metadata } from "next";
import "./globals.css";
import GlobalTopBar from "@/components/global-topbar";
import TopBarMount from "@/components/topbar-mount";

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary",
    title: "Mull",
    description: "Find your place on the map of how you think.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
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
        {/* Global TopBar appears on every Next.js route EXCEPT /account
            (which has its own in-page header with Sign out + Language).
            TopBarMount is a thin client wrapper that does the path check. */}
        <TopBarMount>
          <GlobalTopBar />
        </TopBarMount>
        {children}
      </body>
    </html>
  );
}
