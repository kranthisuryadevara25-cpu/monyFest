
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
  Users,
  Building,
  Wallet,
  Settings,
  Zap,
  Percent,
  GitBranch,
  ShoppingCart,
  BarChart2,
  Ticket,
  Map,
  Heart,
  FileDown,
  Megaphone,
  LogOut,
  Archive,
  Gift,
  Layers,
  BadgePercent,
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

const managementItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/merchants', label: 'Merchants', icon: Building },
  { href: '/admin/agents', label: 'Agents', icon: Users },
  { href: '/admin/territories', label: 'Territories', icon: Map },
  { href: '/admin/ad-management', label: 'Ad Management', icon: Megaphone },
];

const financialItems = [
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { href: '/admin/commission-management', label: 'Commissions', icon: Percent },
  { href: '/admin/merchant-boost', label: 'Merchant Boost', icon: BadgePercent },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
]

const offersItems = [
  { href: '/admin/coupon-approvals', label: 'Coupon Approvals', icon: Ticket },
  { href: '/admin/loyalty-slabs', label: 'Loyalty Slabs', icon: Layers },
  { href: '/admin/bundle-offers', label: 'Bundle Offers', icon: Archive },
  { href: '/admin/welcome-coupons', label: 'Welcome Coupons', icon: Gift },
];

const analyticsItems = [
    { href: '/admin/analytics', label: 'BI Dashboards', icon: BarChart2 },
    { href: '/admin/mlm-explanation', label: 'MLM Explainer', icon: GitBranch },
    { href: '/admin/loyalty-overview', label: 'Loyalty Overview', icon: Heart },
    { href: '/admin/data-export', label: 'Data Export', icon: FileDown },
]

const bottomMenuItems = [
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

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
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarMenu>
              {managementItems.map((item) => (
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
            <SidebarGroupLabel>Financial</SidebarGroupLabel>
            <SidebarMenu>
              {financialItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Offers & Loyalty</SidebarGroupLabel>
            <SidebarMenu>
              {offersItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Analytics & Tools</SidebarGroupLabel>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Admin'} data-ai-hint="person portrait" />
                <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">{user?.displayName || 'Admin User'}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || 'admin@example.com'}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/admin/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                 <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
