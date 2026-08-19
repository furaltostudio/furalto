"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hammer, HeartHandshake, PenTool } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { aboutPageExtras, aboutSectionMeta } from "@/config/about";
import type { StaticPageContent } from "@/components/shared/StaticPageLayout";
import styles from "./AboutPage.module.css";

const pillarIcons = {
  traditional: Hammer,
  contemporary: PenTool,
  artisans: HeartHandshake,
} as const;

export function AboutPageContent({ page }: { page: StaticPageContent }) {
  const extras = aboutPageExtras;

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-hero-title">
        <div className={styles.heroBanner}>
          <Image
            src={extras.heroBannerSrc}
            alt={extras.heroBannerAlt}
            width={1794}
            height={592}
            priority
            sizes="100vw"
            className={styles.heroBannerImage}
          />
          <div className={styles.heroCaptionCopy}>
            <p className={styles.eyebrow}>{extras.heroEyebrow}</p>
            <h1 id="about-hero-title">{extras.heroTitle}</h1>
            <p className={styles.heroLead}>{extras.heroLead}</p>
            <p className={styles.heroTagline}>{extras.heroTagline}</p>
          </div>
        </div>
      </section>

      <div className={styles.statsWrap}>
        <div className={styles.stats} aria-label="Milestones">
          {extras.timeline.map((item) => (
            <div key={`${item.year}-${item.label}`} className={styles.stat}>
              <strong>{item.year}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.chapters}>
          {page.sections.map((section, index) => {
            const meta = aboutSectionMeta[index];
            const image = section.image || meta?.image;
            return (
              <Reveal
                key={section.title}
                className={`${styles.chapter}${index % 2 ? ` ${styles.chapterFlip}` : ""}`}
                delay={index * 40}
              >
                {image ? (
                  <div className={styles.chapterMedia}>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 880px) 100vw, 280px"
                      className={styles.chapterImage}
                    />
                    {meta?.year ? <span>{meta.year}</span> : null}
                  </div>
                ) : null}
                <div className={styles.chapterCopy}>
                  <p className={styles.chapterKicker}>
                    {String(index + 1).padStart(2, "0")} · {section.title}
                  </p>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  {section.cta ? (
                    <Link href={section.cta.href} className={styles.inlineLink}>
                      {section.cta.label}
                      <ArrowRight size={14} strokeWidth={1.3} aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className={styles.purpose}>
        <Reveal className={styles.purposeInner}>
          <p className={styles.eyebrowOnDark}>{extras.purposeEyebrow}</p>
          <h2>{extras.purposeStatement}</h2>
          <p>{extras.purposeCommitment}</p>
        </Reveal>
      </section>

      <section className={styles.section}>
        <Reveal className={styles.blockHead}>
          <p className={styles.eyebrow}>{extras.pillarsEyebrow}</p>
          <h2>{extras.pillarsTitle}</h2>
        </Reveal>
        <div className={styles.pillars}>
          {extras.pillars.map((pillar, index) => {
            const Icon = pillarIcons[pillar.id];
            return (
              <Reveal key={pillar.id} className={styles.pillar} delay={index * 50}>
                <div className={styles.pillarTop}>
                  <span className={styles.pillarIcon} aria-hidden="true">
                    <Icon size={17} strokeWidth={1.35} />
                  </span>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="about-team-title">
        <Reveal className={styles.blockHead}>
          <p className={styles.eyebrow}>{extras.teamEyebrow}</p>
          <h2 id="about-team-title">{extras.teamTitle}</h2>
          <p className={styles.blockLead}>{extras.teamLead}</p>
        </Reveal>

        <ul className={styles.teamGrid}>
          {extras.team.map((member, index) => (
            <li key={member.id}>
              <article className={styles.member}>
                <div className={styles.memberPhoto}>
                  <Image
                    src={member.imageSrc}
                    alt={member.imageAlt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 280px"
                    quality={90}
                    priority={index < 2}
                    className={styles.memberImage}
                  />
                </div>
                <div className={styles.memberMeta}>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.close}>
        <Reveal className={styles.closeInner}>
          <p className={styles.eyebrowOnDark}>{extras.closeEyebrow}</p>
          <h2>
            {extras.closeTitle} <em>{extras.closeAccent}</em>
          </h2>
          <p>{extras.closeBody}</p>
          <div className={styles.closeCtas}>
            <Link href="/appointments" className={styles.btnLight}>
              Book a design visit
              <ArrowRight size={15} strokeWidth={1.3} aria-hidden="true" />
            </Link>
            <Link href="/collections" className={styles.linkOnDark}>
              Shop collections
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
