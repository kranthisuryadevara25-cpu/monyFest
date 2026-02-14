
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Gift,
  Ticket,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/member/homepage', label: 'Home', icon: LayoutDashboard },
  { href: '/member/discover', label: 'Discover', icon: Compass },
  { href: '/member/rewards', label: 'Rewards', icon: Gift },
  { href: '/member/my-coupons', label: 'Coupons', icon: Ticket },
  { href: '/member/profile', label: 'Profile', icon: User },
];

export function MobileFooterNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0614]/95 backdrop-blur-sm md:hidden pb-safe">
      <nav className="flex items-center justify-around h-16 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full',
                isActive ? 'text-violet-400' : 'text-white/70'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
