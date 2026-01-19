import type { Metadata } from "next";
import { Inter, Space_Grotesk } from 'next/font/google';
import Image from "next/image";
import Script from "next/script";
import "@/styles/globals.css";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: "Hytale Servers List 2026 - Best Multiplayer Servers",
    template: "%s | HytaleTop"
  },
  description: "Browse the #1 Hytale servers list with 100+ servers. Find the best Hytale multiplayer servers for PvP, survival, minigames & roleplay. Real-time player counts, ping tests & community reviews.",
  keywords: [
    "hytale servers list",
    "hytale servers",
    "hytale server list",
    "best hytale servers",
    "hytale multiplayer",
    "hytale pvp servers",
    "hytale survival servers",
    "hytale minigames",
    "hytale roleplay servers",
    "hytale top 100",
    "find hytale server",
    "hytale server browser",
    "hytale community servers",
    "hytale online servers",
  ],
  authors: [{ name: "HytaleTop.fun" }],
  creator: "HytaleTop",
  publisher: "HytaleTop",
  metadataBase: new URL("https://www.hytaletop.fun"),
  alternates: {
    canonical: "https://www.hytaletop.fun",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.hytaletop.fun",
    siteName: "HytaleTop",
    title: "Hytale Servers List - Find The Best Hytale Multiplayer Servers",
    description: "Browse 100+ Hytale servers with real-time player counts, ping tests & community reviews. Find PvP, survival & minigame servers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HytaleTop - #1 Hytale Servers List",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hytale Servers List 2026 - Find Best Servers | HytaleTop",
    description: "Browse 100+ Hytale servers with real-time ping tests and community reviews.",
    images: ["/og-image.png"],
    creator: "@HytaleTop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Add your GSC verification code
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://firebaseapp.com" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="https://hytaleservers-97c14.firebaseapp.com" />
      </head>
      {/* Google Analytics - load lazily to not block render */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-J951CMS1KC"
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-J951CMS1KC');
        `}
      </Script>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          {/* Fixed Background Image */}
          <div className="fixed-background" aria-hidden="true">
            <Image
              src="/hytale-hero-bg.png"
              alt=""
              fill
              priority
              quality={80}
              style={{ objectFit: 'cover' }}
            />
            <div className="background-overlay" />
          </div>

          {/* Ambient Effects */}
          <div className="ambient-background" aria-hidden="true" />
          <div className="fireflies">
            <div className="firefly" />
            <div className="firefly" />
            <div className="firefly" />
            <div className="firefly" />
            <div className="firefly" />
          </div>
          <Header />
          <PromoBanner />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
