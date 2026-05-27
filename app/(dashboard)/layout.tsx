import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { SubscriptionProvider } from "@/components/providers/SubscriptionProvider";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionBanner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SubscriptionProvider>
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
          <SubscriptionBanner />
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </SubscriptionProvider>
  );
}

