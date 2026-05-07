import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { QueueList } from "@/components/dashboard/QueueList";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
        <p className="text-sm text-slate-500 mt-1">مرحباً بك د. أحمد، إليك ملخص العيادة اليوم.</p>
      </div>

      <SummaryCards />
      <QueueList />
    </div>
  );
}
