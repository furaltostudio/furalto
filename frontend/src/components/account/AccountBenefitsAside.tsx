import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Heart, Package } from "lucide-react";
import { accountAsideContent, accountBenefits, accountStats } from "@/config/account";
import { categoryImages } from "@/config/images";

const benefitIcons = {
  orders: Package,
  wishlist: Heart,
  appointments: CalendarDays,
} as const;

type AccountBenefitsAsideProps = {
  variant: keyof typeof accountAsideContent;
};

export function AccountBenefitsAside({ variant }: AccountBenefitsAsideProps) {
  const content = accountAsideContent[variant];
  const image = categoryImages[content.imageKey];

  return (
    <aside className="account-aside">
      <div className="account-aside-sticky">
        <div className="account-aside-hero">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="account-aside-hero-image"
          />
          <div className="account-aside-hero-overlay" aria-hidden="true" />
          <div className="account-aside-hero-copy">
            <p className="account-aside-eyebrow">{content.eyebrow}</p>
            <h3>{content.title}</h3>
          </div>
        </div>

        <div className="account-stats">
          {accountStats.map((stat) => (
            <div key={stat.label} className="account-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="account-benefits-list">
          {accountBenefits.map((benefit) => {
            const Icon = benefitIcons[benefit.id];

            return (
              <article key={benefit.id} className="account-benefit-card">
                <span className="account-benefit-icon" aria-hidden="true">
                  <Icon strokeWidth={1.5} />
                </span>
                <div>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <blockquote className="account-quote">
          <p>&ldquo;{content.quote}&rdquo;</p>
          <cite>{content.author}</cite>
        </blockquote>

        <div className="account-aside-footer">
          <p>Prefer a guided experience?</p>
          <Link href="/appointments">Book a design appointment</Link>
        </div>
      </div>
    </aside>
  );
}
