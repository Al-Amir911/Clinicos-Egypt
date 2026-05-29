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
  ChevronDown,
  Search,
  Plus,
  User,
  Users,
  Wallet,
  Calendar,
  FileText,
  Send,
  Check,
  Settings
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

  // 3.5. Dashboard Tour Interactive State
  const [activeTourTab, setActiveTourTab] = useState<"dashboard" | "calendar" | "patients" | "finance" | "settings">("dashboard");
  
  // Tab 1 state: Reception patient input simulator
  const [tourNewPatientName, setTourNewPatientName] = useState("");
  const [tourPatients, setTourPatients] = useState([
    { id: 1, name: "ياسين كريم محمد", type: "كشف جديد", time: "11:00 ص", status: "waiting" },
    { id: 2, name: "منى عبد الفتاح صبري", type: "استشارة", time: "11:15 ص", status: "waiting" },
    { id: 3, name: "مازن عمرو الجارحي", type: "كشف جديد", time: "11:30 ص", status: "waiting" },
  ]);

  // Tab 2 state: Calendar appointments simulator
  const [calendarAppointments, setCalendarAppointments] = useState([
    { id: 1, time: "10:00 ص", patient: "محمود عبد الله ياسين", type: "كشف جديد", status: "booked" },
    { id: 2, time: "10:30 ص", patient: "سارة محمد أحمد علي", type: "استشارة", status: "booked" },
    { id: 3, time: "11:00 ص", patient: "", type: "", status: "available" },
    { id: 4, time: "11:30 ص", patient: "إبراهيم حسن خليل", type: "كشف جديد", status: "booked" },
    { id: 5, time: "12:00 م", patient: "", type: "", status: "available" },
  ]);

  // Tab 3 state: Patients directory & details selector
  const [tourSelectedPatientId, setTourSelectedPatientId] = useState(2);
  const tourPatientsDetails = [
    { 
      id: 1, 
      name: "ياسين كريم محمد", 
      age: 29, 
      gender: "ذكر", 
      phone: "011****8233", 
      symptoms: "صداع مستمر منذ يومين مع ارتفاع طفيف في درجات الحرارة واحتقان بالأنف.", 
      diagnosis: "التهاب جيوب أنفية حاد نتيجة تقلب الجو موسمياً.", 
      rx: [
        { name: "Panadol Joint", dose: "قرص كل 8 ساعات بعد الأكل", duration: "3 أيام" },
        { name: "Nazocort Nasal Spray", dose: "بختين في كل فتحة أنف يومياً", duration: "5 أيام" }
      ] 
    },
    { 
      id: 2, 
      name: "منى عبد الفتاح صبري", 
      age: 42, 
      gender: "أنثى", 
      phone: "010****1422", 
      symptoms: "آلام حادة بأسفل الظهر مستمرة منذ 3 أيام مع تشنج عضلي وصعوبة في الحركة.", 
      diagnosis: "تشنج عضلي حاد في الفقرات القطنية نتيجة مجهود حركي خاطئ.", 
      rx: [
        { name: "Myolgin Tablets", dose: "قرص واحد بعد الغداء والعشاء", duration: "5 أيام" },
        { name: "Voltaren 75mg Ampoule", dose: "حقنة عضل واحدة يومياً عند اللزوم", duration: "3 أيام" }
      ] 
    },
    { 
      id: 3, 
      name: "مازن عمرو الجارحي", 
      age: 35, 
      gender: "ذكر", 
      phone: "012****9910", 
      symptoms: "سعال جاف مستمر منذ أسبوع مع ضيق تنفس خفيف عند بذل مجهود بدني.", 
      diagnosis: "حساسية شعب هوائية ناتجة عن استنشاق أتربة مع قلق خفيف.", 
      rx: [
        { name: "Singulair 10mg", dose: "قرص واحد مساءً قبل النوم", duration: "10 أيام" },
        { name: "Ventolin Inhaler", dose: "بختين عند اللزوم بحد أقصى 4 مرات", duration: "أسبوعين" }
      ] 
    }
  ];

  // Tab 4 state: Finance statistics & transactions filter
  const [financeFilter, setFinanceFilter] = useState<"all" | "cash" | "instapay">("all");
  const [financeTransactions, setFinanceTransactions] = useState([
    { id: 1, patientName: "أحمد محمود عبد العزيز", type: "كشف جديد", amount: 500, method: "cash", date: "اليوم - 10:15 ص" },
    { id: 2, patientName: "سارة محمد أحمد علي", type: "استشارة", amount: 200, method: "instapay", date: "اليوم - 10:30 ص" },
    { id: 3, patientName: "يوسف حسن محمود", type: "كشف جديد", amount: 500, method: "instapay", date: "اليوم - 10:45 ص" },
    { id: 4, patientName: "منى عبد الفتاح صبري", type: "استشارة", amount: 200, method: "cash", date: "اليوم - 11:15 ص" },
  ]);

  // Tab 5 state: WhatsApp template customizer
  const [waTemplateCustomName, setWaTemplateCustomName] = useState("أحمد عبد السلام");
  const [waTemplateCustomTime, setWaTemplateCustomTime] = useState("12:30 م");
  const [waTemplateSent, setWaTemplateSent] = useState(false);

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
      <header className="absolute top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/75 border-b border-slate-200/50 transition-all duration-300 shadow-sm">
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
                  تواصل معنا
                </a>
                
                {!loading && (
                  <a 
                    href="#dashboard-tour" 
                    onClick={(e) => handleScroll(e, "dashboard-tour")}
                    className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-300 flex items-center justify-center gap-2 border border-slate-200 shadow-sm transform hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    {user ? "الذهاب للوحة التحكم" : "تجربة النظام مجاناً"}
                    <ArrowLeft className="w-4 h-4 mr-1" />
                  </a>
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

      {/* 3.5 Interactive Dashboard Tour Section */}
      <section id="dashboard-tour" className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="inline-block px-3.5 py-1.5 mb-3 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                جولة تفاعلية سريعة
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                خذ جولة داخل لوحة تحكم ClinicOS
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                اكتشف كيف يبدو نظام عيادتك اليومي. تنقل بين الشاشات الرئيسية وجرب التفاعل معها بنفسك كما لو كنت تستخدم التطبيق بالفعل.
              </p>
            </div>
          </ScrollReveal>

          {/* Interactive Showcase App Frame */}
          <ScrollReveal delay={150}>
            <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[680px]">
              
              {/* Sidebar Panel - Mockup designed to match the real ClinicOS Sidebar */}
              <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-l border-slate-200 flex flex-row md:flex-col justify-between flex-shrink-0 md:h-full p-4 md:p-6 overflow-x-auto md:overflow-x-visible">
                <div className="flex flex-row md:flex-col items-center md:items-stretch gap-6 md:gap-8 w-full">
                  {/* Brand & System Status */}
                  <div className="flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white p-1.5 rounded-lg text-xs font-bold aspect-square flex items-center justify-center">OS</span>
                      <span className="text-slate-900 font-extrabold text-lg tracking-tight">ClinicOS</span>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse hidden md:inline-block ml-2" title="متصل بالخادم" />
                  </div>

                  {/* Navigation Links - Horizontal on mobile, Vertical on desktop */}
                  <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible w-full pb-2 md:pb-0 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveTourTab("dashboard")}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-right text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        activeTourTab === "dashboard"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>الرئيسية (الطابور)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTourTab("calendar")}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-right text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        activeTourTab === "calendar"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>جدول الحجوزات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTourTab("patients")}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-right text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        activeTourTab === "patients"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>سجلات المرضى</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTourTab("finance")}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-right text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        activeTourTab === "finance"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>الحسابات المالية</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTourTab("settings")}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-right text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        activeTourTab === "settings"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>إعدادات الواتساب</span>
                    </button>
                  </nav>
                </div>

                {/* Footer of Sidebar */}
                <div className="pt-4 border-t border-slate-100 hidden md:block w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      د
                    </div>
                    <div>
                      <h5 className="text-slate-800 text-xs font-bold leading-none mb-1">د. سمير علي</h5>
                      <span className="text-[10px] text-slate-400">طبيب أخصائي</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area - Mockup Application Screens */}
              <div className="flex-1 bg-slate-50 flex flex-col min-h-[500px] md:h-full relative overflow-y-auto">
                {/* Mockup Windows Header Bar */}
                <div className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-100 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      وضع غير متصل بالإنترنت نشط
                    </span>
                  </div>
                </div>

                {/* Mockup Display Content dynamically switched */}
                <div className="flex-1 p-6 flex flex-col justify-start relative">
                  
                  {/* TAB 1: الرئيسية - طابور الانتظار (Dashboard / Queue) */}
                  <div 
                    className={`transition-all duration-500 space-y-6 flex-1 flex flex-col ${
                      activeTourTab === "dashboard" ? "opacity-100 translate-y-0" : "absolute inset-0 opacity-0 pointer-events-none scale-95"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">شاشة الاستقبال وإدارة الطابور</h3>
                        <p className="text-xs text-slate-500 mt-0.5">تسجيل المرضى لحظة وصولهم ومتابعة حالة الانتظار فورياً.</p>
                      </div>
                    </div>

                    {/* Stats summary cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm text-right">
                        <span className="text-[10px] font-semibold text-slate-400">إجمالي الحالات اليوم</span>
                        <h4 className="text-lg font-black text-slate-900 mt-1">{tourPatients.length + 9}</h4>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm text-right">
                        <span className="text-[10px] font-semibold text-slate-400">قيد الانتظار</span>
                        <h4 className="text-lg font-black text-blue-600 mt-1">{tourPatients.filter(p => p.status === "waiting").length}</h4>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm text-right">
                        <span className="text-[10px] font-semibold text-slate-400">تم الكشف</span>
                        <h4 className="text-lg font-black text-emerald-600 mt-1">9</h4>
                      </div>
                    </div>

                    {/* Patient registration action simulator */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-slate-800">جرب إضافة مريض جديد للطابور بنفسك:</h4>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!tourNewPatientName.trim()) return;
                          
                          const dateObj = new Date();
                          let hours = dateObj.getHours();
                          const ampm = hours >= 12 ? "م" : "ص";
                          hours = hours % 12;
                          hours = hours ? hours : 12;
                          const minutes = dateObj.getMinutes().toString().padStart(2, "0");
                          const timeStr = `${hours}:${minutes} ${ampm}`;

                          const newPatient = {
                            id: Date.now(),
                            name: tourNewPatientName.trim(),
                            type: tourPatients.length % 2 === 0 ? "كشف جديد" : "استشارة",
                            time: timeStr,
                            status: "waiting"
                          };

                          setTourPatients([...tourPatients, newPatient]);
                          setTourNewPatientName("");
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={tourNewPatientName}
                          onChange={(e) => setTourNewPatientName(e.target.value)}
                          placeholder="اكتب اسم المريض هنا (مثال: كريم أحمد)..."
                          className="flex-1 text-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors text-right"
                          dir="rtl"
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة مريض
                        </button>
                      </form>
                    </div>

                    {/* Patients List Mockup */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex-1">
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/60 grid grid-cols-12 text-xs font-bold text-slate-500 text-right">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">اسم المريض</div>
                        <div className="col-span-2">النوع</div>
                        <div className="col-span-2">الوقت</div>
                        <div className="col-span-2 text-left">التحكم</div>
                      </div>
                      
                      <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                        {tourPatients.map((p, idx) => (
                          <div key={p.id} className="px-4 py-3.5 grid grid-cols-12 text-xs text-slate-700 items-center text-right hover:bg-slate-50/50 transition-colors">
                            <div className="col-span-1 font-bold text-slate-400">{idx + 1}</div>
                            <div className="col-span-5 font-bold text-slate-900">{p.name}</div>
                            <div className="col-span-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p.type === "كشف جديد" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                              }`}>
                                {p.type}
                              </span>
                            </div>
                            <div className="col-span-2 text-slate-500">{p.time}</div>
                            <div className="col-span-2 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setTourPatients(prev => prev.map((item) => {
                                    if (item.id === p.id) {
                                      return { ...item, status: "sent" };
                                    }
                                    return item;
                                  }));
                                  setTimeout(() => {
                                    setTourPatients(prev => prev.map((item) => {
                                      if (item.id === p.id) {
                                        return { ...item, status: "waiting" };
                                      }
                                      return item;
                                    }));
                                  }, 2000);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all duration-300 flex items-center justify-center gap-1 ml-0 mr-auto ${
                                  p.status === "sent" 
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                }`}
                              >
                                {p.status === "sent" ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    تم الإرسال
                                  </>
                                ) : (
                                  <>
                                    <WhatsAppIcon className="w-3.5 h-3.5" />
                                    إرسال واتساب
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TAB 2: جدول الحجوزات (Calendar Appointments) */}
                  <div 
                    className={`transition-all duration-500 space-y-6 flex-1 flex flex-col ${
                      activeTourTab === "calendar" ? "opacity-100 translate-y-0" : "absolute inset-0 opacity-0 pointer-events-none scale-95"
                    }`}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">جدول الحجوزات اليومي</h3>
                      <p className="text-xs text-slate-500 mt-0.5">تنظيم مواعيد الكشف والاستشارات وحجز فترات زمنية شاغرة.</p>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-xs font-bold text-slate-800">مواعيد يوم الجمعة - 29 مايو 2026</h4>
                        <span className="text-[10px] text-slate-500">انقر على فترة زمنية "فارغة" لحجزها فوراً:</span>
                      </div>

                      <div className="space-y-2.5">
                        {calendarAppointments.map((slot) => {
                          const isBooked = slot.status === "booked";
                          return (
                            <div 
                              key={slot.id}
                              onClick={() => {
                                setCalendarAppointments(prev => prev.map(s => {
                                  if (s.id === slot.id) {
                                    if (s.status === "available") {
                                      return { ...s, status: "booked", patient: "مريض تجريبي (أنت)", type: "كشف جديد" };
                                    } else {
                                      return { ...s, status: "available", patient: "", type: "" };
                                    }
                                  }
                                  return s;
                                }));
                              }}
                              className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                                isBooked 
                                  ? "bg-blue-50/50 border-blue-100 hover:bg-red-50 hover:border-red-100 group" 
                                  : "bg-white border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/10"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                  isBooked ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {slot.time}
                                </span>
                                <div>
                                  {isBooked ? (
                                    <>
                                      <h5 className="font-bold text-xs text-slate-900 group-hover:hidden">{slot.patient}</h5>
                                      <h5 className="font-bold text-xs text-red-650 hidden group-hover:block text-red-650">إلغاء حجز الموعد؟</h5>
                                      <p className="text-[9px] text-slate-400 mt-0.5 group-hover:hidden">{slot.type}</p>
                                    </>
                                  ) : (
                                    <h5 className="font-medium text-xs text-slate-400">فترة زمنية فارغة ومتاحة للحجز</h5>
                                  )}
                                </div>
                              </div>

                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                isBooked 
                                  ? "bg-blue-600 text-white group-hover:bg-red-650 group-hover:text-white" 
                                  : "bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white"
                              }`}>
                                {isBooked ? "حجز مؤكد" : "حجز سريع +"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* TAB 3: سجلات المرضى (Patients Directory) */}
                  <div 
                    className={`transition-all duration-500 space-y-6 flex-1 flex flex-col ${
                      activeTourTab === "patients" ? "opacity-100 translate-y-0" : "absolute inset-0 opacity-0 pointer-events-none scale-95"
                    }`}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">سجلات ملفات المرضى الطبية</h3>
                      <p className="text-xs text-slate-500 mt-0.5">تتبع تاريخ المريض، كتابة الروشتات الرقمية، والاطلاع على الأشعة والتحاليل.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
                      
                      {/* Left sidebar inside app (patient list) */}
                      <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-2xl p-4 space-y-3 flex-shrink-0 max-h-[360px] overflow-y-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">اضغط لاختيار مريض:</span>
                        <div className="space-y-2">
                          {tourPatientsDetails.map((p) => {
                            const isSelected = p.id === tourSelectedPatientId;
                            return (
                              <div 
                                key={p.id}
                                onClick={() => setTourSelectedPatientId(p.id)}
                                className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                  isSelected 
                                    ? "bg-blue-50 border-blue-100 shadow-sm" 
                                    : "bg-slate-50 border-transparent hover:bg-slate-100"
                                }`}
                              >
                                <div>
                                  <h5 className={`font-bold text-xs ${isSelected ? "text-blue-800" : "text-slate-700"}`}>{p.name}</h5>
                                  <p className="text-[9px] text-slate-400 mt-0.5">العمر: {p.age} سنة • {p.gender}</p>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-blue-600" : "bg-slate-300"}`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Main medical card view */}
                      {(() => {
                        const patient = tourPatientsDetails.find(p => p.id === tourSelectedPatientId) || tourPatientsDetails[1];
                        return (
                          <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4 flex flex-col justify-between overflow-y-auto max-h-[360px]">
                            
                            {/* Patient Quick Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                  {patient.name.substring(0, 2)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{patient.name}</h4>
                                  <p className="text-[10px] text-slate-500">الهاتف: {patient.phone} • ملف رقم: C-0082{patient.id}</p>
                                </div>
                              </div>
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">ملف طبي نشط</span>
                            </div>

                            {/* Symptoms & Diagnosis */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <h5 className="font-bold text-slate-800 mb-1">الشكوى الحالية:</h5>
                                <p className="text-slate-700 font-medium leading-relaxed text-[11px]">{patient.symptoms}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <h5 className="font-bold text-slate-800 mb-1">التشخيص الحالي:</h5>
                                <p className="text-slate-700 font-medium leading-relaxed text-[11px]">{patient.diagnosis}</p>
                              </div>
                            </div>

                            {/* Prescription Table */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 block">الروشتة الدوائية الموصوفة (Rx):</span>
                              <div className="border border-slate-100 rounded-xl overflow-hidden text-[11px]">
                                <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 grid grid-cols-12 font-bold text-slate-700">
                                  <div className="col-span-5 text-right">اسم الدواء</div>
                                  <div className="col-span-4 text-right">الجرعة المحددة</div>
                                  <div className="col-span-3 text-left">الفترة</div>
                                </div>
                                <div className="divide-y divide-slate-50">
                                  {patient.rx.map((medicine, index) => (
                                    <div key={index} className="px-3 py-2 grid grid-cols-12 text-slate-600">
                                      <div className="col-span-5 text-right font-bold text-slate-900">{medicine.name}</div>
                                      <div className="col-span-4 text-right">{medicine.dose}</div>
                                      <div className="col-span-3 text-left">{medicine.duration}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Files */}
                            <div className="space-y-1.5 flex-shrink-0">
                              <span className="text-[10px] font-bold text-slate-400 block">الملفات والمرفقات:</span>
                              <div className="flex gap-2">
                                <div className="border border-slate-200 hover:border-blue-400 rounded-xl p-2 flex items-center gap-2 cursor-pointer transition-colors bg-slate-50/50">
                                  <FileText className="w-7 h-7 text-red-500 flex-shrink-0" />
                                  <div className="text-right">
                                    <h6 className="font-bold text-[9px] text-slate-800 leading-tight">التقارير الطبية السابقة.pdf</h6>
                                    <p className="text-[8px] text-slate-400 mt-0.5">3.8 ميجابايت • 24 مايو 2026</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* TAB 4: الحسابات المالية (Finance Statistics) */}
                  <div 
                    className={`transition-all duration-500 space-y-6 flex-1 flex flex-col ${
                      activeTourTab === "finance" ? "opacity-100 translate-y-0" : "absolute inset-0 opacity-0 pointer-events-none scale-95"
                    }`}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">سجل الإيرادات والتحصيلات</h3>
                      <p className="text-xs text-slate-500 mt-0.5">إدارة ومتابعة المبالغ المحصلة من الكشوفات وتصفيتها بنوع وسيلة الدفع.</p>
                    </div>

                    {/* Financial summary metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-650 text-white p-4 rounded-2xl shadow-sm text-right relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 translate-y-4 translate-x-4">
                          <Wallet className="w-32 h-32" />
                        </div>
                        <span className="text-[10px] font-bold opacity-80 block">إجمالي التحصيلات</span>
                        <h4 className="text-xl sm:text-2xl font-black mt-1">1,400 <span className="text-xs font-normal">ج.م</span></h4>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm text-right">
                        <span className="text-[10px] font-semibold text-slate-400 block">الدفع النقدي (Cash)</span>
                        <h4 className="text-xl font-bold text-slate-800 mt-1">700 <span className="text-xs font-normal text-slate-500">ج.م</span></h4>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm text-right">
                        <span className="text-[10px] font-semibold text-slate-400 block">إنستاباي (InstaPay)</span>
                        <h4 className="text-xl font-bold text-emerald-600 mt-1">700 <span className="text-xs font-normal text-slate-500">ج.م</span></h4>
                      </div>
                    </div>

                    {/* Finance Filter buttons & Table */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col p-4 space-y-4">
                      
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
                        <h4 className="text-xs font-bold text-slate-800">تفاصيل فواتير اليوم:</h4>
                        
                        {/* Filter Pill switches */}
                        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setFinanceFilter("all")}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                              financeFilter === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            الكل
                          </button>
                          <button
                            type="button"
                            onClick={() => setFinanceFilter("cash")}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                              financeFilter === "cash" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            نقدي
                          </button>
                          <button
                            type="button"
                            onClick={() => setFinanceFilter("instapay")}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                              financeFilter === "instapay" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            InstaPay
                          </button>
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-[160px] divide-y divide-slate-100">
                        {financeTransactions
                          .filter(t => financeFilter === "all" ? true : t.method === financeFilter)
                          .map((t) => (
                            <div key={t.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                              <div className="text-right">
                                <h5 className="font-bold text-slate-900 text-xs">{t.patientName}</h5>
                                <p className="text-[9px] text-slate-400 mt-0.5">{t.type} • {t.date}</p>
                              </div>
                              <div className="flex items-center gap-3 text-left">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  t.method === "instapay" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-slate-100 text-slate-800 font-bold"
                                }`}>
                                  {t.method === "instapay" ? "InstaPay" : "نقدي"}
                                </span>
                                <span className="font-black text-slate-800">{t.amount} ج.م</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* TAB 5: إعدادات الواتساب والتذكير (WhatsApp Settings / Customizer) */}
                  <div 
                    className={`transition-all duration-500 space-y-6 flex-1 flex flex-col ${
                      activeTourTab === "settings" ? "opacity-100 translate-y-0" : "absolute inset-0 opacity-0 pointer-events-none scale-95"
                    }`}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">تنبيهات وتأكيدات الواتساب التلقائية</h3>
                      <p className="text-xs text-slate-500 mt-0.5">صمم قالب الرسائل وأرسل تذكيرات تلقائية للمرضى باللغة العربية بنقرة واحدة.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
                      
                      {/* Template Controls Card */}
                      <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-800">بيانات تجربة الإرسال التلقائي:</h4>
                          
                          {/* Patient Name Input */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 block">اسم المريض (تغيير تجريبي):</label>
                            <input
                              type="text"
                              value={waTemplateCustomName}
                              onChange={(e) => {
                                setWaTemplateCustomName(e.target.value);
                                setWaTemplateSent(false);
                              }}
                              className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 text-right"
                            />
                          </div>

                          {/* Appt Time Input */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 block">موعد الحجز كود التذكير:</label>
                            <input
                              type="text"
                              value={waTemplateCustomTime}
                              onChange={(e) => {
                                setWaTemplateCustomTime(e.target.value);
                                setWaTemplateSent(false);
                              }}
                              className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 text-right"
                            />
                          </div>

                          {/* Dynamic tags showcase */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-800 font-bold space-y-1">
                            <span className="font-black text-slate-900 block mb-1">الأكواد البرمجية المستخدمة في القالب:</span>
                            <p>• <span className="font-mono text-blue-800 font-black">{"{PatientName}"}</span>: اسم المريض المستهدف تلقائياً.</p>
                            <p>• <span className="font-mono text-blue-800 font-black">{"{BookingTime}"}</span>: ساعة وتوقيت حجز المريض المحدد.</p>
                          </div>
                        </div>

                        {/* Send Trigger Simulator */}
                        <button
                          type="button"
                          onClick={() => {
                            setWaTemplateSent(true);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
                        >
                          <Send className="w-4 h-4" />
                          إرسال تذكير تجريبي لهاتف العميل
                        </button>
                      </div>

                      {/* Smartphone Device Simulator Mockup */}
                      <div className="lg:col-span-6 flex justify-center items-center">
                        <div className="w-[280px] h-[360px] bg-slate-900 rounded-[36px] p-2.5 shadow-xl border-4 border-slate-800 flex flex-col overflow-hidden relative">
                          
                          {/* Notch */}
                          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30" />
                          
                          {/* Screen */}
                          <div className="flex-1 bg-[#efeae2] rounded-[28px] overflow-hidden flex flex-col relative pt-5">
                            
                            {/* WhatsApp Header bar */}
                            <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between z-10 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center font-bold text-[9px] text-slate-800">
                                  عيادة
                                </div>
                                <div className="text-right">
                                  <h6 className="font-bold text-[9px] leading-tight">عيادة الأمل التخصصية</h6>
                                  <span className="text-[7px] text-slate-200">نشط الآن</span>
                                </div>
                              </div>
                              <span className="text-[8px] opacity-80">12:30 م</span>
                            </div>

                            {/* Chat bubble body */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto flex flex-col justify-end pb-4">
                              
                              {/* WhatsApp Chat Message Bubble */}
                              <div className="bg-white border border-slate-100 rounded-2xl rounded-tr-none p-2.5 max-w-[85%] self-start shadow-sm text-[10px] leading-relaxed text-right relative text-slate-800">
                                <p className="font-bold text-[#075e54] text-[9px] border-b border-slate-100 pb-1 mb-1">عيادة الأمل التخصصية 🏥</p>
                                مرحباً يا <span className="font-bold text-slate-900 bg-yellow-100">{waTemplateCustomName}</span>، نود تذكيرك بموعد كشفك اليوم في تمام الساعة <span className="font-bold text-slate-900 bg-yellow-100">{waTemplateCustomTime}</span>.
                                <p className="mt-1 text-slate-800 font-bold">الرجاء الحضور قبل الموعد بـ 10 دقائق لتأكيد الدخول.</p>
                                <span className="text-[7px] text-slate-400 block text-left mt-1.5">12:30 م ✓✓</span>
                              </div>

                              {/* Simulated Phone push Notification alert */}
                              <div 
                                className={`absolute top-6 left-2 right-2 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl flex items-start gap-2.5 transition-all duration-500 z-20 border border-slate-700/50 ${
                                  waTemplateSent ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12 pointer-events-none"
                                }`}
                              >
                                <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                  <WhatsAppIcon className="w-4 h-4" />
                                </div>
                                <div className="text-right flex-1">
                                  <div className="flex items-center justify-between">
                                    <h6 className="font-bold text-[9px] text-emerald-400">تأكيد إرسال ناجح!</h6>
                                    <span className="text-[7px] text-slate-400">الآن</span>
                                  </div>
                                  <p className="text-[9px] text-slate-200 mt-0.5">تم إرسال رسالة الواتساب بنجاح إلى الرقم 010****{waTemplateCustomName.length * 13}</p>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>
          </ScrollReveal>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              onClick={scrollToTop}
              className="text-white font-bold text-lg tracking-tight flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            >
              <span className="bg-blue-600 text-white p-1.5 rounded-lg text-xs font-black aspect-square flex items-center justify-center">OS</span>
              ClinicOS Egypt
            </Link>
          </div>

          {/* Footer Nav Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href="#features" 
              onClick={(e) => handleScroll(e, "features")}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              المميزات
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleScroll(e, "pricing")}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              الأسعار
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleScroll(e, "faq")}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              الأسئلة الشائعة
            </a>
          </nav>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          جميع الحقوق محفوظة © {new Date().getFullYear()} • تطوير بواسطة <span className="text-slate-400 font-semibold">Orion Systems</span>
        </div>
      </footer>


    </div>
  );
}
