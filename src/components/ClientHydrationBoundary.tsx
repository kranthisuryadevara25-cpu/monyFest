'use client';

import { useState, useEffect, type ReactNode } from 'react';

/**
 * Wraps content so it only renders after client mount.
 * Prevents hydration errors when browser extensions (e.g. Cursor's data-cursor-ref)
 * modify the DOM before React hydrates.
 */
export function ClientHydrationBoundary({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" aria-hidden>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
