import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Grid3x3, MapPin, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { homeDiscoverItems, type HomeDiscoverItem } from "@/config/home";

const discoverIcons: Record<string, LucideIcon> = {
  collections: Grid3x3,
  inspiration: Sparkles,
  showrooms: MapPin,
  appointments: Calendar,
};

type HomeDiscoverSectionProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  items?: HomeDiscoverItem[];
};

export function HomeDiscoverSection({
  eyebrow = "Discover",
  title = "Start Your Next Room",
  lead = "Collections, inspiration, showrooms, and design services — everything to shape a home with intention.",
  items = homeDiscoverItems,
}: HomeDiscoverSectionProps) {
  return (
    <section className="home-discover" aria-label="Discover Furalto">
      <div className="container-app">
        <Reveal className="home-discover-header">
          <p className="home-discover-eyebrow">{eyebrow}</p>
          <span className="home-discover-header-rule" aria-hidden="true" />
          <h2 className="home-discover-title">{title}</h2>
          <p className="home-discover-lead">{lead}</p>
        </Reveal>

        <Reveal className="home-discover-grid reveal-stagger">
          {items.map((item, index) => {
            const Icon = discoverIcons[item.id] || Sparkles;

            return (
              <article key={item.id} className="home-discover-card">
                <Link href={item.href} className="home-discover-link">
                  <div className="home-discover-media">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={item.image.width}
                      height={item.image.height}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="home-discover-image"
                    />
                    <div className="home-discover-overlay" aria-hidden="true" />
                    <span className="home-discover-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="home-discover-media-icon" aria-hidden="true">
                      <Icon strokeWidth={1.35} />
                    </span>
                  </div>
                  <div className="home-discover-body">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="home-discover-cta">
                      {item.cta}
                      <span className="home-discover-cta-line" aria-hidden="true" />
                      <ArrowRight className="home-discover-cta-icon" strokeWidth={1.25} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
