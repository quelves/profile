"use client";

import { motion } from "framer-motion";
import { StrategicInitiative } from "@/lib/data";
import { Calendar, Target, BarChart3, Shield, Cpu } from "lucide-react";

export function StrategicInitiativeCard({ initiative, index }: { initiative: StrategicInitiative; index: number }) {
  const roleColors: Record<string, string> = {
    "Arquitecto Enterprise & Líder Técnico": "bg-blue-600",
    "Chief AI Officer & Arquitecto de Procesos": "bg-violet-600",
    "VP of Engineering & Arquitecto Estratégico": "bg-emerald-600",
  };

  const roleColor = roleColors[initiative.role] || "bg-slate-600";

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`${roleColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
            {initiative.role}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {initiative.period}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
          {initiative.title}
        </h3>
        <p className="text-slate-500 font-medium text-sm mb-4">{initiative.company}</p>
        <p className="text-slate-700 italic leading-relaxed border-l-4 border-blue-200 pl-4">
          {initiative.subtitle}
        </p>
      </div>

      {/* Strategic Objective */}
      <div className="px-8 py-6 bg-slate-50 border-y border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Objetivo Estratégico</h4>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">{initiative.strategicObjective}</p>
      </div>

      {/* Business Impact */}
      <div className="px-8 py-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Impacto de Negocio</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {initiative.businessImpact.map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-2xl font-bold text-slate-900">{item.value}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{item.metric}</div>
              {item.context && (
                <div className="text-xs text-slate-400 mt-1">{item.context}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scope & Description */}
      <div className="px-8 py-6 border-t border-slate-100">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Alcance</h4>
          <p className="text-slate-600 text-sm leading-relaxed">{initiative.scope}</p>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">{initiative.description}</p>
      </div>

      {/* Architecture */}
      <div className="px-8 py-6 bg-slate-50 border-y border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-violet-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Arquitectura & Tecnología</h4>
        </div>
        <ul className="space-y-1.5 mb-4">
          {initiative.architecture.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          {initiative.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 bg-white text-slate-600 text-xs rounded-md border border-slate-200 font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Governance */}
      <div className="px-8 py-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Gobernanza & Riesgo</h4>
        </div>
        <ul className="space-y-1.5">
          {initiative.governance.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
