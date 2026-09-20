import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  "CV": "السيرة الذاتية",
  "Application": "الطلب",
  More: "المزيد",
  Candidates: "المرشحون",
  "Career Analysis": "تحليل المسار المهني",
  "Career Gap Analysis": "تحليل الفجوة المهنية",
  "Career Path": "المسار المهني",
  "My Applications": "طلباتي",
  "Saved Jobs": "الوظائف المحفوظة",
  "AI Candidate Search": "البحث الذكي عن المرشحين",
  "AI CV Screening": "الفرز الذكي للسير الذاتية",
  "All Candidates": "جميع المرشحين",
  "Hiring tools": "أدوات التوظيف",
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
  Team: "الفريق",
  "AI Assistant": "المساعد الذكي",
  "AI tools / assistance": "أدوات ومساعدة الذكاء الاصطناعي",
  "Personal information": "المعلومات الشخصية",
  "My applications": "طلباتي",
  "Saved jobs": "الوظائف المحفوظة",
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

  // Common actions and states
  "Get Started": "ابدأ الآن",
  "Log in": "تسجيل الدخول",
  "Create an account": "إنشاء حساب",
  "Create Account": "إنشاء الحساب",
  Continue: "متابعة",
  Cancel: "إلغاء",
  Save: "حفظ",
  Saved: "محفوظ",
  Selected: "محدد",
  Close: "إغلاق",
  Search: "بحث",
  "Search candidates": "البحث عن مرشحين",
  "View details": "عرض التفاصيل",
  "Hide details": "إخفاء التفاصيل",
  "View profile": "عرض الملف الشخصي",
  "See all": "عرض الكل",
  "Try again": "حاول مرة أخرى",
  "Go home": "العودة للرئيسية",
  "Loading your workspace…": "جارٍ تحميل مساحة العمل…",
  All: "الكل",
  Active: "نشطة",
  Draft: "مسودة",
  Closed: "مغلقة",
  Applied: "تم التقديم",
  "Under Review": "قيد المراجعة",
  Interview: "مقابلة",
  Rejected: "مرفوض",
  Hired: "تم التوظيف",
  Match: "متطابق",
  Partial: "متطابق جزئيًا",
  Missing: "مفقود",
  "Needs improvement": "يحتاج إلى تحسين",
  match: "تطابق",

  // Landing and authentication
  "AI recruitment & career platform": "منصة توظيف ومسار مهني مدعومة بالذكاء الاصطناعي",
  "Right Talent.": "الموهبة المناسبة.",
  "Brighter Futures.": "مستقبل أكثر إشراقًا.",
  "Talento helps people understand where they stand, what they are missing, and how to get there — while helping companies find and evaluate the right talent faster.": "تساعد تالنتو الأفراد على فهم مستواهم وما ينقصهم وكيف يصلون إلى أهدافهم، وتساعد الشركات على إيجاد المواهب المناسبة وتقييمها بسرعة أكبر.",
  Talents: "موهبة",
  Companies: "شركة",
  "Faster hiring": "توظيف أسرع",
  "Match accuracy": "دقة المطابقة",
  "One platform, two journeys": "منصة واحدة، مساران",
  "Know where you stand": "اعرف مستواك",
  "AI career analysis scores your readiness and explains every point of the score.": "يقيّم التحليل المهني الذكي جاهزيتك ويشرح كل عنصر في النتيجة.",
  "See what is missing": "اكتشف ما ينقصك",
  "Gap analysis compares your profile with any target job, skill by skill.": "يقارن تحليل الفجوة ملفك بأي وظيفة مستهدفة، مهارةً بمهارة.",
  "Build a real CV": "أنشئ سيرة ذاتية احترافية",
  "Create a professional CV with AI, upload an existing one, or write it yourself.": "أنشئ سيرة ذاتية احترافية بالذكاء الاصطناعي أو ارفع سيرتك الحالية أو اكتبها بنفسك.",
  "Hire with evidence": "وظّف بناءً على أدلة",
  "Employers search candidates in plain language and see why each one matches.": "يبحث أصحاب العمل عن المرشحين بلغة طبيعية ويرون أسباب مطابقة كل مرشح.",
  "For job seekers": "للباحثين عن عمل",
  "Build your CV, measure your readiness, find matching jobs and follow a step-by-step career path.": "أنشئ سيرتك الذاتية، وقِس جاهزيتك، واعثر على وظائف مناسبة، واتبع مسارًا مهنيًا خطوة بخطوة.",
  "For employers & HR": "لأصحاب العمل والموارد البشرية",
  "Post jobs with AI, screen CVs automatically and rank candidates with explained match scores.": "انشر الوظائف بالذكاء الاصطناعي، وافحص السير الذاتية تلقائيًا، ورتّب المرشحين بنتائج مطابقة موضحة.",
  "Welcome back": "مرحبًا بعودتك",
  "Log in to continue your journey with Talento.": "سجّل الدخول لمتابعة رحلتك مع تالنتو.",
  "Job Seeker": "باحث عن عمل",
  "Employer / HR": "صاحب عمل / موارد بشرية",
  Password: "كلمة المرور",
  "Logging in…": "جارٍ تسجيل الدخول…",
  "New to Talento?": "جديد في تالنتو؟",
  "Choose your role": "اختر دورك",
  "Let's get you started.": "لنبدأ معًا.",
  "Step 1 of 4": "الخطوة 1 من 4",
  "Step 2 of 4": "الخطوة 2 من 4",
  "Step 3 of 4": "الخطوة 3 من 4",
  "Step 4 of 4": "الخطوة 4 من 4",
  "Find opportunities, build your CV, and grow your career with AI guidance.": "اكتشف الفرص، وأنشئ سيرتك الذاتية، وطوّر مسارك بإرشاد ذكي.",
  "Find top talent, simplify hiring, and build your team with AI matching.": "اكتشف أفضل المواهب، وبسّط التوظيف، وابنِ فريقك بالمطابقة الذكية.",
  "Select a role to continue.": "اختر دورًا للمتابعة.",
  "Choose a demo role or create a real account.": "اختر دورًا تجريبيًا أو أنشئ حسابًا حقيقيًا.",
  "Enter Demo": "دخول العرض التجريبي",
  "Create Your Account": "أنشئ حسابك",
  "Join a community that builds brighter futures.": "انضم إلى مجتمع يصنع مستقبلًا أكثر إشراقًا.",
  "Full Name": "الاسم الكامل",
  "At least 8 characters": "8 أحرف على الأقل",
  "Creating account…": "جارٍ إنشاء الحساب…",
  "or continue with": "أو تابع باستخدام",
  "Continue with Google": "المتابعة باستخدام Google",
  "Continue with Microsoft": "المتابعة باستخدام Microsoft",
  "Already have an account?": "لديك حساب بالفعل؟",
  "Check Your Email": "تحقق من بريدك الإلكتروني",
  "We've sent a verification link to": "أرسلنا رابط تحقق إلى",
  "Click the link to verify your account and continue.": "انقر على الرابط لتأكيد حسابك والمتابعة.",
  "Save email": "حفظ البريد الإلكتروني",
  "I verified my email": "تم التحقق من بريدي الإلكتروني",
  "Resend Email": "إعادة إرسال البريد",
  "Change Email": "تغيير البريد الإلكتروني",
  "Didn't receive the email?": "لم يصلك البريد؟",
  "• Check your spam folder": "• تحقق من مجلد الرسائل غير المرغوب فيها",
  "• Make sure the address is correct": "• تأكد من صحة العنوان",
  "• You can resend the email after 60 seconds": "• يمكنك إعادة الإرسال بعد 60 ثانية",
  "Tell us about you": "أخبرنا عن نفسك",
  "Tell us about your company": "أخبرنا عن شركتك",
  "This powers your matches. You can change everything later.": "تُستخدم هذه البيانات للمطابقة، ويمكنك تعديلها لاحقًا.",
  "Your skills": "مهاراتك",
  "Company name": "اسم الشركة",
  Industry: "القطاع",
  "Company size": "حجم الشركة",
  Website: "الموقع الإلكتروني",
  Description: "الوصف",
  "Finish setup": "إكمال الإعداد",

  // Matching and career
  "Required skills": "المهارات المطلوبة",
  "Preferred skills": "المهارات المفضلة",
  "Relevant projects": "المشاريع ذات الصلة",
  "Why this matches you": "لماذا تناسبك هذه الوظيفة",
  "Why this score": "لماذا هذه النتيجة",
  "Why you match": "لماذا أنت مناسب",
  "Save job": "حفظ الوظيفة",
  "Remove from saved jobs": "إزالة من الوظائف المحفوظة",
  "No required skills are missing.": "لا توجد مهارات مطلوبة مفقودة.",
  "Your profile overlaps only partly with the required skills.": "يتوافق ملفك جزئيًا فقط مع المهارات المطلوبة.",
  "Open to fresh graduates — experience requirement met.": "متاحة للخريجين الجدد — متطلب الخبرة مستوفى.",
  "No preferred skills listed for this role.": "لا توجد مهارات مفضلة محددة لهذا الدور.",
  "No certifications required.": "لا توجد شهادات مطلوبة.",
  "Skills depth": "عمق المهارات",
  "CV completeness": "اكتمال السيرة الذاتية",

  // Employer shared
  "Hiring dashboard": "لوحة التوظيف",
  "Smart hiring starts here": "التوظيف الذكي يبدأ هنا",
  "Post a job": "نشر وظيفة",
  "AI candidate search": "البحث الذكي عن المرشحين",
  "Active jobs": "الوظائف النشطة",
  "Total applicants": "إجمالي المتقدمين",
  Shortlisted: "القائمة المختصرة",
  Interviews: "المقابلات",
  "Recent applications": "أحدث الطلبات",
  "Hiring activity": "نشاط التوظيف",
  "All candidates": "كل المرشحين",
  Company: "الشركة",
  "Company profile & team": "ملف الشركة والفريق",
  "Preferences & support": "التفضيلات والدعم",
  "Email alerts for new applicants": "تنبيهات البريد للمتقدمين الجدد",
  "Show hiring team on job posts": "إظهار فريق التوظيف في إعلانات الوظائف",
  "How does Talento rank candidates?": "كيف ترتب تالنتو المرشحين؟",
  "Which CV formats can I screen?": "ما صيغ السير الذاتية التي يمكن فحصها؟",
  "Can I edit an AI-generated job post?": "هل يمكنني تعديل إعلان وظيفة أنشأه الذكاء الاصطناعي؟",
  "Still need help? Contact us": "هل ما زلت بحاجة للمساعدة؟ تواصل معنا",
  "Describe your question or issue": "صف سؤالك أو المشكلة",
  "Reply email": "بريد الرد",
  "Or email employers@talento.sa": "أو راسل employers@talento.sa",

  // Errors and accessibility
  "Page not found": "الصفحة غير موجودة",
  "The page you're looking for doesn't exist or has been moved.": "الصفحة التي تبحث عنها غير موجودة أو نُقلت.",
  "This page didn't load": "تعذر تحميل هذه الصفحة",
  "Something went wrong on our end. You can try refreshing or head back home.": "حدث خطأ من جانبنا. يمكنك إعادة المحاولة أو العودة للرئيسية.",

  // Seeker workspace
  "Welcome back,": "مرحبًا بعودتك،",
  Readiness: "الجاهزية",
  "Career analysis": "تحليل المسار المهني",
  "Career gap analysis": "تحليل الفجوة المهنية",
  "Profile completion": "اكتمال الملف الشخصي",
  "CV status": "حالة السيرة الذاتية",
  "Active applications": "الطلبات النشطة",
  "Not created": "لم تُنشأ",
  "Finish your profile to improve matching": "أكمل ملفك لتحسين المطابقة",
  "Profiles above 90% get 2x more employer views.": "تحصل الملفات المكتملة بأكثر من 90% على ضعف مشاهدات أصحاب العمل.",
  "Complete profile": "إكمال الملف الشخصي",
  "Recommended for you": "موصى بها لك",
  "Recently viewed": "شوهدت مؤخرًا",
  "Career development suggestions": "اقتراحات التطور المهني",
  "Open career path": "فتح المسار المهني",
  "Find jobs": "البحث عن وظائف",
  "Search by title, company or skill": "ابحث بالمسمى أو الشركة أو المهارة",
  "All types": "كل الأنواع",
  "All locations": "كل المواقع",
  "Most relevant": "الأكثر صلة",
  "Highest match": "أعلى تطابق",
  "Newest": "الأحدث",
  "No jobs match your filters": "لا توجد وظائف تطابق عوامل التصفية",
  "Try changing or clearing your filters.": "جرّب تغيير عوامل التصفية أو مسحها.",
  "Clear filters": "مسح عوامل التصفية",
  "Job details": "تفاصيل الوظيفة",
  "Job not found": "الوظيفة غير موجودة",
  "This job may have been closed or removed.": "ربما أُغلقت هذه الوظيفة أو أزيلت.",
  "Back to jobs": "العودة إلى الوظائف",
  "Open to graduates": "متاحة للخريجين",
  "About this role": "عن هذا الدور",
  Responsibilities: "المسؤوليات",
  Requirements: "المتطلبات",
  "Great match — you meet nearly every requirement.": "تطابق ممتاز — تستوفي معظم المتطلبات.",
  "Good match with a few gaps you can close quickly.": "تطابق جيد مع بعض الفجوات التي يمكنك سدها بسرعة.",
  "Partial match — focus on the missing skills first.": "تطابق جزئي — ركّز أولًا على المهارات المفقودة.",
  "You have": "لديك",
  "Nice to have": "مهارات إضافية",
  "Application submitted": "تم إرسال الطلب",
  "Submitting…": "جارٍ الإرسال…",
  "Apply now": "قدّم الآن",
  "View my applications": "عرض طلباتي",
  "What to do next": "ما الخطوة التالية",
  "Open my career path": "فتح مساري المهني",
  "No applications here yet": "لا توجد طلبات هنا بعد",
  "When you apply to a job it will appear here with its live status.": "عندما تتقدم لوظيفة ستظهر هنا مع حالتها الحالية.",
  "Browse jobs": "تصفح الوظائف",
  "Open job": "فتح الوظيفة",
  "CV screening": "فحص السيرة الذاتية",
  "Hiring team review": "مراجعة فريق التوظيف",
  Pending: "قيد الانتظار",
  "CV screened by AI": "تم فحص السيرة الذاتية بالذكاء الاصطناعي",
  "Under review by hiring team": "قيد مراجعة فريق التوظيف",
  "Not selected": "لم يتم الاختيار",
  "No saved jobs yet": "لا توجد وظائف محفوظة بعد",
  "Tap the bookmark icon on any job to keep it here for later.": "اضغط رمز الحفظ على أي وظيفة للاحتفاظ بها هنا.",
  "Target job": "الوظيفة المستهدفة",
  "Your profile compared with the requirements of a target job.": "مقارنة ملفك بمتطلبات الوظيفة المستهدفة.",
  "Matching skills": "المهارات المتطابقة",
  "Missing skills": "المهارات المفقودة",
  "No required skills matched yet.": "لا توجد مهارات مطلوبة متطابقة حتى الآن.",
  "Nothing missing — you are covered.": "لا يوجد نقص — جميع المتطلبات مغطاة.",
  "You already cover the preferred skills too.": "أنت تغطي المهارات المفضلة أيضًا.",
  "Build my career path": "إنشاء مساري المهني",
  "View this job": "عرض هذه الوظيفة",
  "Overall readiness": "الجاهزية العامة",
  "Run AI analysis": "تشغيل التحليل الذكي",
  "Analysing…": "جارٍ التحليل…",
  Strengths: "نقاط القوة",
  "Areas for improvement": "مجالات التحسين",
  "Recommended skills": "المهارات الموصى بها",
  "No saved candidates yet": "لا يوجد مرشحون محفوظون بعد",

  // CV builder
  "AI CV Builder": "منشئ السيرة الذاتية الذكي",
  "Choose how to build your CV": "اختر طريقة إنشاء سيرتك الذاتية",
  "Build with AI": "الإنشاء بالذكاء الاصطناعي",
  "Upload a CV": "رفع سيرة ذاتية",
  "Start manually": "البدء يدويًا",
  "Question": "السؤال",
  "Write freely — the AI will structure and improve the wording.": "اكتب بحرية — سيُنظم الذكاء الاصطناعي الصياغة ويحسنها.",
  "Please answer this question before continuing.": "يرجى الإجابة عن هذا السؤال قبل المتابعة.",
  "Generating your CV…": "جارٍ إنشاء سيرتك الذاتية…",
  "Generate my CV": "إنشاء سيرتي الذاتية",
  "Edit every section": "تعديل جميع الأقسام",
  "Professional title": "المسمى المهني",
  "Professional summary": "الملخص المهني",
  "Save CV": "حفظ السيرة الذاتية",
  "CV saved.": "تم حفظ السيرة الذاتية.",
  "Your CV is ready.": "سيرتك الذاتية جاهزة.",
  "File must be under 10 MB.": "يجب ألا يتجاوز حجم الملف 10 ميجابايت.",
  "Clean single column, ATS friendly.": "عمود واحد واضح ومتوافق مع أنظمة تتبع المتقدمين.",
  "Teal accents with a skills sidebar.": "لمسات فيروزية مع شريط جانبي للمهارات.",
  "Fits more detail on one page.": "يعرض تفاصيل أكثر في صفحة واحدة.",

  // Employer workspace
  "AI CV screening": "فحص السير الذاتية الذكي",
  "Saved candidates": "المرشحون المحفوظون",
  "Post a new job": "نشر وظيفة جديدة",
  "Job management": "إدارة الوظائف",
  "Applicants": "المتقدمون",
  "What are you looking for?": "ما الذي تبحث عنه؟",
  "Searching…": "جارٍ البحث…",
  "How Talento read your request": "كيف فهمت تالنتو طلبك",
  "Not specified": "غير محدد",
  Availability: "التوفر",
  Filters: "عوامل التصفية",
  "Apply filters": "تطبيق عوامل التصفية",
  "Clear all": "مسح الكل",
  "Best match": "الأكثر تطابقًا",
  "Most recent": "الأحدث",
  "Full-time": "دوام كامل",
  Internship: "تدريب",
  Remote: "عن بُعد",
  Riyadh: "الرياض",
  Dhahran: "الظهران",
  Jeddah: "جدة",
  Immediately: "فورًا",
  "Any availability": "أي وقت توفر",
  "Any location": "أي موقع",
  "1 month": "شهر",
  "3 months": "3 أشهر",
  "Search by job title, skill or company": "ابحث بالمسمى أو المهارة أو الشركة",
  "No candidate fits that description yet": "لا يوجد مرشح يطابق هذا الوصف حتى الآن",
  "Try relaxing one requirement — for example the location or the exact graduation year.": "جرّب تخفيف أحد المتطلبات، مثل الموقع أو سنة التخرج المحددة.",
  "Compare against job": "المقارنة مع وظيفة",
  "Search by name, skill, major or university": "ابحث بالاسم أو المهارة أو التخصص أو الجامعة",
  "Hiring stage": "مرحلة التوظيف",
  "AI Match Insight": "رؤية المطابقة الذكية",
  "Contact candidate": "التواصل مع المرشح",
  "View CV": "عرض السيرة الذاتية",
  "Shortlist": "إضافة للقائمة المختصرة",
  "Company profile": "ملف الشركة",
  "Team members": "أعضاء الفريق",
  "Save company profile": "حفظ ملف الشركة",
  "Add team member": "إضافة عضو للفريق",
  "Job title": "المسمى الوظيفي",
  "Job type": "نوع الوظيفة",
  Salary: "الراتب",
  "Required education": "التعليم المطلوب",
  "Required experience": "الخبرة المطلوبة",
  "Generate with AI": "الإنشاء بالذكاء الاصطناعي",
  "Save draft": "حفظ كمسودة",
  Publish: "نشر",
  "Message sent. Our team replies within one business day.": "تم إرسال الرسالة. سيرد فريقنا خلال يوم عمل واحد.",
  "Please add a few more details (10 characters minimum).": "يرجى إضافة مزيد من التفاصيل (10 أحرف على الأقل).",
  "Or email support@talento.sa": "أو راسل support@talento.sa",
  "Talento guidance for your role": "إرشادات تالنتو المناسبة لدورك",
  "How can I help?": "كيف يمكنني مساعدتك؟",
  "Ask about Talento features, match scores, or your next step.": "اسأل عن ميزات تالنتو أو نسب المطابقة أو خطوتك التالية.",
  "Ask the Talento AI Assistant": "اسأل مساعد تالنتو الذكي",
  "Thinking…": "جارٍ التفكير…",
  "Get help using your Talento career tools.": "احصل على مساعدة في استخدام أدوات تالنتو المهنية.",
  "Get help using your Talento hiring tools.": "احصل على مساعدة في استخدام أدوات التوظيف في تالنتو.",
  "How do I edit my CV?": "كيف أعدل سيرتي الذاتية؟",
  "What does my Match % mean?": "ماذا تعني نسبة المطابقة لدي؟",
  "How do I use Career Gap Analysis?": "كيف أستخدم تحليل الفجوة المهنية؟",
  "How do I find a suitable job?": "كيف أجد وظيفة مناسبة؟",
  "What does my Career Path mean?": "ماذا يعني مساري المهني؟",
  "How do I search for candidates?": "كيف أبحث عن مرشحين؟",
  "How do I use AI CV Screening?": "كيف أستخدم الفحص الذكي للسير الذاتية؟",
  "What does Candidate Match % mean?": "ماذا تعني نسبة مطابقة المرشح؟",
  "How do I publish a job?": "كيف أنشر وظيفة؟",
  "How do I manage applicants?": "كيف أدير المتقدمين؟",
};

