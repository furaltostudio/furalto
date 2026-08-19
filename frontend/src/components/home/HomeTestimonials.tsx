"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import {
  homepageTestimonials,
  testimonialsSection,
  type Testimonial,
} from "@/config/testimonials";
import { cn } from "@/lib/utils/cn";
import styles from "./HomeTestimonials.module.css";

export function HomeTestimonials({
  eyebrow = testimonialsSection.eyebrow,
  title = testimonialsSection.title,
  lead = testimonialsSection.lead,
  ctaLabel = testimonialsSection.ctaLabel,
  ctaHref = testimonialsSection.ctaHref,
  items = homepageTestimonials,
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items?: Testimonial[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const current = items[active] ?? items[0];
  const storyIndex = String(active + 1).padStart(2, "0");
  const storyTotal = String(count).padStart(2, "0");

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive((index + count) % count);
    },
    [count]
  );

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, 9000);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (!current) return null;

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.atmosphere} aria-hidden="true" />

      <div className={`container-app ${styles.inner}`}>
        <Reveal className={styles.header}>
          <div className={styles.headerCopy}>
            <div className={styles.masthead}>
              <span className={styles.mastBrand}>Furalto</span>
              <span className={styles.mastRule} aria-hidden="true" />
              <p className={styles.eyebrow}>{eyebrow}</p>
            </div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.lead}>{lead}</p>
          </div>

          <aside className={styles.headerAside}>
            <p className={styles.asideEyebrow}>Private residences &amp; studios</p>
            <p className={styles.asideNote}>
              Notes written after delivery — once the furniture has settled into daily life.
            </p>
            <div className={styles.asideStat}>
              <span className={styles.asideStatValue}>{storyTotal}</span>
              <span className={styles.asideStatLabel}>featured stories</span>
            </div>
            <Link href={ctaHref} className={styles.viewAll}>
              {ctaLabel}
              <ArrowRight strokeWidth={1.25} aria-hidden="true" />
            </Link>
          </aside>
        </Reveal>

        <Reveal delay={80}>
          <div
            className={styles.stage}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setPaused(false);
              }
            }}
          >
            <div className={styles.quotePanel} key={`quote-${current.id}`}>
              <div className={styles.storyMeta}>
                <p className={styles.purchase}>{current.purchase}</p>
                <p className={styles.counter} aria-live="polite">
                  <span className={styles.counterCurrent}>{storyIndex}</span>
                  <span aria-hidden="true"> / </span>
                  {storyTotal}
                </p>
              </div>

              <blockquote className={styles.quote}>
                <span className={styles.mark} aria-hidden="true">
                  “
                </span>
                {current.quote}
              </blockquote>

              <footer className={styles.meta}>
                <div>
                  <p className={styles.name}>{current.name}</p>
                  <p className={styles.detail}>{current.role}</p>
                  <p className={styles.location}>
                    {current.location} · {current.year}
                  </p>
                </div>

                <div className={styles.controls}>
                  <div className={styles.dots} role="tablist" aria-label="Client stories">
                    {items.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={index === active}
                        aria-label={`Story from ${item.name}`}
                        className={cn(styles.dot, index === active && styles.dotActive)}
                        onClick={() => goTo(index)}
                      />
                    ))}
                  </div>
                  <div className={styles.nav}>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={goPrev}
                      aria-label="Previous story"
                    >
                      <ArrowLeft strokeWidth={1.25} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={goNext}
                      aria-label="Next story"
                    >
                      <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </footer>
            </div>

            <div className={styles.mediaFrame} key={`media-${current.id}`}>
              <div className={styles.media}>
                <Image
                  src={current.image}
                  alt={current.imageAlt}
                  fill
                  sizes="(min-width: 960px) 40vw, 100vw"
                  className={styles.image}
                />
                <div className={styles.mediaFade} aria-hidden="true" />
                <div className={styles.grain} aria-hidden="true" />
                <div className={styles.frameLines} aria-hidden="true" />
                <p className={styles.mediaCaption}>
                  {current.purchase}
                  <span aria-hidden="true"> · </span>
                  {current.location}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
