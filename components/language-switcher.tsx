"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

const localeLabels: Record<Locale, string> = {
  es: "ES",
  pt: "PT",
  en: "EN",
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (locale: Locale) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-slate-500" />
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleChange(locale)}
          className={`px-2 py-1 text-sm rounded-md transition-colors ${
            locale === currentLocale
              ? "bg-slate-900 text-white font-medium"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
