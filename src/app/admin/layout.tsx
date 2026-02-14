import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppThemeBackground } from '@/components/landing/app-theme-background';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-theme min-h-screen relative">
      <AppThemeBackground />
      <SidebarProvider className="relative z-10">
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <main className="flex flex-col flex-1 min-h-screen bg-transparent">
            <ScrollArea className="h-screen">
              {children}
            </ScrollArea>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
