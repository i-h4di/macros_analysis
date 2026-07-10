"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "en";

const LANG_KEY = "saarati.lang";
const DEFAULT_LANG: Lang = "ar";

const dict = {
  ar: {
    appName: "سعراتي",
    // BottomNav
    "nav.scan": "تحليل",
    "nav.stats": "السجل",
    "nav.calculator": "الحاسبة",
    "nav.profile": "ملفي",
    // Meal types
    "mealType.breakfast": "فطور",
    "mealType.lunch": "غداء",
    "mealType.dinner": "عشاء",
    "mealType.snack": "وجبة خفيفة",
    // Analyzer
    "scan.title": "حلّل وجبتك",
    "scan.subtitle": "اكتب وش أكلت واحصل على السعرات والماكروز فورًا بالذكاء الاصطناعي",
    "scan.placeholder": "مثال: شاورما دجاج مع ثومية  •  grilled chicken and rice",
    "scan.analyze": "حلّل الوجبة",
    "scan.analyzing": "جاري التحليل…",
    "scan.scanning": "جاري تقدير القيم الغذائية…",
    "scan.noItems": "ما تم التعرف على مكونات مفصّلة.",
    "scan.dailyTotal": "من هدفك اليومي",
    "scan.macros": "الماكروز",
    "scan.protein": "بروتين",
    "scan.carbs": "كارب",
    "scan.fats": "دهون",
    "scan.insight": "نصيحة صحية ذكية",
    "scan.save": "احفظ في السجل اليومي",
    "scan.saving": "جاري الحفظ…",
    "scan.another": "حلّل وجبة ثانية",
    "scan.portion": "حجم الحصة",
    "scan.mealName": "اسم الوجبة",
    "scan.errorGeneric": "صار خطأ أثناء التحليل. حاول مرة ثانية.",
    // Log
    "log.title": "سجلّك",
    "log.dailyEnergy": "الطاقة اليومية",
    "log.kcal": "سعرة",
    "log.mealsRecorded": "الوجبات المسجّلة",
    "log.meal": "وجبة",
    "log.meals": "وجبات",
    "log.empty.title": "ما فيه وجبات بعد",
    "log.empty.subtitle": "روح لتبويب التحليل وسجّل أول وجبة.",
    "log.savedToast": "تم حفظ الوجبة ✓",
    // Meal card
    "card.pro": "بروتين",
    "card.carb": "كارب",
    "card.fat": "دهون",
    "card.fiber": "ألياف",
    "card.kcal": "سعرة",
    "card.edit": "تعديل",
    "card.delete": "حذف",
    "card.confirmDelete": "متأكد؟ اضغط للتأكيد",
    "card.removing": "جاري الحذف…",
    "card.saveEdit": "حفظ التعديل",
    "card.cancel": "إلغاء",
    "card.calories": "السعرات",
    // Profile
    "profile.badge": "خسارة وزن",
    "profile.goalPerDay": "سعرة/يوم",
    "profile.weekly.title": "السعرات الأسبوعية",
    "profile.weekly.subtitle": "آخر 7 أيام مقابل الهدف",
    "profile.weekly.avg": "متوسط السعرات",
    "profile.weekly.empty": "سجّل وجبات عشان يظهر الرسم الأسبوعي.",
    "profile.info": "المعلومات الشخصية",
    "profile.fullName": "الاسم الكامل",
    "profile.targetWeight": "الوزن المستهدف",
    "profile.units": "نظام الوحدات",
    "profile.metric": "متري (كجم/سم)",
    "profile.imperial": "إمبراطوري (رطل/إنش)",
    "profile.healthKit": "مزامنة مع Health Kit",
    "profile.reminders": "تذكير الوجبات",
    "profile.language": "اللغة (Language)",
    "profile.reset": "إعادة تعيين الملف",
    "profile.defaultName": "اسمك",
    // Calculator
    "calc.title": "حاسبة السعرات",
    "calc.subtitle": "أدخل بياناتك واحصل على خطتك اليومية المخصصة لجسمك.",
    "calc.dimensions": "القياسات",
    "calc.weight": "الوزن (كجم)",
    "calc.height": "الطول (سم)",
    "calc.profile": "البيانات",
    "calc.age": "العمر (سنة)",
    "calc.gender": "الجنس",
    "calc.male": "ذكر",
    "calc.female": "أنثى",
    "calc.activity": "مستوى النشاط",
    "calc.activity.sedentary": "خامل (بدون رياضة تقريبًا)",
    "calc.activity.light": "خفيف (رياضة 1-3 أيام/أسبوع)",
    "calc.activity.moderate": "متوسط (رياضة 3-5 أيام/أسبوع)",
    "calc.activity.active": "نشيط (رياضة 6-7 أيام/أسبوع)",
    "calc.activity.veryActive": "نشيط جدًا (رياضة شاقة / عمل بدني)",
    "calc.calculate": "احسب احتياجك",
    "calc.error": "أدخل وزن وطول وعمر صحيحة.",
    "calc.target": "هدفك اليومي",
    "calc.maintenance": "سعرات الثبات · معدل الأيض الأساسي",
    "calc.suggestedMacros": "الماكروز المقترحة",
    "calc.setGoal": "اجعلها هدفي اليومي",
    "calc.savedGoal": "تم الحفظ كهدف يومي ✓",
    // Common
    "common.kcalUnit": "سعرة",
    "common.grams": "جم",
  },
  en: {
    appName: "Sa'arati",
    "nav.scan": "Scan",
    "nav.stats": "Stats",
    "nav.calculator": "Calculator",
    "nav.profile": "Profile",
    "mealType.breakfast": "Breakfast",
    "mealType.lunch": "Lunch",
    "mealType.dinner": "Dinner",
    "mealType.snack": "Snack",
    "scan.title": "Analyze Your Meal",
    "scan.subtitle": "Describe what you ate and get instant AI nutrition facts",
    "scan.placeholder": "e.g. grilled chicken shawarma with garlic sauce  •  شاورما دجاج",
    "scan.analyze": "ANALYZE MEAL",
    "scan.analyzing": "ANALYZING…",
    "scan.scanning": "Estimating nutrition…",
    "scan.noItems": "No individual items detected.",
    "scan.dailyTotal": "of your daily goal",
    "scan.macros": "Macros",
    "scan.protein": "Protein",
    "scan.carbs": "Carbs",
    "scan.fats": "Fats",
    "scan.insight": "AI HEALTH INSIGHT",
    "scan.save": "SAVE TO DAILY LOG",
    "scan.saving": "SAVING…",
    "scan.another": "ANALYZE ANOTHER",
    "scan.portion": "Portion size",
    "scan.mealName": "Meal name",
    "scan.errorGeneric": "Something went wrong. Please try again.",
    "log.title": "Your Log",
    "log.dailyEnergy": "Daily Energy",
    "log.kcal": "kcal",
    "log.mealsRecorded": "Meals Recorded",
    "log.meal": "MEAL",
    "log.meals": "MEALS",
    "log.empty.title": "No meals yet",
    "log.empty.subtitle": "Head to Scan to describe and log a meal.",
    "log.savedToast": "Meal saved ✓",
    "card.pro": "PRO",
    "card.carb": "CARB",
    "card.fat": "FAT",
    "card.fiber": "FIBER",
    "card.kcal": "KCAL",
    "card.edit": "Edit",
    "card.delete": "Delete",
    "card.confirmDelete": "Sure? Tap to confirm",
    "card.removing": "Removing…",
    "card.saveEdit": "Save changes",
    "card.cancel": "Cancel",
    "card.calories": "Calories",
    "profile.badge": "Weight Loss",
    "profile.goalPerDay": "kcal/day",
    "profile.weekly.title": "Weekly Caloric Intake",
    "profile.weekly.subtitle": "Last 7 days vs. goal",
    "profile.weekly.avg": "AVG KCAL",
    "profile.weekly.empty": "Log some meals to see your weekly trend.",
    "profile.info": "Personal Information",
    "profile.fullName": "Full Name",
    "profile.targetWeight": "Target Weight",
    "profile.units": "Unit Preferences",
    "profile.metric": "Metric (kg/cm)",
    "profile.imperial": "Imperial (lb/in)",
    "profile.healthKit": "Sync with Health Kit",
    "profile.reminders": "Meal Reminders",
    "profile.language": "Language (اللغة)",
    "profile.reset": "Reset Profile",
    "profile.defaultName": "Your Name",
    "calc.title": "Vitality Calculator",
    "calc.subtitle":
      "Enter your metrics to unlock your custom daily fuel plan tailored to your body's specific needs.",
    "calc.dimensions": "Dimensions",
    "calc.weight": "Weight (kg)",
    "calc.height": "Height (cm)",
    "calc.profile": "Profile",
    "calc.age": "Age (years)",
    "calc.gender": "Gender",
    "calc.male": "Male",
    "calc.female": "Female",
    "calc.activity": "Activity Level",
    "calc.activity.sedentary": "Sedentary (Little or no exercise)",
    "calc.activity.light": "Light (Exercise 1-3 days/week)",
    "calc.activity.moderate": "Moderate (Exercise 3-5 days/week)",
    "calc.activity.active": "Active (Exercise 6-7 days/week)",
    "calc.activity.veryActive": "Very Active (Hard exercise / physical job)",
    "calc.calculate": "CALCULATE VITALITY",
    "calc.error": "Please enter valid weight, height, and age.",
    "calc.target": "Your Daily Target",
    "calc.maintenance": "Maintenance calories · BMR",
    "calc.suggestedMacros": "Suggested Macros",
    "calc.setGoal": "SET AS MY DAILY GOAL",
    "calc.savedGoal": "SAVED AS DAILY GOAL ✓",
    "common.kcalUnit": "Kcal",
    "common.grams": "g",
  },
} as const;

export type TKey = keyof (typeof dict)["en"];

const WEEKDAYS: Record<Lang, string[]> = {
  ar: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
  en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
};

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (key: TKey) => string;
  weekdays: string[];
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue>({
  lang: DEFAULT_LANG,
  dir: "rtl",
  t: (key) => dict[DEFAULT_LANG][key] ?? key,
  weekdays: WEEKDAYS[DEFAULT_LANG],
  setLang: () => {},
});

export function readStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const raw = window.localStorage.getItem(LANG_KEY);
  return raw === "en" || raw === "ar" ? raw : DEFAULT_LANG;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(readStoredLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    window.localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  }, []);

  const t = useCallback((key: TKey) => dict[lang][key] ?? key, [lang]);

  return (
    <I18nContext.Provider
      value={{
        lang,
        dir: lang === "ar" ? "rtl" : "ltr",
        t,
        weekdays: WEEKDAYS[lang],
        setLang,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useT(): I18nValue {
  return useContext(I18nContext);
}
