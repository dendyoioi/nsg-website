import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
