'use client';

import { AuthProvider } from '@/lib/auth';
import { ClientHydrationBoundary } from '@/components/ClientHydrationBoundary';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * Single client wrapper for root layout (AuthProvider, Toaster, hydration boundary).
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClientHydrationBoundary>
        {children}
        <Toaster />
        <FirebaseErrorListener />
      </ClientHydrationBoundary>
    </AuthProvider>
  );
}
