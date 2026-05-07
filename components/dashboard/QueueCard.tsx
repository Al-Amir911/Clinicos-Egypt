import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PatientStatus = "waiting" | "in_clinic" | "completed";

interface QueueCardProps {
  queueNumber: number;
  patientName: string;
  visitType: "consultation" | "follow_up";
  status: PatientStatus;
  waitTimeMins: number;
}

export function QueueCard({
  queueNumber,
  patientName,
  visitType,
  status,
  waitTimeMins,
}: QueueCardProps) {
  const isWaiting = status === "waiting";
  const isInClinic = status === "in_clinic";
  const isCompleted = status === "completed";

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      isInClinic && "border-primary shadow-sm",
      isCompleted && "opacity-75 bg-slate-50"
    )}>
      <CardContent className="p-0">
        <div className="flex items-center p-4 gap-4">
          
          {/* Avatar / Number */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
            isInClinic ? "bg-primary text-white" : "bg-slate-100 text-slate-600",
            isCompleted && "bg-emerald-100 text-emerald-600"
          )}>
            #{queueNumber}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {patientName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={visitType === "consultation" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                {visitType === "consultation" ? "كشف جديد" : "إعادة"}
              </Badge>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ClockIcon /> {waitTimeMins} دقيقة
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden sm:block">
            {isWaiting && (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                في الانتظار
              </Badge>
            )}
            {isInClinic && (
              <Badge variant="default" className="bg-primary hover:bg-primary animate-pulse">
                عند الطبيب
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                مكتمل
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mr-4">
            {!isCompleted && (
              <>
                <Button variant="outline" size="icon" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-full">
                  <Phone className="w-4 h-4" />
                </Button>
                {isWaiting ? (
                  <Button size="sm" className="gap-2">
                    دخول للطبيب <ArrowLeft className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" className="gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                    إنهاء <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
