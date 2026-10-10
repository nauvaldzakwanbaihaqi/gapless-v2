import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GaplessProvider } from "@/contexts/CareerContext";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Career Explorer | AI Career Discovery Assessment",
  description:
    "Discover your ideal tech career path with an AI-powered personality and skills assessment. Find out if you're a Creator, Builder, Thinker, or Connector.",
  keywords: ["career assessment", "AI career", "career discovery", "tech career"],
  icons: {
    icon: "/Asset 1.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <GaplessProvider>
            {children}
          </GaplessProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
