import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceHubStrip } from "@/components/shared/ServiceHubStrip";
import { companyHub, customerCareHub } from "@/config/customer-care";
import type { PageImage } from "@/config/images";

export type StaticPageHub = "customer-care" | "company";

export type StaticPageSection = {
  title: string;
  body: string;
  bullets?: string[];
  image?: PageImage;
  cta?: { label: string; href: string };
};

export type StaticPageContent = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heroImage: PageImage;
  variant?: "default" | "legal";
  lastUpdated?: string;
  relatedLinks?: { label: string; href: string }[];
  hub?: StaticPageHub;
  sections: StaticPageSection[];
};

const hubConfig: Record<
  StaticPageHub,
  { label: string; links: typeof customerCareHub | typeof companyHub }
> = {
  "customer-care": { label: "Customer Care", links: customerCareHub },
  company: { label: "Our Company", links: companyHub },
};

type StaticPageLayoutProps = {
  content: StaticPageContent;
};

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function StaticPageHero({ content }: { content: StaticPageContent }) {
  const heroEyebrow = content.hub ? hubConfig[content.hub].label : content.eyebrow;

  return (
    <>
      <PageHeroWithImage
        eyebrow={heroEyebrow}
        title={content.title}
        description={content.description}
        image={content.heroImage}
      />
      {content.lastUpdated ? (
        <div className="container-app">
          <p className="static-page-updated static-page-updated-below">
            Last updated {content.lastUpdated}
          </p>
        </div>
      ) : null}
    </>
  );
}

function StaticPageSectionCopy({
  section,
  index,
  variant,
}: {
  section: StaticPageSection;
  index: number;
  variant: "default" | "legal";
}) {
  const id = sectionId(section.title);

  return (
    <div className="static-page-copy">
      <span className="static-page-section-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h2 id={variant === "legal" ? id : undefined}>{section.title}</h2>
      <p>{section.body}</p>
      {section.bullets?.length ? (
        <ul className="static-page-bullets">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.cta ? (
        <Link href={section.cta.href} className="static-page-cta">
          {section.cta.label}
          <ArrowRight strokeWidth={1.25} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function LegalStaticPageBody({ content }: { content: StaticPageContent }) {
  return (
    <section className="static-page static-page-legal">
      <div className="container-app static-page-inner">
        <div className="static-page-legal-layout">
          <aside className="static-page-toc" aria-label="On this page">
            <p className="static-page-toc-label">On this page</p>
            <nav>
              <ul>
                {content.sections.map((section) => (
                  <li key={section.title}>
                    <a href={`#${sectionId(section.title)}`}>{section.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <Reveal className="static-page-legal-sections reveal-stagger">
            {content.sections.map((section, index) => (
              <div key={section.title} className="static-page-legal-block">
                <StaticPageSectionCopy section={section} index={index} variant="legal" />
              </div>
            ))}
          </Reveal>
        </div>

        {content.relatedLinks?.length ? (
          <nav className="static-page-related" aria-label="Related pages">
            {content.relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="static-page-related-link">
                <span>{link.label}</span>
                <ChevronRight strokeWidth={1.5} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}

function DefaultStaticPageBody({ content }: { content: StaticPageContent }) {
  return (
    <section className="static-page">
      <div className="container-app static-page-inner">
        <div className="static-page-sections">
          {content.sections.map((section, index) => (
            <Reveal
              key={section.title}
              className={`static-page-section ${
                index % 2 === 1 ? "static-page-section-reverse" : ""
              } ${section.image ? "" : "static-page-section-text"}`}
            >
              <StaticPageSectionCopy section={section} index={index} variant="default" />
              {section.image ? (
                <div className="static-page-media">
                  <Image
                    src={section.image.src}
                    alt={section.image.alt}
                    width={section.image.width}
                    height={section.image.height}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="static-page-image"
                  />
                </div>
              ) : null}
            </Reveal>
          ))}
        </div>

        {content.relatedLinks?.length ? (
          <nav className="static-page-related" aria-label="Related pages">
            {content.relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="static-page-related-link">
                <span>{link.label}</span>
                <ChevronRight strokeWidth={1.5} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}

export function StaticPageLayout({ content }: StaticPageLayoutProps) {
  const variant = content.variant ?? "default";
  const hub = content.hub ? hubConfig[content.hub] : null;

  return (
    <>
      <StaticPageHero content={content} />
      {hub ? <ServiceHubStrip links={hub.links} label={hub.label} /> : null}
      {variant === "legal" ? (
        <LegalStaticPageBody content={content} />
      ) : (
        <DefaultStaticPageBody content={content} />
      )}
    </>
  );
}
