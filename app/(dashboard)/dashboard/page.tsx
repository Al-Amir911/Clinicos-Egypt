import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { QueueList } from "@/components/dashboard/QueueList";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-2">
      <DashboardGreeting />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start" dir="rtl">
        {/* Right Side: Summary Cards (1 col on md, renders first on the right in RTL) */}
        <div className="md:col-span-1">
          <SummaryCards isVertical={true} />
        </div>

        {/* Left Side: Queue List (3 cols on md, renders second on the left in RTL) */}
        <div className="md:col-span-3">
          <QueueList />
        </div>
      </div>
    </div>
  );
}
