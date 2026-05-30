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
          <main className="flex-1 pt-2 pb-6 px-4 md:pt-3 md:pb-8 md:px-6 lg:pt-4 lg:pb-8 lg:px-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </SubscriptionProvider>
  );
}

