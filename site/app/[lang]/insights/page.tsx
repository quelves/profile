"use client";

import { SectionHeader } from "@/components/section-header";
import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { content, Locale } from "@/lib/content-i18n";

export default function InsightsPage() {
  const params = useParams();
  const lang = (params.lang as string) || "es";
  const t = content[lang as Locale]?.insights || content.en.insights;
  const allPosts = getAllPosts();
  const posts = allPosts.filter((p) => p.lang === lang || (!p.lang && lang === "es"));

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.headerTitle}
          subtitle={t.headerSubtitle}
          centered
        />

        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link
                href={`/${lang}/insights/${post.slug}/`}
                className="block bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {t.categoryLabels[post.category] || post.category}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{post.date}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{post.readingTime} {t.minRead}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                  {post.title}
                </h3>

                <p className="text-slate-600 leading-relaxed mb-4">{post.excerpt}</p>

                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                  <span>{t.readArticle}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{t.emptyState}</p>
          </div>
        )}
      </div>
    </div>
  );
}
