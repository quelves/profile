export type Locale = "es" | "pt" | "en";

export const locales: Locale[] = ["es", "pt", "en"];
export const defaultLocale: Locale = "es";

export async function getMessages(locale: Locale) {
  return (await import(`@/messages/${locale}.json`)).default;
}
