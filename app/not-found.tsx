import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Chrome as Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin telah dipindahkan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator.</p>
        </div>
      </div>
    </div>
  );
}