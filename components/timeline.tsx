"use client";

import { motion } from "framer-motion";
import { experiences } from "@/lib/data";
import { Calendar, MapPin } from "lucide-react";

export function Timeline() {
  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 md:-translate-x-px" />

      {experiences.map((exp, index) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`relative flex items-start gap-6 mb-12 ${
            index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          }`}
        >
          <div className="hidden md:block md:w-1/2" />

          <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-blue-600 rounded-full border-4 border-white shadow-sm -translate-x-1.5 mt-1.5 z-10" />

          <div className={`pl-10 md:pl-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {exp.period}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {exp.location}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{exp.role}</h3>
              <p className="text-blue-600 font-medium text-sm mb-3">{exp.company}</p>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{exp.description}</p>

              <ul className="space-y-1.5 mb-4">
                {exp.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5">
                {exp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
