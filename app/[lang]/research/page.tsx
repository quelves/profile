"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { publications } from "@/lib/data";
import { content, Locale } from "@/lib/content-i18n";
import { Microscope, BookOpen, FlaskConical, Cpu, GitBranch, Brain, ArrowRight, ExternalLink, TrendingUp, FileText, GraduationCap } from "lucide-react";

export default function ResearchPage() {
  const params = useParams();
  const lang = (params.lang as string) || "es";
  const t = content[lang as Locale]?.research || content.en.research;

  const researchLines = [
    {
      icon: Cpu,
      title: t.researchLine1Title,
      description: t.researchLine1Desc,
    },
    {
      icon: GitBranch,
      title: t.researchLine2Title,
      description: t.researchLine2Desc,
    },
    {
      icon: Brain,
      title: t.researchLine3Title,
      description: t.researchLine3Desc,
    },
  ];

  // Ordenar por año descendente (más reciente primero)
  const sortedPubs = [...publications].sort((a, b) => {
    const yearA = parseInt(a.year || "0");
    const yearB = parseInt(b.year || "0");
    return yearB - yearA;
  });

  const typeIcon = (type?: string) => {
    switch (type) {
      case "thesis": return GraduationCap;
      case "paper": return FileText;
      default: return FileText;
    }
  };

  const typeLabel = (type?: string) => {
    switch (type) {
      case "thesis": return t.typeThesis;
      case "paper": return t.typePaper;
      default: return t.typeDefault;
    }
  };

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.headerTitle}
          subtitle={t.headerSubtitle}
          centered
        />

        {/* Doctoral Thesis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-8 sm:p-10 text-white mb-16"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{t.thesisTitle}</h3>
              <p className="text-blue-100 leading-relaxed max-w-2xl">
                {t.thesisSubtitle}
              </p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-5 mb-5">
            <h4 className="font-semibold mb-2">{t.provisionalTitleLabel}</h4>
            <p className="text-blue-50 font-medium">
              {t.provisionalTitle}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-5">
            <h4 className="font-semibold mb-2">{t.hypothesisLabel}</h4>
            <p className="text-blue-100 text-sm leading-relaxed">
              {t.hypothesisText}
            </p>
          </div>
        </motion.div>

        {/* Research Lines */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-blue-600" />
            {t.researchLinesTitle}
          </h3>

          <div className="space-y-4">
            {researchLines.map((line, index) => (
              <motion.div
                key={line.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <line.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{line.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{line.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Evolution Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 rounded-2xl p-8 mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">{t.evolutionTitle}</h3>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            {t.evolutionP1}
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            {t.evolutionP2}
          </p>
        </motion.div>

        {/* Publications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            {t.publicationsTitle}
          </h3>

          <div className="space-y-4">
            {sortedPubs.map((pub, index) => {
              const Icon = typeIcon(pub.type);
              const isExternal = pub.url?.startsWith("http");
              return (
                <a
                  key={pub.id}
                  href={pub.url || "#"}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider rounded">
                        {typeLabel(pub.type)}
                      </span>
                      {pub.year && (
                        <span className="text-xs text-slate-400">{pub.year}</span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {pub.title}
                    </p>
                    {pub.institution && (
                      <p className="text-xs text-slate-500 mt-1">{pub.institution}</p>
                    )}
                    {pub.description && (
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{pub.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                        {isExternal ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                        {isExternal ? t.ctaExternal : t.ctaInternal}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>

        {/* External Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 bg-slate-50 rounded-2xl p-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t.referencesTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://www.researchgate.net/profile/Luiz-Da-Silva-6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              <div>
                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{t.researchGateTitle}</span>
                <p className="text-xs text-slate-500">{t.researchGateDesc}</p>
              </div>
            </a>
            <a
              href="https://www.linkedin.com/in/quelves/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              <div>
                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{t.linkedinTitle}</span>
                <p className="text-xs text-slate-500">{t.linkedinDesc}</p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
