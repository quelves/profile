"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { Briefcase, Globe, BookOpen, GraduationCap, MapPin, Mail, Phone, Server, Users, Activity, Brain } from "lucide-react";
import { LinkedInIcon } from "@/components/icons";
import { useParams } from "next/navigation";
import { content, Locale } from "@/lib/content-i18n";

export default function AboutPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const t = content[lang as Locale]?.about || content.en.about;

  const timelineIcons = [Server, Globe, Users, Activity, Briefcase, Brain];
  const factIcons = [Briefcase, Globe, GraduationCap, BookOpen];

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.headerTitle}
          subtitle={t.headerSubtitle}
          centered
        />

        {/* Executive Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm mb-12"
        >
          <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">LQ</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.execName}</h3>
              <p className="text-slate-500 text-sm">{t.execRole}</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 leading-relaxed">
            <p>{t.execP1}</p>
            <p>{t.execP2}</p>
            <p>{t.execP3}</p>
            <p>{t.execP4}</p>
            <p>{t.execP5}</p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            {t.timelineTitle}
          </h3>

          <div className="space-y-4">
            {t.timeline.map((phase: any, index: number) => {
              const Icon = timelineIcons[index];
              return (
                <motion.div
                  key={phase.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <h4 className="font-bold text-slate-900">{phase.title}</h4>
                      <span className="text-xs font-semibold text-blue-600">{phase.year}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{phase.company}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{phase.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {t.facts.map((item: any, index: number) => {
            const Icon = factIcons[index];
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</div>
                  <div className="font-semibold text-slate-900">{item.value}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 rounded-2xl p-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t.contactTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={`mailto:${t.contactEmail}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="font-medium">{t.contactEmail}</span>
            </a>
            <a href={`tel:${t.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
              <Phone className="w-5 h-5 text-slate-400" />
              <span className="font-medium">{t.contactPhone}</span>
            </a>
            <a href="https://www.linkedin.com/in/quelves/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
              <LinkedInIcon className="w-5 h-5 text-slate-400" />
              <span className="font-medium">{t.contactLinkedIn}</span>
            </a>
            <span className="flex items-center gap-3 text-slate-700">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span className="font-medium">{t.contactLocation}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
