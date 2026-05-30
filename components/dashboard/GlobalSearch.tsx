"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { AddPatientModal } from "./AddPatientModal";
import { Button } from "@/components/ui/button";

function useSearchPatients(query: string) {
  const supabase: any = createClient();

  return useQuery({
    queryKey: ["searchPatients", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      
      const clinic_id = profile?.clinic_id;
      if (!clinic_id) return [];

      // Search by phone or name using ILIKE for partial matching
      const { data, error } = await supabase
        .from("patients")
        .select("id, name, phone_number")
        .eq("clinic_id", clinic_id)
        .or(`name.ilike.%${query}%,phone_number.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
  });
}

export function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Custom inline debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: results, isLoading } = useSearchPatients(debouncedSearchTerm);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest('[role="dialog"]') || target.closest('[data-radix-popper-content-wrapper]')) {
        return;
      }
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative max-w-xs w-full ml-4" ref={wrapperRef}>
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/80 pointer-events-none" />
      <input
        type="text"
        placeholder="ابحث برقم الهاتف أو الاسم..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-slate-100/50 hover:bg-slate-100/80 border border-transparent hover:border-slate-200/50 focus:border-primary focus:bg-white rounded-xl pr-9 pl-4 py-1.5 text-xs focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
      />
      
      {isOpen && debouncedSearchTerm.length >= 2 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري البحث...
            </div>
          ) : results && results.length > 0 ? (
            <div className="flex flex-col max-h-64 overflow-y-auto">
              {results.map((patient: any) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{patient.name}</div>
                    <div className="text-xs text-slate-500">{patient.phone_number}</div>
                  </div>
                  <AddPatientModal 
                    defaultName={patient.name}
                    defaultPhone={patient.phone_number}
                    trigger={<Button size="sm" variant="outline" className="h-8">حجز</Button>}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">
              لا توجد نتائج مطابقة لـ "{debouncedSearchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
