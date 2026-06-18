import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title:       'Financial Hub',
  description: 'Manage your personal budget and fleet loans in one unified hub. Track cash flow, expenses, and vehicle installments seamlessly.',
  keywords:    ['financial hub', 'personal budget', 'fleet manager', 'car loan', 'cash flow', 'devakorn'],
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
