"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { content, Locale } from "@/lib/content-i18n";
import { LanguageSwitcher } from "./language-switcher";
import { Menu, X } from "lucide-react";

interface NavItem {
  key: string;
  href: string;
}

const navItems: NavItem[] = [
  { key: "impact", href: "impact/" },
  { key: "insights", href: "insights/" },
  { key: "research", href: "research/" },
  { key: "advisory", href: "advisory/" },
  { key: "speaking", href: "speaking/" },
  { key: "about", href: "about/" },
  { key: "contact", href: "contact/" },
];

export function Navigation({ locale }: { locale: Locale }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const localeParam = (params.lang as string) || locale || "es";
  const t = content[localeParam as Locale]?.nav || content.en.nav;

  const isActive = (href: string) => {
    return pathname.includes(`/${locale}/${href}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}/`} className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <span className="text-white font-bold text-sm tracking-tight">Q</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 text-sm tracking-widest uppercase">Quelves</span>
              <span className="block text-[10px] text-slate-500 tracking-wider -mt-0.5">{t.logoTagline}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}/${item.href}`}
                className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "text-slate-900 bg-slate-100"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.key === "impact" && t.impact}
                {item.key === "insights" && t.insights}
                {item.key === "research" && t.research}
                {item.key === "advisory" && t.advisory}
                {item.key === "speaking" && t.speaking}
                {item.key === "about" && t.about}
                {item.key === "contact" && t.contact}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={`/${locale}/${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "text-slate-900 bg-slate-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.key === "impact" && t.impact}
                  {item.key === "insights" && t.insights}
                  {item.key === "research" && t.research}
                  {item.key === "advisory" && t.advisory}
                  {item.key === "speaking" && t.speaking}
                  {item.key === "about" && t.about}
                  {item.key === "contact" && t.contact}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
