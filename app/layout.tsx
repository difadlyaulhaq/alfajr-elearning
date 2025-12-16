import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ScreenProtection } from "@/components/shared/ScreenProtection";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScreenProtection 
          enableWatermark={true}
          watermarkText="ALFAJR E-LEARNING - CONFIDENTIAL"
        >
          {children}
        </ScreenProtection>
      </body>
    </html>
  );
}
