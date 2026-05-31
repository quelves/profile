"use client";

import { motion } from "framer-motion";
import { Project } from "@/lib/data";
import { Calendar, ArrowUpRight } from "lucide-react";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-blue-600 font-medium">{project.company}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
        </div>

        <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          {project.period}
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-4">{project.description}</p>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Impacto</p>
          <ul className="space-y-1">
            {project.impact.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-100"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
