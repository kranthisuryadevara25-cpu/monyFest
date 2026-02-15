
"use client";

import { MonyFestLogo } from '@/components/MonyFestLogo';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Wallet,
  Settings,
  Users,
  LogOut,
  Compass,
  ShoppingBag,
  Gift,
  Mic,
  QrCode,
  History,
  Rocket,
  User as UserIcon,
  Ticket,
  Target,
  Trophy,
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

const mainMenuItems = [
  { href: '/member/homepage', label: 'Home', icon: LayoutDashboard },
  { href: '/member/discover', label: 'Discover', icon: Compass },
  { href: '/member/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/member/rewards', label: 'Rewards', icon: Gift },
];

const engagementMenuItems = [
  { href: '/member/referrals', label: 'Referrals', icon: Users },
  { href: '/member/campaigns', label: 'Campaigns', icon: Target },
  { href: '/member/voice', label: 'Voice Orders', icon: Mic },
];

const toolsMenuItems = [
    { href: '/member/my-coupons', label: 'My Coupons', icon: Ticket },
    { href: '/member/offline-payment', label: 'Redeem Coupon', icon: QrCode },
    { href: '/member/loyalty-history', label: 'History', icon: History },
    { href: '/member/wallet', label: 'Wallet', icon: Wallet },
    { href: '/member/winner-board', label: 'Winner Board', icon: Trophy },
];

export function MemberSidebar() {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [member, setMember] = React.useState<AppUser | null>(null);

  React.useEffect(() => {
    if (authUser) {
      getUserById(authUser.uid).then(user => {
        if (user?.role === 'member') {
          setMember(user);
        }
      });
    } else {
      setMember(null);
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
          <SidebarGroup>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
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
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Engagement</SidebarGroupLabel>
            <SidebarMenu>
              {engagementMenuItems.map((item) => (
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
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Tools & History</SidebarGroupLabel>
            <SidebarMenu>
              {toolsMenuItems.map((item) => (
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
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {member && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold">{member.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {member.email}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/member/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/member/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Link>
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
