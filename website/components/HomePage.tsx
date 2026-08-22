import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/content";
import type { Locale } from "@/content/types";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getContent(locale);
  return (
    <>
      <Header locale={locale} t={t} />
      <main>
        {/* Task 7–11 mengisi section di sini */}
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
