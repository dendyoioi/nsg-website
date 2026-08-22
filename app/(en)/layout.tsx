import { HtmlShell } from "@/components/HtmlShell";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <HtmlShell lang="en">{children}</HtmlShell>;
}
