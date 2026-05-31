"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { Briefcase, ArrowRight, Mail, Lightbulb, Target, Users, Cpu, BarChart3 } from "lucide-react";
import { useParams } from "next/navigation";
import { content, Locale } from "@/lib/content-i18n";

export default function AdvisoryPage() {
  const params = useParams();
  const lang = (params.lang as string) || "es";
  const t = content[lang as Locale]?.advisory || content.en.advisory;

  const services = [
    {
      icon: Lightbulb,
      title: t.service1Title,
      description: t.service1Desc,
    },
    {
      icon: Target,
      title: t.service2Title,
      description: t.service2Desc,
    },
    {
      icon: Cpu,
      title: t.service3Title,
      description: t.service3Desc,
    },
    {
      icon: BarChart3,
      title: t.service4Title,
      description: t.service4Desc,
    },
    {
      icon: Users,
      title: t.service5Title,
      description: t.service5Desc,
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

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <service.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{service.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 rounded-2xl p-8 mb-16"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t.philosophyTitle}</h3>
          <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
            <p>
              <strong>{t.philosophyP1.split(". ")[0]}.</strong> {t.philosophyP1.split(". ").slice(1).join(". ")}
            </p>
            <p>
              <strong>{t.philosophyP2.split(". ")[0]}.</strong> {t.philosophyP2.split(". ").slice(1).join(". ")}
            </p>
            <p>
              <strong>{t.philosophyP3.split(". ")[0]}.</strong> {t.philosophyP3.split(". ").slice(1).join(". ")}
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white text-center"
        >
          <Briefcase className="w-8 h-8 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">{t.ctaTitle}</h3>
          <p className="text-slate-300 leading-relaxed max-w-xl mx-auto mb-6">
            {t.ctaDesc}
          </p>
          <a
            href={`mailto:${t.ctaEmail}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            {t.ctaEmail}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
