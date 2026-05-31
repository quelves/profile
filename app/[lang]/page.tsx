"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, BookOpen, Brain, Target, TrendingUp, Compass, Mic, Sparkles, Lightbulb, Briefcase, FlaskConical, Users, Server, Activity } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { content, Locale } from "@/lib/content-i18n";

export default function HomePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const t = content[lang as Locale]?.home || content.en.home;
  const posts = getAllPosts().slice(0, 3);

  const phases = [
    {
      year: t.phase1Year,
      title: t.phase1Title,
      company: t.phase1Company,
      desc: t.phase1Desc,
      metric: t.phase1Metric,
      icon: Server,
    },
    {
      year: t.phase2Year,
      title: t.phase2Title,
      company: t.phase2Company,
      desc: t.phase2Desc,
      metric: t.phase2Metric,
      icon: Users,
    },
    {
      year: t.phase3Year,
      title: t.phase3Title,
      company: t.phase3Company,
      desc: t.phase3Desc,
      metric: t.phase3Metric,
      icon: Activity,
    },
    {
      year: t.phase4Year,
      title: t.phase4Title,
      company: t.phase4Company,
      desc: t.phase4Desc,
      metric: t.phase4Metric,
      icon: Brain,
    },
  ];

  const impactPreview = [
    {
      title: t.impactCard1Title,
      subtitle: t.impactCard1Subtitle,
      metric: t.impactCard1Metric,
      label: t.impactCard1Label,
      href: "impact/",
    },
    {
      title: t.impactCard2Title,
      subtitle: t.impactCard2Subtitle,
      metric: t.impactCard2Metric,
      label: t.impactCard2Label,
      href: "impact/",
    },
    {
      title: t.impactCard3Title,
      subtitle: t.impactCard3Subtitle,
      metric: t.impactCard3Metric,
      label: t.impactCard3Label,
      href: "impact/",
    },
  ];

  return (
    <>
      {/* Hero — Executive Profile + Brand */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900/30" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="text-blue-400 font-medium mb-4 text-sm uppercase tracking-[0.3em]">
              {t.heroLabel}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              QUELVES
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 font-medium mb-4 leading-relaxed">
              {t.heroSubtitle}
            </p>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl">
              {t.heroDescription}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${lang}/impact/`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                {t.heroCtaImpact}
              </Link>
              <Link
                href={`/${lang}/insights/`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors backdrop-blur-sm"
              >
                <BookOpen className="w-4 h-4" />
                {t.heroCtaInsights}
              </Link>
              <Link
                href={`/${lang}/research/`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors backdrop-blur-sm"
              >
                <FlaskConical className="w-4 h-4" />
                {t.heroCtaResearch}
              </Link>
              <Link
                href={`/${lang}/advisory/`}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 hover:bg-white/10 text-white font-medium rounded-lg transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                {t.heroCtaAdvisory}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Arc — 4 Phases */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900">{t.arcTitle}</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              {t.arcDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {phase.year}
                  </span>
                  <phase.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{phase.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{phase.company}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{phase.desc}</p>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900">{phase.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Preview */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">{t.impactPreviewTitle}</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              {t.impactPreviewDesc}
            </p>
            <Link
              href={`/${lang}/impact/`}
              className="inline-flex items-center gap-2 mt-5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {t.impactPreviewViewAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactPreview.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/${lang}/${item.href}`}
                  className="block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group h-full"
                >
                  <div className="text-3xl font-bold text-slate-900 mb-1">{item.metric}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">{item.label}</div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.subtitle}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Insights */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">{t.insightsTitle}</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              {t.insightsDesc}
            </p>
            <Link
              href={`/${lang}/insights/`}
              className="inline-flex items-center gap-2 mt-5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {t.insightsViewAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/${lang}/insights/${post.slug}/`}
                  className="block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group h-full"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{post.date}</span>
                    <span>{post.readingTime} {t.insightsMinRead}</span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Research Snapshot */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-8 sm:p-10 text-white"
          >
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{t.researchSnapshotTitle}</h3>
                <p className="text-blue-100 leading-relaxed mb-4">
                  {t.researchSnapshotDesc}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {[t.researchSnapshotTag1, t.researchSnapshotTag2, t.researchSnapshotTag3, t.researchSnapshotTag4].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-white/15 text-blue-50 text-xs font-medium rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/${lang}/research/`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-700 font-medium rounded-lg transition-colors"
                >
                  {t.researchSnapshotCta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-2xl">LQ</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.aboutTeaserName}</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {t.aboutTeaserDesc}
                </p>
                <Link
                  href={`/${lang}/about/`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {t.aboutTeaserCta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Speaking CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Mic className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.speakingCtaTitle}</h2>
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              {t.speakingCtaDesc}
            </p>
            <Link
              href={`/${lang}/speaking/`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {t.speakingCtaButton}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
