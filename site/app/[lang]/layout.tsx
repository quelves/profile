import { notFound } from "next/navigation";
import { locales, type Locale, getMessages } from "@/lib/i18n";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const messages = await getMessages(lang as Locale);
  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <>
      <Navigation locale={lang as Locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={lang as Locale} />
    </>
  );
}
