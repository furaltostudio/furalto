import Link from "next/link";
import { Gem, MapPin, Package, Sparkles, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { homeBrandStrip } from "@/config/home";

type BrandStripItem = {
  id: string;
  label: string;
  detail: string;
  href: string;
};

const stripIcons: Record<string, LucideIcon> = {
  craft: Gem,
  showrooms: MapPin,
  delivery: Package,
  consult: Sparkles,
};

export function HomeBrandStrip({ items = [...homeBrandStrip] }: { items?: BrandStripItem[] }) {
  return (
    <section className="home-brand-strip" aria-label="Furalto highlights">
      <div className="container-app">
        <Reveal as="ul" className="home-brand-strip-list reveal-stagger">
          {items.map((item, index) => {
            const Icon = stripIcons[item.id] || Sparkles;
            const content = (
              <>
                <span className="home-brand-strip-icon" aria-hidden="true">
                  <Icon strokeWidth={1.35} />
                </span>
                <span className="home-brand-strip-copy">
                  <strong className="home-brand-strip-label">{item.label}</strong>
                  <span className="home-brand-strip-detail">{item.detail}</span>
                </span>
                <span className="home-brand-strip-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </>
            );

            return (
              <li key={item.id} className="home-brand-strip-cell">
                <Link href={item.href} className="home-brand-strip-item home-brand-strip-link">
                  {content}
                </Link>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
