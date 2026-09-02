import Image from "next/image";

export function Logo({
  className = "h-10 w-auto",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <div
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 ${className}`}
    >
      <Image
        src="/images/nsg-logo.png"
        alt="PT Nattu Global Synergy"
        width={180}
        height={126}
        priority
        className={`h-full w-auto object-contain transition-all duration-300 ${
          variant === "light"
            ? "drop-shadow-[0_2px_10px_rgba(45,212,191,0.25)]"
            : ""
        }`}
      />
    </div>
  );
}
