"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HandHeart, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import {
  craftStoryDefaults,
  type CraftStoryContent,
} from "@/config/craft-story";
import styles from "./HomeCraftStory.module.css";

const TRUST_ICONS = {
  "indian-skill": HandHeart,
  quality: ShieldCheck,
} as const;

export function HomeCraftStory({
  content = craftStoryDefaults,
}: {
  content?: CraftStoryContent;
}) {
  return (
    <section className={styles.section} aria-labelledby="craft-story-title">
      <div className={styles.sheet}>
        <Reveal className={styles.masthead}>
          <span>{content.mastheadLeft}</span>
          <strong>{content.mastheadCenter}</strong>
          <span>{content.mastheadRight}</span>
        </Reveal>

        <div className={styles.lead}>
          <Reveal className={`${styles.copy} reveal-stagger`}>
            <div className={styles.brandRow}>
              <span className={styles.brandMark} aria-hidden="true">
                F
              </span>
              <span className={styles.brandMeta}>
                <p className={styles.brandName}>{content.brandMark}</p>
                <p className={styles.brandTag}>{content.brandTagline}</p>
              </span>
            </div>

            <span className={styles.rule} aria-hidden="true" />

            <h2 id="craft-story-title" className={styles.title}>
              {content.titleLine1}{" "}
              <span className={styles.accent}>{content.titleAccent1}</span>
              <br />
              {content.titleLine2}{" "}
              <span className={styles.accent}>{content.titleAccent2}</span>
            </h2>

            <p className={styles.subtitle}>{content.subtitle}</p>
            <p className={styles.body}>{content.body}</p>

            <ul className={styles.trust}>
              {content.trustPoints.map((point) => {
                const Icon =
                  TRUST_ICONS[point.id as keyof typeof TRUST_ICONS] || ShieldCheck;
                return (
                  <li key={point.id} className={styles.trustItem}>
                    <span className={styles.trustIcon} aria-hidden="true">
                      <Icon size={18} strokeWidth={1.4} />
                    </span>
                    <span>
                      <strong>{point.title}</strong>
                      <em>{point.detail}</em>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal className={styles.portrait}>
            <Image
              src={content.heroImageSrc}
              alt={content.heroImageAlt}
              fill
              sizes="(max-width: 920px) 100vw, 46vw"
              className={styles.portraitImage}
              priority={false}
            />
            <p className={styles.portraitCaption}>Workshop · India</p>
          </Reveal>
        </div>

        <Reveal className={styles.process}>
          <div className={styles.processHead}>
            <p className={styles.processEyebrow}>{content.processEyebrow}</p>
          </div>
          <ol className={styles.steps}>
            {content.steps.map((step, index) => (
              <li key={step.id} className={styles.step}>
                <div className={styles.stepMedia}>
                  <Image
                    src={step.imageSrc}
                    alt={step.imageAlt}
                    fill
                    sizes="(max-width: 760px) 70vw, 22vw"
                    className={styles.stepImage}
                  />
                  <span className={styles.stepIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDetail}>{step.detail}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className={styles.footer}>
          <div className={styles.india}>
            <span className={styles.indiaMark} aria-hidden="true" />
            <p className={styles.indiaLabel}>{content.indiaLabel}</p>
          </div>
          <div className={styles.quoteBlock}>
            <blockquote className={styles.quote}>
              {content.quote}{" "}
              <span className={styles.quoteAccent}>{content.quoteAccent}</span>
            </blockquote>
            <Link href={content.ctaHref} className={styles.cta}>
              {content.ctaLabel}
              <ArrowRight strokeWidth={1.25} aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.siteUrl}>{content.siteUrl}</p>
        </Reveal>
      </div>
    </section>
  );
}
