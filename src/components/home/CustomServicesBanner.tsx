import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { customServicesSection } from "@/config/custom-services";

type CustomServicesContent = {
  eyebrow: string;
  title: string;
  description: string;
  perks: string[];
  cta: { label: string; href: string };
  image: { src: string; alt: string; width: number; height: number };
};

export function CustomServicesBanner({
  content = {
    eyebrow: customServicesSection.eyebrow,
    title: customServicesSection.title,
    description: customServicesSection.description,
    perks: [...customServicesSection.perks],
    cta: { ...customServicesSection.cta },
    image: { ...customServicesSection.image },
  },
}: {
  content?: CustomServicesContent;
}) {
  const { eyebrow, title, description, perks, cta, image } = content;

  return (
    <section className="custom-services" aria-label={title}>
      <div className="custom-services-inner">
        <div className="custom-services-media" aria-hidden="true">
          <Image
            src={image.src}
            alt=""
            fill
            sizes="100%"
            className="custom-services-image"
            priority={false}
          />
          <div className="custom-services-overlay" />
        </div>

        <div className="container-app custom-services-content">
          <Reveal className="custom-services-panel reveal-stagger">
            <div className="custom-services-copy">
              <p className="custom-services-eyebrow">{eyebrow}</p>
              <span className="custom-services-rule" aria-hidden="true" />
              <h2 className="custom-services-title">{title}</h2>
              <p className="custom-services-description">{description}</p>
              <ul className="custom-services-perks">
                {perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <Link href={cta.href} className="custom-services-cta">
                {cta.label}
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
