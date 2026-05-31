"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/section-header";
import { Mail, Phone, MapPin, MessageSquare, ExternalLink } from "lucide-react";
import { LinkedInIcon } from "@/components/icons";
import { useParams } from "next/navigation";
import { content, Locale } from "@/lib/content-i18n";

export default function ContactPage() {
  const { lang } = useParams() as { lang?: string };
  const t = content[lang as Locale]?.contact || content.en.contact;

  const contactMethods = [
    {
      icon: Mail,
      label: t.methodEmailLabel,
      value: t.methodEmailValue,
      href: "mailto:luiz@quelves.com",
      description: t.methodEmailDesc,
    },
    {
      icon: Phone,
      label: t.methodPhoneLabel,
      value: t.methodPhoneValue,
      href: "tel:+56996455952",
      description: t.methodPhoneDesc,
    },
    {
      icon: LinkedInIcon,
      label: t.methodLinkedInLabel,
      value: t.methodLinkedInValue,
      href: "https://www.linkedin.com/in/quelves",
      description: t.methodLinkedInDesc,
    },
  ];

  return (
    <div className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.headerTitle}
          subtitle={t.headerSubtitle}
          centered
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.label}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <method.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{method.label}</span>
                    {method.href.startsWith("http") && (
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-blue-600 font-medium truncate">{method.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{method.description}</p>
                </div>
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900 rounded-xl p-6 text-white mt-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">{t.locationTitle}</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t.locationAddress}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {t.locationAvailability}
              </p>
            </motion.div>
          </div>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-blue-200" />
              <h3 className="text-2xl font-bold">{t.valueTitle}</h3>
            </div>

            <ul className="space-y-4">
              {t.valueItems.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-2 shrink-0" />
                  <span className="text-blue-50">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-blue-100 text-sm">
                {t.valueFooter}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
