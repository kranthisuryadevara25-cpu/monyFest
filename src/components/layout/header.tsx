'use client';

import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, signOut } from '@/lib/auth';

export function Header({ pageTitle }: { pageTitle: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/5 bg-transparent backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:px-6 text-white">
      <SidebarTrigger className="md:hidden text-white hover:bg-white/10 min-h-[44px] min-w-[44px]" />
      <div className="flex items-center gap-4 md:grow-0">
        <h1 className="font-headline text-xl font-semibold text-white md:text-2xl">{pageTitle}</h1>
      </div>
      <div className="flex w-full items-center gap-2 md:ml-auto md:flex-grow-0 md:justify-end">
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:inline">Log out</span>
          </Button>
        )}
        <Button variant="outline" size="icon" className="h-8 w-8 border-white/20 text-white hover:bg-white/10 hover:border-white/30">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
    </header>
  );
}
