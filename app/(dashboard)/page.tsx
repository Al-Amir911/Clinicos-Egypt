import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { QueueList } from "@/components/dashboard/QueueList";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <DashboardGreeting />

      <SummaryCards />
      <QueueList />
    </div>
  );
}
