import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title:       'DevaDrive — Car Loan Management',
  description: 'ระบบติดตามสินเชื่อรถยนต์หลายคัน พร้อมตารางผ่อนชำระรายงวดและสถานะการชำระ | Multi-car loan tracker with installment billing management.',
  keywords:    ['car loan', 'สินเชื่อรถยนต์', 'ผ่อนรถ', 'devakorn', 'flat rate', 'installment tracker'],
  authors:     [{ name: 'Devakorn' }],
  robots:      'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={cn("font-sans", geist.variable)}>
      <head>
        {/* Inter — English UI & numbers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Anuphan:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
