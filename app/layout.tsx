import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "CatatSini",
  description: "Aplikasi pencatatan keuangan AI mobile-first dengan Supabase dan Vercel."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${manrope.variable} bg-background font-body text-on-surface antialiased`}>
        <div className="pointer-events-none fixed inset-0 bg-hero-fade" />
        <div className="pointer-events-none fixed left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-primary-fixed/20 blur-3xl" />
        <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] h-72 w-72 rounded-full bg-tertiary-fixed/20 blur-3xl" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
