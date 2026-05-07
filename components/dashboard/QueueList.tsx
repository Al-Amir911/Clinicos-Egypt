import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueueCard } from "./QueueCard";

// Mock data for the MVP presentation
const mockQueue = [
  { id: 1, queueNumber: 1, patientName: "محمود عبدالله", visitType: "consultation" as const, status: "completed" as const, waitTimeMins: 0 },
  { id: 2, queueNumber: 2, patientName: "سارة مصطفى", visitType: "follow_up" as const, status: "in_clinic" as const, waitTimeMins: 5 },
  { id: 3, queueNumber: 3, patientName: "كريم حسن", visitType: "consultation" as const, status: "waiting" as const, waitTimeMins: 15 },
  { id: 4, queueNumber: 4, patientName: "نور علي", visitType: "consultation" as const, status: "waiting" as const, waitTimeMins: 22 },
  { id: 5, queueNumber: 5, patientName: "أحمد سيد", visitType: "follow_up" as const, status: "waiting" as const, waitTimeMins: 40 },
];

export function QueueList() {
  const waitingPatients = mockQueue.filter(p => p.status === "waiting" || p.status === "in_clinic");
  const completedPatients = mockQueue.filter(p => p.status === "completed");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">طابور الانتظار</h2>
      </div>

      <Tabs defaultValue="waiting" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6 bg-slate-100/50">
          <TabsTrigger value="waiting" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            في الانتظار ({waitingPatients.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            مكتمل ({completedPatients.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            الكل ({mockQueue.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="waiting" className="space-y-3 mt-0 focus-visible:outline-none focus-visible:ring-0">
          {waitingPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">لا يوجد مرضى في الانتظار حالياً.</div>
          ) : (
            waitingPatients.map(patient => (
              <QueueCard key={patient.id} {...patient} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-3 mt-0 focus-visible:outline-none focus-visible:ring-0">
          {completedPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">لم يتم الانتهاء من أي مريض اليوم.</div>
          ) : (
            completedPatients.map(patient => (
              <QueueCard key={patient.id} {...patient} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-3 mt-0 focus-visible:outline-none focus-visible:ring-0">
          {mockQueue.map(patient => (
            <QueueCard key={patient.id} {...patient} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
