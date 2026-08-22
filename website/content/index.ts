import { contentEn } from "./en";
import { contentId } from "./id";
import type { Content, Locale } from "./types";

const contents: Record<Locale, Content> = {
  id: contentId,
  en: contentEn,
};

export function getContent(locale: Locale): Content {
  return contents[locale];
}
