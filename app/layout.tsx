import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'highlight.js/styles/github-dark.css';
import { AuthProvider } from "@/context/AuthContext";
import GlobalProtectionOverlay from "@/components/protection/GlobalProtectionOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " Alfajr E-learning",
  description: "Platform E-learning Alfajr Umroh",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alfajr Learning",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-screenshot">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Disable iOS content capture */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Android PWA protection */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        <AuthProvider>
          <div className="screenshot-protection">
            {children}
          </div>
          
          {/* Global Protection Overlay */}
          <GlobalProtectionOverlay />
        </AuthProvider>
        
        {/* Hidden watermark canvas */}
        <canvas id="protection-watermark" style={{ display: 'none' }} />
        
        {/* Noise filter for content protection */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          </filter>
        </svg>
      </body>
    </html>
  );
}