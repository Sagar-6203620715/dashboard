import { SidebarProvider } from "@/components/sidebar-provider";
import { Sidebar } from "@/components/sidebar";
import { MainContent } from "@/components/main-content";

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#F4F5FA] flex">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
