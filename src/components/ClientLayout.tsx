'use client';

import { AuthProvider } from '@/lib/auth';
import { ClientHydrationBoundary } from '@/components/ClientHydrationBoundary';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { RootErrorBoundary } from '@/components/RootErrorBoundary';

/**
 * Single client wrapper for root layout (AuthProvider, Toaster, hydration boundary).
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootErrorBoundary>
      <AuthProvider>
        <ClientHydrationBoundary>
          {children}
          <Toaster />
          <FirebaseErrorListener />
        </ClientHydrationBoundary>
      </AuthProvider>
    </RootErrorBoundary>
  );
}
