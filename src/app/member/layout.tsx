import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MemberSidebar } from '@/components/layout/member-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MobileFooterNav } from '@/components/layout/mobile-footer-nav';
import { AppThemeBackground } from '@/components/landing/app-theme-background';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-theme min-h-screen relative">
      <AppThemeBackground />
      <SidebarProvider className="relative z-10">
        <div className="md:block hidden">
          <MemberSidebar />
        </div>
        <SidebarInset className="bg-transparent">
          <main className="flex flex-col flex-1 min-h-screen pb-16 md:pb-0 bg-transparent">
            <ScrollArea className="h-screen">
              {children}
            </ScrollArea>
          </main>
        </SidebarInset>
        <MobileFooterNav />
      </SidebarProvider>
    </div>
  );
}
