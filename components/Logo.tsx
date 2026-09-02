import Image from "next/image";

export function Logo({
  className = "h-9 w-auto",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Image
        src="/images/nsg-logo.png"
        alt="PT Nattu Global Synergy"
        width={160}
        height={60}
        priority
        className={`h-full w-auto object-contain transition-opacity ${
          variant === "light" ? "brightness-105" : ""
        }`}
      />
    </div>
  );
}
