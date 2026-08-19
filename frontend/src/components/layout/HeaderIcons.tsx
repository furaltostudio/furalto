import Link from "next/link";
import {
  Heart,
  MapPin,
  Search,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const iconClass = "h-[18px] w-[18px] shrink-0";

type HeaderIconLinkProps = {
  href: string;
  label: string;
  children: React.ReactNode;
  badge?: number;
  className?: string;
};

export function HeaderIconLink({
  href,
  label,
  children,
  badge,
  className,
}: HeaderIconLinkProps) {
  return (
    <Link
      href={href}
      className={cn("header-icon-link", className)}
      aria-label={label}
      title={label}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="header-icon-badge">{badge}</span>
      )}
    </Link>
  );
}

export function SearchIcon() {
  return <Search className={iconClass} strokeWidth={1.5} aria-hidden="true" />;
}

export function LocationIcon() {
  return <MapPin className={iconClass} strokeWidth={1.5} aria-hidden="true" />;
}

export function AccountIcon() {
  return <User className={iconClass} strokeWidth={1.5} aria-hidden="true" />;
}

export function TruckIcon() {
  return <Truck className={iconClass} strokeWidth={1.5} aria-hidden="true" />;
}

export function HeartIcon() {
  return <Heart className={iconClass} strokeWidth={1.5} aria-hidden="true" />;
}

export function CartIcon() {
  return <ShoppingBag className={iconClass} strokeWidth={1.5} aria-hidden="true" />;
}
