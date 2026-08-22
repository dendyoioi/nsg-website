import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "outline-light" | "brand";

const variants: Record<Variant, string> = {
  primary: "bg-white text-brand-950 hover:bg-brand-100",
  "outline-light": "border border-white/40 text-white hover:bg-white/10",
  brand: "bg-gradient-to-r from-brand-700 to-brand-500 text-white hover:opacity-90",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const cls = `inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${variants[variant]} ${className}`;
  if (href.startsWith("#") || href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}
