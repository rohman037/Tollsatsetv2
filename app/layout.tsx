import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
};

export const metadata: Metadata = {
  title: 'Tools Satset AI - Multi-Engine Content Suite',
  description: 'Platform AI All-in-One untuk Kreator: TikTok Shop Affiliate, Ide Konten AEO Viral, Video to Prompt AI, Ekstraktor Frame HD, dan Prompt Foto Nano Samama.',
  openGraph: {
    title: 'Tools Satset AI - Multi-Engine Content Suite',
    description: 'Platform AI All-in-One untuk Kreator TikTok & Media Sosial.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tools Satset AI - Multi-Engine Content Suite',
    description: 'Platform AI All-in-One untuk Kreator TikTok & Media Sosial.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth antialiased">
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
