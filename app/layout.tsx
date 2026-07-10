import type { Metadata, Viewport } from "next";
import {
  Inter,
  Hanken_Grotesk,
  JetBrains_Mono,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import "./globals.css";
import { TopAppBar } from "@/components/TopAppBar";
import { BottomNav } from "@/components/BottomNav";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "سعراتي — Sa'arati",
  description:
    "اكتب وجبتك واحصل على السعرات والماكروز فورًا — Describe your meal, get instant macros.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "سعراتي",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1326",
};

// Set lang/dir before first paint to avoid an LTR->RTL flash.
const langInit = `try{var l=localStorage.getItem("saarati.lang");l=(l==="en"||l==="ar")?l:"ar";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${hanken.variable} ${jetbrains.variable} ${plexArabic.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: langInit }} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md min-h-screen pb-24">
        <I18nProvider>
          <TopAppBar />
          <main className="mt-20 px-margin-mobile max-w-2xl mx-auto">
            {children}
          </main>
          <BottomNav />
        </I18nProvider>
      </body>
    </html>
  );
}
