import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { Presence } from "@/components/Presence";
import "./globals.css";

const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
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
  var t=localStorage.getItem('theme');
  if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  d.setAttribute('data-theme',t);
}catch(e){}
try{
  intro=!localStorage.getItem('intro')&&!location.hash&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  localStorage.setItem('intro','1');
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#121211" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${grotesk.variable} ${sourceSerif.variable} ${plexMono.variable} antialiased`}
    >
      <head>
        {/* Runs before first paint:
            - `js` opts into reveal animations (nothing is hidden without JS)
            - `intro` plays the name intro on a visitor's first visit ever, unless the visitor
              prefers reduced motion or arrived on a deep link like /#ibm
            - failsafe: if the app is slow to hydrate, show everything anyway */}
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        {children}
        <Presence />
      </body>
    </html>
  );
}
