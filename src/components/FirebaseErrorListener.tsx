
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import type { FirestorePermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * A client-side component that listens for custom Firebase permission errors
 * and throws them to be caught by Next.js's development error overlay.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(
        'A Firestore security rule error was caught. This will be thrown to show the Next.js error overlay with details.',
        error
      );
      toast({
        variant: "destructive",
        title: "Firestore Security Rules Error",
        description: error.message,
        duration: 20000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []); // toast is stable from useToast

  // This component doesn't render anything itself.
  return null;
}
