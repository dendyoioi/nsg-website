import Image from "next/image";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <Image
        src="/images/nsg-logo.png"
        alt="PT Nattu Global Synergy"
        width={64}
        height={64}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
