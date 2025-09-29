'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TriangleAlert as AlertTriangle, RotateCcw, Chrome as Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="mx-auto h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Oops! Terjadi Kesalahan</h1>
          <p className="text-muted-foreground">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau kembali ke halaman utama.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-muted rounded-lg text-left">
            <h3 className="font-semibold text-sm mb-2">Error Details (Development)</h3>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
          
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </a>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Jika masalah berlanjut, silakan hubungi administrator sistem.</p>
        </div>
      </div>
    </div>
  );
}