const dynamicArabic: Array<[RegExp, (...parts: string[]) => string]> = [
  [/^(\d+)% match$/, (score) => `${score}% تطابق`],
  [/^(\d+) applications in total$/, (count) => `${count} طلبات إجمالًا`],
  [/^(\d+) saved$/, (count) => `${count} محفوظة`],
  [/^(\d+) unread$/, (count) => `${count} غير مقروء`],
  [/^(\d+) candidates found$/, (count) => `تم العثور على ${count} مرشحين`],
  [/^Resend in (\d+)s$/, (seconds) => `إعادة الإرسال خلال ${seconds} ث`],
  [/^(\d+) of (\d+)$/, (current, total) => `${current} من ${total}`],
];

function translateArabic(source: string) {
  const exact = ar[source];
  if (exact) return exact;
  for (const [pattern, render] of dynamicArabic) {
    const match = source.match(pattern);
    if (match) return render(...match.slice(1));
  }
  return source;
}

interface Ctx {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (s: string) => string;
}

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const originalsRef = useRef(new WeakMap<Node, string>());

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (lang !== "ar") {
      // Restore any text/attributes a previous Arabic pass replaced.
      const originals = originalsRef.current;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n) {
        const original = originals.get(n);
        if (original !== undefined && n.textContent !== original) n.textContent = original;
        n = walker.nextNode();
      }
      for (const element of document.body.querySelectorAll("[data-i18n-placeholder],[data-i18n-aria-label],[data-i18n-title]")) {
        for (const attr of ["placeholder", "aria-label", "title"] as const) {
          const original = element.getAttribute(`data-i18n-${attr}`);
          if (original !== null && element.getAttribute(attr) !== original) element.setAttribute(attr, original);
        }
      }
      return;
    }
    const originals = originalsRef.current;
    let frame = 0;
    let disposed = false;
    const pending = new Set<ParentNode>();

    const translateElement = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        if (parent && !parent.closest("[data-no-translate]")) {
          const current = node.textContent ?? "";
          const original = originals.get(node) ?? current;
          originals.set(node, original);
          const leading = original.match(/^\s*/)?.[0] ?? "";
          const trailing = original.match(/\s*$/)?.[0] ?? "";
          const core = original.trim();
          const next = core ? `${leading}${translateArabic(core)}${trailing}` : original;
          if (next !== current) node.textContent = next;
        }
        node = walker.nextNode();
      }

      const elements =
        root instanceof Element ? [root, ...root.querySelectorAll("*")] : [...root.querySelectorAll("*")];
      for (const element of elements) {
        if (element.closest("[data-no-translate]")) continue;
        for (const attr of ["placeholder", "aria-label", "title"] as const) {
          const value = element.getAttribute(attr);
          if (!value) continue;
          const key = `data-i18n-${attr}`;
          const original = element.getAttribute(key) ?? value;
          const next = translateArabic(original);
          if (element.getAttribute(key) !== original) element.setAttribute(key, original);
          if (value !== next) element.setAttribute(attr, next);
        }
      }
    };

    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        if (change.type === "characterData") {
          const parent = change.target.parentElement;
          if (parent) pending.add(parent);
        } else {
          change.addedNodes.forEach((node) => {
            if (node instanceof Element) pending.add(node);
            else if (node.parentElement) pending.add(node.parentElement);
          });
        }
      }
      if (pending.size && !frame) {
        frame = requestAnimationFrame(flush);
      }
    });

    function flush() {
      frame = 0;
      if (disposed) return;
      const roots = [...pending];
      pending.clear();
      observer.disconnect();
      for (const root of roots) {
        if (root instanceof Element && !root.isConnected) continue;
        translateElement(root);
      }
      // Drop the mutations we just caused so they don't re-trigger a pass.
      observer.takeRecords();
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    translateElement(document.body);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
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
      t: (s: string) => (lang === "ar" ? translateArabic(s) : s),
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
