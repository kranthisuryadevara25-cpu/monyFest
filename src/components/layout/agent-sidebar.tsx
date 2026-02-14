
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { MonyFestLogo } from '@/components/MonyFestLogo';
import {
  LayoutDashboard,
  Wallet,
  Settings,
  Wand2,
  Users,
  Map,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth, signOut } from '@/lib/auth';
import * as React from 'react';
import type { User as AppUser } from '@/lib/types';
import { getUserById } from '@/services/user-service';

const menuItems = [
  {
    href: '/agent/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/agent/onboarding',
    label: 'Onboarding',
    icon: Wand2,
  },
  {
    href: '/agent/referrals',
    label: 'Referrals',
    icon: Users,
  },
  {
    href: '/agent/earnings',
    label: 'Earnings',
    icon: Wallet,
  },
  {
    href: '/agent/territory',
    label: 'Territory',
    icon: Map,
  },
  {
    href: '/agent/performance',
    label: 'Performance',
    icon: TrendingUp,
  },
];

const bottomMenuItems = [
  {
    href: '/agent/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function AgentSidebar() {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [agent, setAgent] = React.useState<AppUser | null>(null);
  
  React.useEffect(() => {
    if (authUser) {
        getUserById(authUser.uid).then(user => {
            if (user?.role === 'agent') {
                setAgent(user);
            }
        });
    } else {
      setAgent(null);
    }
  }, [authUser]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <MonyFestLogo variant="sidebar" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        {agent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={agent.avatarUrl} alt={agent.name} data-ai-hint="person portrait" />
                  <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold">{agent.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {agent.email}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link href="/agent/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/agent/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
