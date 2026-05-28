"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  MessageSquare, 
  LayoutDashboard, 
  LogIn, 
  CheckCircle2, 
  Menu, 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  WifiOff, 
  Smartphone,
  ChevronDown
} from "lucide-react";

// 1. Vector-rendered Egyptian Flag for cross-platform support (fixes Windows emoji bug)
const EgyptFlag = () => (
  <svg className="w-5 h-3.5 inline-block rounded-sm shadow-sm border border-slate-200/50 align-middle ml-1.5" viewBox="0 0 60 40">
    <rect width="60" height="13.3" fill="#CE1126" />
    <rect y="13.3" width="60" height="13.3" fill="#FFFFFF" />
    <rect y="26.6" width="60" height="13.4" fill="#000000" />
    {/* Golden Eagle in the center */}
    <g transform="translate(30, 20) scale(0.09)">
      <path d="M-10,-5 L10,-5 L5,10 L-5,10 Z" fill="#C09300" />
      <circle cx="0" cy="-7" r="3" fill="#C09300" />
      <path d="M-12,-15 L12,-15 L15,5 L-15,5 Z" fill="#C09300" opacity="0.8" />
    </g>
  </svg>
);

// 1.5 Real WhatsApp Icon SVG component
const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// 2. Custom Scroll-Reveal Component using IntersectionObserver
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // 3. Live Queue Simulation State
  const [queueState, setQueueState] = useState([
    { name: "أحمد محمود عبد العزيز", type: "كشف جديد", time: "10:15 ص", status: "in_clinic", num: 1 },
    { name: "سارة محمد أحمد علي", type: "استشارة", time: "10:30 ص", status: "waiting", num: 2 },
    { name: "يوسف حسن محمود", type: "كشف جديد", time: "10:45 ص", status: "completed", num: 3 }
  ]);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  // 4. Cycle states in queue card every 4.5 seconds to showcase "live sync" functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueState((prev) => {
        // Shift statuses dynamically:
        // Patient 1 completed, Patient 2 goes in clinic, new patient gets added or cycle resets
        if (prev[0].status === "in_clinic") {
          return [
            { ...prev[0], status: "completed" },
            { ...prev[1], status: "in_clinic" },
            { ...prev[2], status: "waiting" }
          ];
        } else if (prev[1].status === "in_clinic") {
          return [
            { ...prev[0], status: "waiting" },
            { ...prev[1], status: "completed" },
            { ...prev[2], status: "in_clinic" }
          ];
        } else {
          return [
            { ...prev[0], status: "in_clinic" },
            { ...prev[1], status: "waiting" },
            { ...prev[2], status: "completed" }
          ];
        }
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const adminWhatsAppNumber = "201025110560";
  const waMessage = encodeURIComponent("السلام عليكم، أريد الاستفسار عن نظام ClinicOS Egypt وكيفية تفعيل الحساب وتجربة الديمو.");
  const waLink = `https://wa.me/${adminWhatsAppNumber}?text=${waMessage}`;

  const faqs = [
    {
      q: "هل يعمل النظام بدون اتصال بالإنترنت؟",
      a: "نعم، تم تصميم ClinicOS بتقنية PWA المتقدمة ليعمل بالكامل بدون الحاجة لإنترنت مستمر. يمكنك إضافة المرضى وإدارة الطابور وتسجيل المدفوعات محلياً، وبمجرد عودة الاتصال يقوم النظام بمزامنة البيانات تلقائياً مع السحابة."
    },
    {
      q: "كيف يعمل تذكير الواتساب التلقائي؟",
      a: "يتيح لك النظام إرسال رسائل تأكيد ومواعيد تلقائية للمرضى باللغة العربية عبر واتساب بنقرة واحدة، مما يقلل من نسب غياب المرضى عن الاستشارات بنسبة تصل إلى 40%."
    },
    {
      q: "كيف أقوم بتفعيل حسابي بعد سداد الاشتراك؟",
      a: "الاشتراك رمزي بقيمة 500 جنيه مصري شهرياً. يمكنك التحويل عبر InstaPay أو المحافظ الإلكترونية، ثم النقر على زر 'تأكيد الدفع عبر واتساب' داخل شاشة القفل لإرسال صورة إيصال التحويل، وسيتم تفعيل حسابك فوراً."
    },
    {
      q: "هل يمكن استخدام النظام على الهاتف أو التابلت؟",
      a: "نعم، النظام متوافق بالكامل مع جميع الأجهزة (الهواتف الذكية، التابلت، اللابتوب، وأجهزة الكمبيوتر المكتبية) بواجهة مستخدم مرنة تدعم اللغتين العربية والإنجليزية."
    }
  ];

  // 5. Custom smooth scroll logic for navigation anchors
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setMobileMenuOpen(false);
    }
  };

  // 5.5 Scroll back to top on logo click
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden" dir="rtl">
      
      {/* CSS Animations injected dynamically */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) scale(1.05); }
          50% { transform: translateY(20px) scale(1); }
        }
        @keyframes slideDownFade {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
        .animate-slide-down-fade {
          animation: slideDownFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up-fade {
          animation: slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .transition-height {
          transition: height 0.3s ease-in-out;
        }
      `}</style>

      {/* 1. Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/75 border-b border-slate-200/50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              onClick={scrollToTop}
              className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            >
              <span className="bg-blue-600 text-white p-1.5 rounded-lg text-sm font-bold aspect-square flex items-center justify-center">OS</span>
              ClinicOS
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a 
                href="#features" 
                onClick={(e) => handleScroll(e, "features")}
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors duration-200 relative group"
              >
                المميزات
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleScroll(e, "pricing")}
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors duration-200 relative group"
              >
                الأسعار
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </a>
              <a 
                href="#faq" 
                onClick={(e) => handleScroll(e, "faq")}
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors duration-200 relative group"
              >
                الأسئلة الشائعة
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    لوحة التحكم
                  </Link>
                ) : (
                  <Link 
                    href="/login" 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    دخول الأطباء
                  </Link>
                )}
              </>
            )}

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden transition-colors rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 absolute w-full left-0 shadow-lg animate-slide-down">
            <a 
              href="#features" 
              onClick={(e) => handleScroll(e, "features")}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              المميزات
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleScroll(e, "pricing")}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              الأسعار
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleScroll(e, "faq")}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              الأسئلة الشائعة
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Floating background glows */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-8 text-right">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/50 hover:bg-blue-100/50 transition-colors opacity-0 animate-slide-down-fade"
                style={{ animationDelay: "100ms" }}
              >
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <EgyptFlag />
                مصمم خصيصاً للعيادات المصرية
              </div>
              
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight opacity-0 animate-slide-down-fade"
                style={{ animationDelay: "250ms" }}
              >
                أدر عيادتك بذكاء <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">وقلل فوضى الانتظار</span>
              </h1>

              <p 
                className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed opacity-0 animate-slide-down-fade"
                style={{ animationDelay: "400ms" }}
              >
                نظام إدارة العيادات الأسهل والأسرع. مزامنة فورية بين شاشة الاستقبال وغرفة الكشف، رسائل تأكيد ومواعيد تلقائية للمرضى عبر الواتساب باللغة العربية، ويعمل بالكامل بدون الحاجة لإنترنت مستمر.
              </p>

              <div 
                className="flex flex-col sm:flex-row gap-4 justify-start opacity-0 animate-slide-down-fade"
                style={{ animationDelay: "550ms" }}
              >
                <a 
                  href={waLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <WhatsAppIcon className="w-5.5 h-5.5 ml-1" />
                  احجز ديمو مجاني عبر الواتساب
                </a>
                
                {!loading && (
                  <Link 
                    href={user ? "/dashboard" : "/login"} 
                    className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-300 flex items-center justify-center gap-2 border border-slate-200 shadow-sm transform hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    {user ? "الذهاب للوحة التحكم" : "تجربة النظام مجاناً"}
                    <ArrowLeft className="w-4 h-4 mr-1" />
                  </Link>
                )}
              </div>

              {/* Key Highlights */}
              <div 
                className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200/60 opacity-0 animate-slide-down-fade"
                style={{ animationDelay: "700ms" }}
              >
                <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <WifiOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">يعمل بدون إنترنت</h4>
                    <p className="text-xs text-slate-500">مزامنة تلقائية فورية</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">تذكير بالواتساب</h4>
                    <p className="text-xs text-slate-500">رسائل آلية باللغة العربية</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 col-span-2 md:col-span-1 transition-transform duration-300 hover:translate-x-1">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">نسخة تطبيق PWA</h4>
                    <p className="text-xs text-slate-500">تثبيت فوري على الهواتف</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Visual with Live Simulator */}
            <div 
              className="lg:col-span-5 flex justify-center relative opacity-0 animate-slide-up-fade"
              style={{ animationDelay: "400ms" }}
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-10 blur-2xl rounded-full animate-pulse" />
              
              {/* Mockup Card */}
              <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl p-6 relative overflow-hidden transition-all duration-500 hover:shadow-blue-500/5 hover:border-blue-100/50">
                <div className="absolute top-0 right-0 left-0 h-[5px] bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">قائمة الانتظار اليومية</h3>
                    <p className="text-xs text-slate-500">عيادة الأمل التخصصية</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    تحديث مباشر
                  </span>
                </div>

                <div className="space-y-3">
                  {queueState.map((patient, index) => {
                    const isInClinic = patient.status === "in_clinic";
                    const isWaiting = patient.status === "waiting";
                    const isCompleted = patient.status === "completed";
                    
                    return (
                      <div 
                        key={patient.num}
                        className={`p-3 border rounded-2xl flex items-center justify-between transition-all duration-700 transform ${
                          isInClinic 
                            ? "bg-blue-50/50 border-blue-100/60 scale-[1.01] shadow-sm shadow-blue-500/5" 
                            : isCompleted 
                            ? "bg-slate-50/30 border-slate-100/50 opacity-55" 
                            : "bg-slate-50/80 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm transition-colors duration-500 ${
                            isInClinic 
                              ? "bg-blue-600 text-white" 
                              : isCompleted 
                              ? "bg-slate-100 text-slate-400" 
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {isCompleted ? "✓" : patient.num}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm transition-colors duration-300">{patient.name}</h4>
                            <p className="text-[10px] text-slate-500">{patient.type} • {patient.time}</p>
                          </div>
                        </div>
                        
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-500 ${
                          isInClinic 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : isCompleted 
                            ? "bg-slate-100 text-slate-500" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {isInClinic ? "عند الطبيب" : isCompleted ? "تم الكشف" : "قيد الانتظار"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Micro CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">حالة المزامنة:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    متصل وسحابي
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-24 bg-white border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">كل ما تحتاجه لإدارة عيادتك في مكان واحد</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                تخلص من الدفاتر الورقية وتنظيم المواعيد اليدوي العقيم. نظام ClinicOS يوفر لك السرعة والأمان التام.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <ScrollReveal delay={100}>
              <div className="bg-slate-50 border border-slate-100/80 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 group hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md shadow-blue-500/20">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">شاشة الطابور الفورية</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  مزامنة فورية ولحظية بين شاشة السكرتارية في الاستقبال وشاشة الطبيب داخل غرفة الكشف. إدخال المرضى وتعديل ترتيبهم يظهر فوراً بدون الحاجة لتحديث الصفحة.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal delay={200}>
              <div className="bg-slate-50 border border-slate-100/80 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 group hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md shadow-emerald-500/20">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">تذكير الواتساب التلقائي</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  قلل من غياب المرضى عن مواعيدهم. يمكنك إرسال رسالة تأكيد الحجز للمريض باللغة العربية وبطريقة منسقة تشمل الموعد واسم العيادة ورابط الموقع بنقرة زر واحدة.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal delay={300}>
              <div className="bg-slate-50 border border-slate-100/80 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 group hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md shadow-purple-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">الأرشيف الطبي الذكي</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  ملفات مرضى متكاملة ومستقرة. سجل زيارات المريض، التشخيصات السابقة، وصور الروشتات أو التحاليل والأشعة السابقة مخزنة بشكل آمن وسهل الوصول في أي وقت.
                </p>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">سعر شفاف وبسيط يناسب الجميع</h2>
              <p className="text-lg text-slate-600">بدون عمولات خفية أو تكاليف إضافية.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: Starter Pack (500 EGP) */}
            <ScrollReveal delay={100}>
              <div className="bg-white/70 backdrop-blur-xl border border-blue-200 text-slate-900 shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden transition-all duration-500 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:scale-[1.01] flex flex-col justify-between min-h-[640px]">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="absolute top-0 right-0 left-0 h-[4px] bg-gradient-to-r from-blue-500 to-indigo-600" />

                <div>
                  <div className="text-center space-y-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      الباقة الأساسية (للعيادات الفردية)
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-5xl font-black text-slate-900">500</span>
                      <span className="text-lg text-slate-500 font-medium">جنيه مصري / شهرياً</span>
                    </div>
                    <p className="text-slate-500 text-sm">حل ذكي متكامل لعيادة طبيب واحد.</p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">طبيب واحد ومساعد استقبال (سكرتارية) واحد</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">طابور كشف ذكي ومزامنة فورية للمرضى</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">تذكير بالواتساب وتأكيد المواعيد بنقرة واحدة</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">يعمل بالكامل بدون اتصال بالإنترنت (Offline Mode)</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">سجلات ملفات المرضى وأرشفة الروشتات الرقمية</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">دعم فني قياسي عبر الواتساب</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a 
                    href={waLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
                  >
                    <WhatsAppIcon className="w-5.5 h-5.5 ml-1" />
                    اشترك الآن عبر الواتساب
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Pro/Center Pack (1,500 EGP) */}
            <ScrollReveal delay={200}>
              <div className="bg-white/70 backdrop-blur-xl border border-indigo-200 text-slate-900 shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden transition-all duration-500 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:scale-[1.01] flex flex-col justify-between min-h-[640px]">
                <div className="absolute top-5 left-5 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-20">
                  الأكثر طلباً للمراكز
                </div>
                
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="absolute top-0 right-0 left-0 h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div>
                  <div className="text-center space-y-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-55 bg-indigo-50 text-indigo-700 border border-indigo-100">
                      الباقة المتقدمة (للمراكز والمستشفيات)
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-5xl font-black text-slate-900">1500</span>
                      <span className="text-lg text-slate-500 font-medium">جنيه مصري / شهرياً</span>
                    </div>
                    <p className="text-slate-500 text-sm">نظام مركزي لإدارة مجموعة من العيادات والأطباء.</p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">أطباء وعيادات متعددة غير محدودة</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">صلاحيات وحسابات متعددة للسكرتارية والمديرين</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">إرسال تلقائي ومجدول لتذكيرات المواعيد عبر الواتساب</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">تخصيص نماذج الروشتات المطبوعة والملفات باسم المركز</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">لوحات تحليلات مالية وتقارير أداء للعيادات</span>
                    </div>
                    <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">دعم فني VIP ذو أولوية 24/7 عبر الواتساب والاتصال</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a 
                    href={waLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
                  >
                    <WhatsAppIcon className="w-5.5 h-5.5 ml-1" />
                    اشترك الآن عبر الواتساب
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="mt-12 text-center text-xs text-slate-500 border-t border-slate-200/60 pt-6">
            <span>طرق الدفع: إنستاباي (InstaPay)</span>
            <span className="mx-3 text-slate-300">|</span>
            <span>فودافون كاش (Vodafone Cash)</span>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">الأسئلة الشائعة</h2>
              <p className="text-lg text-slate-600">كل ما تود معرفته عن نظام ClinicOS وكيفية تشغيله.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                
                return (
                  <div 
                    key={idx} 
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen ? "border-blue-200 shadow-md shadow-blue-500/5" : "border-slate-200/80"
                    }`}
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className={`w-full px-6 py-5 flex items-center justify-between text-right font-bold text-slate-900 text-base transition-colors duration-300 ${
                        isOpen ? "bg-blue-50/30" : "bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-500 ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? "max-h-[500px] border-t border-slate-100 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="px-6 py-5 bg-white text-slate-600 text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-black">OS</span>
            <span className="text-white font-bold text-lg">ClinicOS Egypt</span>
          </div>
          
          <div className="text-xs text-slate-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()} • تطوير بواسطة <span className="text-slate-400 font-semibold">Orion Systems</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 animate-bounce"
        aria-label="تواصل معنا عبر واتساب"
        style={{ animationDuration: "3s" }}
      >
        <WhatsAppIcon className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">1</span>
        </span>
      </a>

    </div>
  );
}
