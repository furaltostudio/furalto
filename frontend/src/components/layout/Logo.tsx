import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  className?: string;
  variant?: "header" | "footer";
};

export function Logo({ className, variant = "header" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "logo-link",
        variant === "footer" ? "logo-link-footer" : "logo-link-header",
        className
      )}
      aria-label={`${siteConfig.name} — Home`}
    >
      <span className="logo-wordmark">{siteConfig.name}</span>
      <span className="logo-subtext">{siteConfig.subtagline}</span>
    </Link>
  );
}
