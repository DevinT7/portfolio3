import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Devin Thenuwara — Software Engineer",
  description: "Software engineer, UT Austin ’28.",
  openGraph: {
    title: "Devin Thenuwara — Software Engineer",
    description: "Software engineer, UT Austin ’28.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f3ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${instrument.variable} ${plexMono.variable} antialiased`}
    >
      <head>
        {/* Opt into reveal animations only when JS runs, so nothing is hidden without it.
            If the app is slow to hydrate, reveal everything after 2.5s anyway. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){document.querySelectorAll('[data-reveal]').forEach(function(e){e.classList.add('is-in')})},2500)",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
