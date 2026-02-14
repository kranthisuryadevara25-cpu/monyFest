
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
      
      // Throw the error to let Next.js dev overlay handle it
      // This provides a much better debugging experience than a simple toast.
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
  }, [toast]);

  // This component doesn't render anything itself.
  return null;
}
