import type { Metadata } from 'next';
import { Inter, Noto_Sans_Telugu } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const telugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-telugu',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KATHA — నీ కథ. మన తీర్పు.',
  description: 'Write original Telugu movie stories, get judged by TFI fans, cast your dream hero & director, and rank top on Story of the Week.',
  keywords: ['Tollywood', 'Telugu Movie Stories', 'TFI Fans', 'Screenwriting', 'Katha', 'Telugu Cinema', 'Movie Pitch'],
  openGraph: {
    title: 'KATHA — Write it. Get judged. Get noticed.',
    description: 'Tollywood-focused community platform for original movie story ideas.',
    url: 'https://katha.app',
    siteName: 'KATHA',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="te" className={`${inter.variable} ${telugu.variable}`}>
      <body className="bg-[#0A0A0C] text-zinc-100 antialiased selection:bg-red-600 selection:text-white min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-12">{children}</main>
          
          {/* Footer */}
          <footer className="hidden md:block bg-zinc-950 border-t border-zinc-900 py-8 text-center text-xs text-zinc-500 font-sans">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase tracking-wider">KATHA</span>
                <span>—</span>
                <span className="text-amber-400 font-semibold">నీ కథ. మన తీర్పు.</span>
              </div>
              <p>© 2026 KATHA Community Platform. Built for real Telugu movie storytellers & TFI fans.</p>
            </div>
          </footer>

          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
