"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { Mic, Calendar, MapPin, Mail, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";
import { content, Locale } from "@/lib/content-i18n";

export default function SpeakingPage() {
  const { lang } = useParams();
  const t = content[lang as Locale]?.speaking || content.en.speaking;

  const placeholderParts = t.placeholder.split(t.linkedin);

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.headerTitle}
          subtitle={t.headerSubtitle}
          centered
        />

        {/* Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-600" />
            {t.topicsTitle}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.topics.map((topic: string, index: number) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                <span className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                <span className="text-slate-700 text-sm font-medium">{topic}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-3">{t.ctaTitle}</h3>
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

        {/* Future placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 text-sm">
            {placeholderParts[0]}
            <a href="https://www.linkedin.com/in/quelves/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {t.linkedin}
            </a>
            {placeholderParts[1]}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
