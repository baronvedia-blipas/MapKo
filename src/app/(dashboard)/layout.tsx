"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { ProfileProvider } from "@/components/providers/profile-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProfileProvider>
        <div className="min-h-screen mesh-bg">
          <Sidebar />
          <div className="md:ml-64">
            <Header />
            <main className="p-4 md:p-6 max-w-[1400px]">{children}</main>
          </div>
        </div>
      </ProfileProvider>
    </SidebarProvider>
  );
}
