import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const BOOT = `(function(){
var d=document.documentElement,intro=false;
d.classList.add('js');
try{
  intro=!sessionStorage.getItem('intro')&&!location.hash&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  sessionStorage.setItem('intro','1');
}catch(e){}
if(intro)d.classList.add('intro');
setTimeout(function(){
  d.classList.remove('intro','intro-play');
  document.querySelectorAll('[data-reveal]').forEach(function(e){e.classList.add('is-in')});
},intro?4000:2500);
})()`;

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
      className={`${inter.variable} ${sourceSerif.variable} ${plexMono.variable} antialiased`}
    >
      <head>
        {/* Runs before first paint:
            - `js` opts into reveal animations (nothing is hidden without JS)
            - `intro` plays the name intro on the first visit of a session, unless the visitor
              prefers reduced motion or arrived on a deep link like /#ibm
            - failsafe: if the app is slow to hydrate, show everything anyway */}
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
