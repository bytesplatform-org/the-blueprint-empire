import type { Metadata, Viewport } from "next";
import { EB_Garamond, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { meta } from "@/lib/content/site";

/* Display serif, after the client's own site. Variable weight (400–800). */
const garamond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-garamond",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  colorScheme: "dark",
};

/*
 * Runs while the HTML parses, before first paint: with motion allowed, mark
 * <html> so the loader shows (CSS) and hold intros under it
 * (data-site-loading, which introsReady() and the loader release).
 */
const BEFORE_PAINT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('motion');d.setAttribute('data-site-loading','')}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${plexSans.variable} ${plexMono.variable}`}
      // The before-paint script changes <html> before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before React hydrates. */}
      <body suppressHydrationWarning>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
