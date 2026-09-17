import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";

const KEY = "talento-lang";

/** Arabic dictionary keyed by the English source string. */
const ar: Record<string, string> = {
  // Shell / navigation
  Home: "الرئيسية",
  Jobs: "الوظائف",
  "My CV": "سيرتي الذاتية",
  More: "المزيد",
  Candidates: "المرشحون",
  "Career Analysis": "تحليل المسار المهني",
  "Career Gap Analysis": "تحليل الفجوة المهنية",
  "Career Path": "المسار المهني",
  "My Applications": "طلباتي",
  "Saved Jobs": "الوظائف المحفوظة",
  "AI Candidate Search": "البحث الذكي عن المرشحين",
  "AI CV Screening": "الفرز الذكي للسير الذاتية",
  "Saved Candidates": "المرشحون المحفوظون",
  "Company Profile": "ملف الشركة",
  "Log out": "تسجيل الخروج",
  Back: "رجوع",
  Notifications: "الإشعارات",
  Profile: "الملف الشخصي",
  "Dark mode": "الوضع الداكن",
  "Light mode": "الوضع الفاتح",
  Language: "اللغة",
  English: "الإنجليزية",
  Arabic: "العربية",
  Appearance: "المظهر",
  Theme: "السمة",
  Light: "فاتح",
  Dark: "داكن",
  Privacy: "الخصوصية",
  "Terms of Service": "شروط الخدمة",
  "Terms of service": "شروط الخدمة",
  "Help Center": "مركز المساعدة",
  "Help center": "مركز المساعدة",
  "Contact Us": "تواصل معنا",
  "Contact us": "تواصل معنا",
  Settings: "الإعدادات",
  Account: "الحساب",
  "Career tools": "أدوات المسار المهني",
  Preferences: "التفضيلات",
  Support: "الدعم",
  "Personal information": "المعلومات الشخصية",
  "My applications": "طلباتي",
  "Saved jobs": "الوظائف المحفوظة",
  "Career analysis": "تحليل المسار المهني",
  "Career gap analysis": "تحليل الفجوة المهنية",
  "Career path": "المسار المهني",
  unread: "غير مقروء",

  // CV page
  "Create, edit and manage your professional CV.": "أنشئ سيرتك الذاتية الاحترافية وعدّلها وأدرها.",
  "Edit CV": "تعديل السيرة الذاتية",
  "AI-generated CV": "سيرة ذاتية بالذكاء الاصطناعي",
  "Uploaded CV": "سيرة ذاتية مرفوعة",
  Complete: "مكتمل",
  Template: "القالب",
  Preview: "معاينة",
  "Download PDF": "تحميل PDF",
  "Upload new CV": "رفع سيرة ذاتية جديدة",
  "Open builder": "فتح المنشئ",
  "CV preview": "معاينة السيرة الذاتية",
  "CV templates": "قوالب السيرة الذاتية",
  Selected: "محدد",
  "Use this template": "استخدام هذا القالب",
  Education: "التعليم",
  Skills: "المهارات",
  Experience: "الخبرة",
  Projects: "المشاريع",
  Certifications: "الشهادات",
  Languages: "اللغات",
  Summary: "نبذة",
  "Certifications & languages": "الشهادات واللغات",
  "No experience added yet.": "لم تتم إضافة خبرة بعد.",
  "Preparing your PDF…": "جارٍ تجهيز ملف PDF…",
  "CV downloaded.": "تم تحميل السيرة الذاتية.",
  "We could not create the PDF. Please try again.": "تعذر إنشاء ملف PDF. يرجى المحاولة مرة أخرى.",
  "Classic": "كلاسيكي",
  "Modern": "عصري",
  "Compact": "مختصر",

  // Profile
  "This information powers your matching.": "هذه المعلومات تشغّل نظام المطابقة الخاص بك.",
  "Save changes": "حفظ التغييرات",
  "Discard changes": "تجاهل التغييرات",
  "You have unsaved changes.": "لديك تغييرات غير محفوظة.",
  "Your information was saved successfully.": "تم حفظ معلوماتك بنجاح.",
  "Full name": "الاسم الكامل",
  Email: "البريد الإلكتروني",
  Phone: "رقم الجوال",
  Location: "الموقع",
  Degree: "الدرجة العلمية",
  Major: "التخصص",
  University: "الجامعة",
  GPA: "المعدل التراكمي",
  "Graduation year": "سنة التخرج",
  "Years of experience": "سنوات الخبرة",
  "Certifications (comma separated)": "الشهادات (مفصولة بفواصل)",
  "Languages (comma separated)": "اللغات (مفصولة بفواصل)",
  "Enter your full name.": "أدخل اسمك الكامل.",
  "Enter a valid email.": "أدخل بريدًا إلكترونيًا صحيحًا.",

  // Settings
  "Choose the language used across Talento.": "اختر اللغة المستخدمة في تالنتو.",
  "Language set to Arabic.": "تم ضبط اللغة على العربية.",
  "Language set to English.": "تم ضبط اللغة على الإنجليزية.",
  "Choose how Talento looks on this device.": "اختر شكل تالنتو على هذا الجهاز.",
  "Profile visible to employers": "الملف مرئي لأصحاب العمل",
  "Job alerts": "تنبيهات الوظائف",
  "Send message": "إرسال الرسالة",
  "How can we help?": "كيف يمكننا مساعدتك؟",
};

interface Ctx {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (s: string) => string;
}

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Lang | null;
      if (saved === "ar" || saved === "en") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (s: string) => (lang === "ar" ? (ar[s] ?? s) : s),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) return { lang: "en" as Lang, dir: "ltr" as const, setLang: () => {}, t: (s: string) => s };
  return ctx;
}
