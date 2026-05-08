import type { Metadata } from "next";
import "./globals.css";

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
          fontFamily: "ui-sans-serif, -apple-system, 'Inter', 'Helvetica Neue', Arial, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {children}
      </body>
    </html>
  );
}