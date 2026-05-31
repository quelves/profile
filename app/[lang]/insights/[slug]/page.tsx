import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { content, Locale } from "@/lib/content-i18n";

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | QUELVES Insights`,
    description: post.excerpt,
  };
}

export default async function InsightPostPage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  const post = getPostBySlug(slug);
  const t = content[lang as Locale]?.insights || content.en.insights;

  if (!post) {
    notFound();
  }

  const html = post.content
    .replace(/^# (.*$)/gim, "<h1 class='text-3xl font-bold text-slate-900 mb-6 mt-8'>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2 class='text-2xl font-bold text-slate-900 mb-4 mt-8'>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3 class='text-xl font-bold text-slate-900 mb-3 mt-6'>$1</h3>")
    .replace(/^> (.*$)/gim, "<blockquote class='border-l-4 border-blue-200 pl-4 italic text-slate-700 my-6'>$1</blockquote>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800'>$1</code>")
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```/g, "").trim();
      return `<pre class='bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-6 text-sm'><code>${code}</code></pre>`;
    })
    .replace(/^- (.*$)/gim, "<li class='flex items-start gap-2 mb-2'><span class='w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0'></span><span>$1</span></li>")
    .replace(/(<li.*<\/li>\n?)+/g, "<ul class='my-4 space-y-1'>$&</ul>")
    .replace(/\n/g, "<br />")
    .replace(/<br \/\>\s*<ul/g, "<ul")
    .replace(/<\/ul>\s*<br \/\>/g, "</ul>");

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${lang}/insights/`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backLink}
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
              {t.categoryLabels[post.category] || post.category}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime} {t.minRead}
            </span>
          </div>
        </header>

        <article
          className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 pt-8 border-t border-slate-200">
          <Link
            href={`/${lang}/insights/`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.moreInsights}
          </Link>
        </div>
      </div>
    </div>
  );
}
