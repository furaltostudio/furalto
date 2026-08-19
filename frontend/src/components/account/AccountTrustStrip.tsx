import Link from "next/link";
import { Headphones, MapPin, ShieldCheck } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    label: "Secure account",
    description: "Your details stay private and protected.",
  },
  {
    icon: Headphones,
    label: "Design support",
    description: "Specialists ready to help with orders.",
  },
  {
    icon: MapPin,
    label: "Showroom access",
    description: "Book a visit at our Rohini Design Studio.",
    href: "/showrooms",
  },
] as const;

export function AccountTrustStrip() {
  return (
    <div className="account-trust-strip">
      {trustItems.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <span className="account-trust-icon" aria-hidden="true">
              <Icon strokeWidth={1.5} />
            </span>
            <span className="account-trust-copy">
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </span>
          </>
        );

        if ("href" in item && item.href) {
          return (
            <Link key={item.label} href={item.href} className="account-trust-item account-trust-link">
              {content}
            </Link>
          );
        }

        return (
          <div key={item.label} className="account-trust-item">
            {content}
          </div>
        );
      })}
    </div>
  );
}
