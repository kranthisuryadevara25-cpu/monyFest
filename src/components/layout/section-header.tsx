'use client';

import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  title: string;
  description?: string;
  gradient?: boolean;
  className?: string;
};

export function SectionHeader({ title, description, gradient, className }: SectionHeaderProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <h2
        className={cn(
          'section-title text-xl md:text-2xl',
          gradient && 'section-title-gradient'
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm text-white/70">{description}</p>
      )}
    </div>
  );
}
