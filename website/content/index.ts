import { contentId } from "./id";
import type { Content, Locale } from "./types";

const contents: Record<Locale, Content> = {
  id: contentId,
  en: contentId, // TODO(Task 4): ganti dengan contentEn
};

export function getContent(locale: Locale): Content {
  return contents[locale];
}
