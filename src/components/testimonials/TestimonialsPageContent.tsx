import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { ServiceHubStrip } from "@/components/shared/ServiceHubStrip";
import { Reveal } from "@/components/ui/Reveal";
import { companyHub } from "@/config/customer-care";
import type { PageImage } from "@/config/images";
import {
  testimonials as fallbackTestimonials,
  testimonialsPage,
  type Testimonial,
} from "@/config/testimonials";
import styles from "./TestimonialsPage.module.css";

export type TestimonialsPageCmsContent = {
  title: string;
  description: string;
  introEyebrow: string;
  introLead: string;
  heroImage: PageImage;
  closeEyebrow: string;
  closeTitle: string;
  closeLead: string;
  items: Testimonial[];
};

export function TestimonialsPageContent({
  content,
}: {
  content?: TestimonialsPageCmsContent;
}) {
  const page = {
    title: content?.title || testimonialsPage.title,
    description: content?.description || testimonialsPage.description,
    introEyebrow: content?.introEyebrow || testimonialsPage.introEyebrow,
    introLead: content?.introLead || testimonialsPage.introLead,
    heroImage: content?.heroImage || testimonialsPage.heroImage,
    closeEyebrow: content?.closeEyebrow || "Visit us",
    closeTitle: content?.closeTitle || "Sit with the pieces before you decide",
    closeLead:
      content?.closeLead ||
      "Book a quiet hour in a showroom, or start a custom piece with our design team.",
    items: content?.items?.length ? content.items : fallbackTestimonials,
  };

  const [featured, ...rest] = page.items;
  const featuredItem = featured ?? page.items[0];
  const stories = rest.length ? rest : page.items.slice(1);

  return (
    <div className={styles.page}>
      <PageHeroWithImage
        eyebrow="Our Company"
        title={page.title}
        description={page.description}
        image={page.heroImage}
      />

      <ServiceHubStrip links={companyHub} label="Our Company" />

      <section className={styles.intro}>
        <div className="container-app">
          <Reveal className={styles.introInner}>
            <p className={styles.introEyebrow}>{page.introEyebrow}</p>
            <span className={styles.rule} aria-hidden="true" />
            <p className={styles.introLead}>{page.introLead}</p>
          </Reveal>
        </div>
      </section>

      {featuredItem ? (
        <section className={styles.featured} aria-label="Featured story">
          <div className="container-app">
            <Reveal className={styles.featuredShell}>
              <div className={styles.featuredCopy}>
                <p className={styles.purchase}>{featuredItem.purchase}</p>
                <blockquote className={styles.featuredQuote}>
                  {featuredItem.quote}
                </blockquote>
                <footer className={styles.meta}>
                  <p className={styles.name}>{featuredItem.name}</p>
                  <p className={styles.detail}>{featuredItem.role}</p>
                  <p className={styles.location}>
                    {featuredItem.location} · {featuredItem.year}
                  </p>
                </footer>
              </div>
              <div className={styles.featuredMedia}>
                <Image
                  src={featuredItem.image}
                  alt={featuredItem.imageAlt}
                  fill
                  sizes="(min-width: 960px) 42vw, 100vw"
                  className={styles.featuredImage}
                  priority
                />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className={styles.list} aria-label="More client stories">
        <div className="container-app">
          <Reveal className={styles.listHeader}>
            <p className={styles.listEyebrow}>More from clients</p>
            <h2 className={styles.listTitle}>After the furniture arrived</h2>
          </Reveal>

          <div className={styles.entries}>
            {stories.map((item) => (
              <Reveal key={item.id} className={styles.entry}>
                <div className={styles.entryMedia}>
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 900px) 28vw, 100vw"
                    className={styles.entryImage}
                  />
                </div>
                <div className={styles.entryCopy}>
                  <p className={styles.purchase}>{item.purchase}</p>
                  <blockquote className={styles.entryQuote}>{item.quote}</blockquote>
                  <footer className={styles.meta}>
                    <p className={styles.name}>{item.name}</p>
                    <p className={styles.detail}>{item.role}</p>
                    <p className={styles.location}>
                      {item.location} · {item.year}
                    </p>
                  </footer>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.close}>
        <div className="container-app">
          <Reveal className={styles.closeInner}>
            <p className={styles.closeEyebrow}>{page.closeEyebrow}</p>
            <h2 className={styles.closeTitle}>{page.closeTitle}</h2>
            <p className={styles.closeLead}>{page.closeLead}</p>
            <div className={styles.closeActions}>
              <Link href="/appointments" className={styles.closePrimary}>
                Make an appointment
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </Link>
              <Link href="/showrooms" className={styles.closeSecondary}>
                Find a showroom
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
