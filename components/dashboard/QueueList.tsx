"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueueCard } from "./QueueCard";
import { useQueue } from "@/hooks/useQueue";

export function QueueList() {
  const { data: queue = [] as any[], isLoading, error } = useQueue();

  if (isLoading) return <div className="text-center py-12 text-slate-500">جاري تحميل الطابور...</div>;
  if (error) return <div className="text-center py-12 text-red-500">حدث خطأ في جلب البيانات.</div>;

  const waitingPatients = queue.filter((p: any) => p.status === "waiting" || p.status === "in_clinic");
  const completedPatients = queue.filter((p: any) => p.status === "completed");

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
            الكل ({queue.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="waiting" className="space-y-3 mt-0 focus-visible:outline-none focus-visible:ring-0">
          {waitingPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">لا يوجد مرضى في الانتظار حالياً.</div>
          ) : (
            waitingPatients.map((appointment: any) => (
              <QueueCard 
                key={appointment.id} 
                id={appointment.id}
                queueNumber={appointment.queue_number}
                patientName={appointment.patient?.name || "مريض غير معروف"}
                patientPhone={appointment.patient?.phone_number || ""}
                visitType={appointment.visit_type}
                status={appointment.status}
                waitTimeMins={Math.floor((Date.now() - new Date(appointment.created_at).getTime()) / 60000)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-3 mt-0 focus-visible:outline-none focus-visible:ring-0">
          {completedPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">لم يتم الانتهاء من أي مريض اليوم.</div>
          ) : (
            completedPatients.map((appointment: any) => (
              <QueueCard 
                key={appointment.id} 
                id={appointment.id}
                queueNumber={appointment.queue_number}
                patientName={appointment.patient?.name || "مريض غير معروف"}
                patientPhone={appointment.patient?.phone_number || ""}
                visitType={appointment.visit_type}
                status={appointment.status}
                waitTimeMins={0}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-3 mt-0 focus-visible:outline-none focus-visible:ring-0">
          {queue.map((appointment: any) => (
             <QueueCard 
              key={appointment.id} 
              id={appointment.id}
              queueNumber={appointment.queue_number}
              patientName={appointment.patient?.name || "مريض غير معروف"}
              patientPhone={appointment.patient?.phone_number || ""}
              visitType={appointment.visit_type}
              status={appointment.status}
              waitTimeMins={appointment.status === 'completed' ? 0 : Math.floor((Date.now() - new Date(appointment.created_at).getTime()) / 60000)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
