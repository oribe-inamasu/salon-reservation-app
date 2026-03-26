import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "顧客管理 - サロンカルテ",
  description: "サロン用顧客管理・予診票アプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "サロンカルテ",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen pb-20`}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
