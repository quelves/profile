"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { AlertTriangle, Lightbulb, TrendingUp, Activity, Users, Globe, Brain, Server } from "lucide-react";
import { useParams } from "next/navigation";
import { content, Locale } from "@/lib/content-i18n";

interface ImpactCase {
  id: string;
  phase: string;
  period: string;
  company: string;
  title: string;
  icon: React.ElementType;
  problem: string;
  solution: string;
  impact: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
}

export default function ImpactPage() {
  const params = useParams();
  const lang = (params.lang as string) || "es";
  const t = content[lang as Locale]?.impact || content.en.impact;

  const cases: ImpactCase[] = [
    {
      id: "ai",
      icon: Brain,
      phase: t.cases.ai.phase,
      period: t.cases.ai.period,
      company: t.cases.ai.company,
      title: t.cases.ai.title,
      problem: t.cases.ai.problem,
      solution: t.cases.ai.solution,
      impact: t.cases.ai.impacts,
      metrics: t.cases.ai.metrics,
      tags: t.cases.ai.tags,
    },
    {
      id: "megamedia",
      icon: Activity,
      phase: t.cases.megamedia.phase,
      period: t.cases.megamedia.period,
      company: t.cases.megamedia.company,
      title: t.cases.megamedia.title,
      problem: t.cases.megamedia.problem,
      solution: t.cases.megamedia.solution,
      impact: t.cases.megamedia.impacts,
      metrics: t.cases.megamedia.metrics,
      tags: t.cases.megamedia.tags,
    },
    {
      id: "consolidation",
      icon: Server,
      phase: t.cases.consolidation.phase,
      period: t.cases.consolidation.period,
      company: t.cases.consolidation.company,
      title: t.cases.consolidation.title,
      problem: t.cases.consolidation.problem,
      solution: t.cases.consolidation.solution,
      impact: t.cases.consolidation.impacts,
      metrics: t.cases.consolidation.metrics,
      tags: t.cases.consolidation.tags,
    },
    {
      id: "search",
      icon: Globe,
      phase: t.cases.search.phase,
      period: t.cases.search.period,
      company: t.cases.search.company,
      title: t.cases.search.title,
      problem: t.cases.search.problem,
      solution: t.cases.search.solution,
      impact: t.cases.search.impacts,
      metrics: t.cases.search.metrics,
      tags: t.cases.search.tags,
    },
    {
      id: "sus",
      icon: Users,
      phase: t.cases.sus.phase,
      period: t.cases.sus.period,
      company: t.cases.sus.company,
      title: t.cases.sus.title,
      problem: t.cases.sus.problem,
      solution: t.cases.sus.solution,
      impact: t.cases.sus.impacts,
      metrics: t.cases.sus.metrics,
      tags: t.cases.sus.tags,
    },
  ];

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.headerTitle}
          subtitle={t.headerSubtitle}
          centered
        />

        <div className="space-y-12">
          {cases.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                          {item.phase}
                        </span>
                        <span className="text-xs text-slate-400">{item.period}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">{item.company}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body: Problem → Solution → Impact */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Problem */}
                  <div className="lg:border-r lg:border-slate-100 lg:pr-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        {t.labelProblem}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.problem}</p>
                  </div>

                  {/* Solution */}
                  <div className="lg:border-r lg:border-slate-100 lg:pr-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-500" />
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        {t.labelSolution}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.solution}</p>
                  </div>

                  {/* Impact */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        {t.labelImpact}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {item.impact.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-4">
                    {item.metrics.map((m) => (
                      <div key={m.label} className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{m.value}</div>
                        <div className="text-xs text-slate-500 mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-slate-900 rounded-2xl p-8 text-white text-center"
        >
          <p className="text-lg font-medium mb-2">{t.closingTitle}</p>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            {t.closingText}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
