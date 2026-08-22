import type { ReactNode } from "react";
import { inter, sora } from "@/lib/fonts";

export function HtmlShell({
  lang,
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  return (
    <html lang={lang} className={`${sora.variable} ${inter.variable}`}>
      <body className="bg-paper font-body text-ink antialiased">{children}</body>
    </html>
  );
}
