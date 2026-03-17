import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FinanceProvider } from "@/lib/context/FinanceContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DRE Pessoal - Gest\u00e3o Financeira Inteligente",
  description: "Plataforma minimalista de finan\u00e7as pessoais com IA para an\u00e1lises, planejamento e recomenda\u00e7\u00f5es de investimentos",
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
        <FinanceProvider>{children}</FinanceProvider>
      </body>
    </html>
  );
}
