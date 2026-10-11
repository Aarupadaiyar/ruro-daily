import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Source_Serif_4 } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Headlines + article body: a screen-optimised serif that is easy on the eyes.
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", weight: ["400", "600", "700"] });
// Wordmark only: a classic Garamond to match the RURO logo.
const logo = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-logo", weight: ["600"] });

export const metadata: Metadata = {
  title: {
    default: `${SITE.name}: ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  icons: {
    icon: "/ruro-mark.svg",
  },
  alternates: {
    types: { "application/rss+xml": `${SITE.url}/rss.xml` },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
