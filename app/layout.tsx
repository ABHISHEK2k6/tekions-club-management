import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tekions Club Management Portal',
  description: 'A comprehensive platform for managing student clubs, events, and community engagement.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className}`} style={{ background: '#111827', color: '#ffffff', margin: 0, padding: 0 }}>
        <Providers>
          <div className="flex flex-col min-h-screen" style={{ background: '#111827', minHeight: '100vh' }}>
            {children}
          </div>
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}