import type { Metadata } from "next";
import { Unbounded, Manrope } from "next/font/google";
import AnalyticsGate from "@/components/AnalyticsGate";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://psychedelic-art-crm.vercel.app"),
  title: "Psychedelic Art — авторские психоделические картины",
  description:
    "Каталог авторских психоделических картин ручной работы. Единственные экземпляры, доставка по России и СНГ. Учебный/портфолио-проект.",
  openGraph: {
    title: "Psychedelic Art — авторские картины",
    description: "Каталог авторских психоделических картин ручной работы.",
    type: "website",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${unbounded.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <AnalyticsGate />
      </body>
    </html>
  );
}
