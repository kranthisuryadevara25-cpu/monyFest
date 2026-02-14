
"use client";

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
  Store,
  ShoppingCart,
  Receipt,
  Mic,
  BarChart2,
  Ticket,
  Wand2,
  BrainCircuit,
  Bell,
  Activity,
  Heart,
  Settings,
  Zap,
  LogOut,
  Wallet,
  BadgePercent,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { mockUsers, mockMerchants } from '@/lib/placeholder-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth, signOut } from '@/lib/auth';

const mainMenuItems = [
  { href: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/merchant/shops', label: 'Shops', icon: Store },
  { href: '/merchant/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/merchant/transactions', label: 'Transactions', icon: Receipt },
  { href: '/merchant/coupons', label: 'Coupons', icon: Ticket },
  { href: '/merchant/onboarding', label: 'Onboarding', icon: Wand2 },
];

const earningMenuItems = [
  { href: '/merchant/payouts', label: 'Payouts', icon: Wallet },
  { href: '/merchant/boost-earnings', label: 'Boost Earnings', icon: BadgePercent },
];

const analyticsMenuItems = [
    { href: '/merchant/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/merchant/dashboard-realtime', label: 'Real-time', icon: Activity },
    { href: '/merchant/loyalty-analytics', label: 'Loyalty', icon: Heart },
]

const aiMenuItems = [
  { href: '/merchant/voice-orders', label: 'Voice Orders', icon: Mic },
  { href: '/merchant/ai-recommendations', label: 'AI Insights', icon: BrainCircuit },
];

const bottomMenuItems = [
  { href: '/merchant/notifications', label: 'Notifications', icon: Bell },
  { href: '/merchant/settings', label: 'Settings', icon: Settings },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const merchantUser = mockUsers.find((u) => u.role === 'merchant');
  const merchant = mockMerchants.find((m) => m.merchantId === 'merchant-01');

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Loyalty</span>
            <span className="text-white">Leap</span>
          </span>
        </Link>
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
              <SidebarGroupLabel>Earnings</SidebarGroupLabel>
              <SidebarMenu>
                  {earningMenuItems.map((item) => (
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
              <SidebarGroupLabel>Analytics</SidebarGroupLabel>
              <SidebarMenu>
                  {analyticsMenuItems.map((item) => (
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
              <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
              <SidebarMenu>
                  {aiMenuItems.map((item) => (
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
        <SidebarMenu>
          {bottomMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {merchantUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={merchantUser.avatarUrl}
                    alt={merchantUser.name}
                    data-ai-hint="person portrait"
                  />
                  <AvatarFallback>{merchantUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold">{merchant?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {merchantUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/merchant/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/merchant/settings">Settings</Link>
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
