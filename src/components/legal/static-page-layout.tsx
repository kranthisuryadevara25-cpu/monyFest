'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MonyFestLogo } from '@/components/MonyFestLogo';

const FOOTER_LINKS = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refunds', label: 'Refunds Policy' },
  { href: '/shipping', label: 'Shipping Policy' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export function StaticPageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0614] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[90%] h-[90%] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute top-[10%] -right-[25%] w-[75%] h-[75%] rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <MonyFestLogo variant="header" className="flex-shrink-0" />
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="font-headline text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 text-white/70 text-lg">{description}</p>
        )}
        <div className="mt-8 space-y-4 text-white/80 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-8 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-cyan-300 [&_a]:hover:underline">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-white/60 mb-4">Quick links</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-white/70 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
          </div>
          <p className="mt-6 text-xs text-white/40">
            © {new Date().getFullYear()} MonyFest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
