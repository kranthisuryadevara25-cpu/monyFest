'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const TAGLINE = 'Earn • Grow • Prosper';

/** Single source of truth: same font, gradient and color for MonyFest everywhere */
const MONYFEST_WORDMARK_CLASSES = {
  font: 'font-headline font-bold tracking-tight',
  mony: 'bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent',
  fest: 'text-white',
} as const;

type MonyFestLogoProps = {
  variant?: 'header' | 'hero' | 'login' | 'sidebar' | 'footer';
  linkToHome?: boolean;
  className?: string;
};

const variantStyles = {
  header: {
    size: 'text-2xl',
    tagline: 'text-[11px] text-white/70 mt-0.5',
  },
  hero: {
    size: 'text-[6rem] sm:text-[7.5rem] md:text-[9rem] lg:text-[12rem]',
    tagline: 'text-xl sm:text-2xl md:text-3xl text-white/80 mt-3',
  },
  login: {
    size: 'text-3xl',
    tagline: 'text-xs text-white/70 mt-1',
  },
  sidebar: {
    size: 'text-base',
    tagline: 'text-[10px] text-white/60 mt-0.5',
  },
  footer: {
    size: 'text-xl',
    tagline: 'text-[11px] text-white/60 mt-1',
  },
};

/** Renders just "MonyFest" with the official font, gradient and color. Use anywhere the brand name appears. */
export function MonyFestWordmark({
  className,
  onLightBackground,
}: {
  className?: string;
  /** Use when the wordmark is on a light background (e.g. cards) so "Fest" is visible */
  onLightBackground?: boolean;
}) {
  return (
    <span className={cn(MONYFEST_WORDMARK_CLASSES.font, className)}>
      <span className={MONYFEST_WORDMARK_CLASSES.mony}>Mony</span>
      <span className={onLightBackground ? 'text-foreground' : MONYFEST_WORDMARK_CLASSES.fest}>Fest</span>
    </span>
  );
}

export function MonyFestLogo({
  variant = 'header',
  linkToHome = true,
  className = '',
}: MonyFestLogoProps) {
  const styles = variantStyles[variant];

  const content = (
    <div className={cn('flex flex-col items-center', className)}>
      <span className={cn(MONYFEST_WORDMARK_CLASSES.font, styles.size)}>
        <span className={MONYFEST_WORDMARK_CLASSES.mony}>Mony</span>
        <span className={MONYFEST_WORDMARK_CLASSES.fest}>Fest</span>
      </span>

      <p className={cn(styles.tagline, 'font-medium tracking-wide')}>
        {TAGLINE}
      </p>
    </div>
  );

  if (linkToHome && ['header', 'footer', 'sidebar'].includes(variant)) {
    return <Link href="/">{content}</Link>;
  }

  return content;
}
