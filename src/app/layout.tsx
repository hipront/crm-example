import type { Metadata } from "next";
import { Unbounded, Manrope } from "next/font/google";
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
  title: "Psychedelic Art — авторские психоделические картины",
  description:
    "Каталог авторских психоделических картин ручной работы. Единственные экземпляры, доставка по России и СНГ. Учебный/портфолио-проект.",
  openGraph: {
    title: "Psychedelic Art — авторские картины",
    description: "Каталог авторских психоделических картин ручной работы.",
    type: "website",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
