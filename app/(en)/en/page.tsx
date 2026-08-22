import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getContent } from "@/content";

import { site } from "@/content/site";

const t = getContent("en");

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: t.meta.title,
  description: t.meta.description,
  alternates: {
    canonical: "/en",
    languages: { id: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    images: ["/og.jpg"],
    type: "website",
  },
};

export default function Page() {
  return <HomePage locale="en" />;
}
