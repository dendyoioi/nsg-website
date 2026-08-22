import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { About } from "@/components/sections/About";
import { Advantages } from "@/components/sections/Advantages";
import { Divisions } from "@/components/sections/Divisions";
import { Hero } from "@/components/sections/Hero";
import { getContent } from "@/content";
import type { Locale } from "@/content/types";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getContent(locale);
  return (
    <>
      <Header locale={locale} t={t} />
      <main>
        <Hero t={t} />
        <About t={t} />
        <Divisions t={t} />
        <Advantages t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
