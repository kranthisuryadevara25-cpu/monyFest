'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isChunkLoad = error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk');

  const handleRetry = () => {
    if (isChunkLoad) {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0614] p-4 text-white">
      <AlertCircle className="h-12 w-12 text-amber-400" />
      <h1 className="text-xl font-semibold">
        {isChunkLoad ? 'Page failed to load' : 'Something went wrong'}
      </h1>
      <p className="max-w-sm text-center text-white/70 text-sm">
        {isChunkLoad
          ? 'The app took too long to load. Try refreshing the page. If it keeps happening, restart the dev server (npm run dev) and clear the browser cache.'
          : 'An unexpected error occurred.'}
      </p>
      <Button
        onClick={handleRetry}
        className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
      >
        Try again
      </Button>
      <Button
        variant="ghost"
        className="text-white/70 hover:text-white"
        onClick={() => window.location.reload()}
      >
        Refresh page
      </Button>
    </div>
  );
}
