"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import {
  craftStoryDefaults,
  type CraftStoryContent,
} from "@/config/craft-story";
import styles from "./HomeCraftTeaser.module.css";

export function HomeCraftTeaser({
  content = craftStoryDefaults,
}: {
  content?: CraftStoryContent;
}) {
  return (
    <section className={styles.section} aria-labelledby="craft-teaser-title">
      <div className={styles.atmosphere} aria-hidden="true" />

      <div className={`container-app ${styles.layout}`}>
        <div className={styles.copyCol}>
          <Reveal className={styles.masthead}>
            <span className={styles.mastBrand}>{content.brandMark || "Furalto"}</span>
            <span className={styles.mastRule} aria-hidden="true" />
            <span className={styles.mastMeta}>
              {content.mastheadLeft || "Est. 1979"}
              <span aria-hidden="true"> · </span>
              {content.mastheadRight || "Legacy"}
            </span>
          </Reveal>

          <Reveal className={styles.copy} delay={60}>
            <p className={styles.eyebrow}>Atelier story</p>

            <h2 id="craft-teaser-title" className={styles.title}>
              <span className={styles.titleLine}>
                {content.titleLine1}{" "}
                <em className={styles.accent}>{content.titleAccent1}</em>
              </span>
              <span className={styles.titleLine}>
                {content.titleLine2}{" "}
                <em className={styles.accent}>{content.titleAccent2}</em>
              </span>
            </h2>

            <p className={styles.lead}>{content.subtitle}</p>

            <blockquote className={styles.quote}>
              <p>{content.quote}</p>
            </blockquote>

            <ul className={styles.trust}>
              {content.trustPoints.slice(0, 2).map((point, index) => (
                <li key={point.id}>
                  <Reveal delay={120 + index * 70}>
                    <div className={styles.trustItem}>
                      <span className={styles.trustIndex} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.trustCopy}>
                        <strong>{point.title}</strong>
                        <span>{point.detail}</span>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <Link href={content.ctaHref || "/about"} className={styles.cta}>
                {content.ctaLabel || "Our story"}
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </Link>
              <Link href="/collections" className={styles.ctaGhost}>
                View collections
              </Link>
            </div>
          </Reveal>

          <p className={styles.yearGhost} aria-hidden="true">
            1979
          </p>
        </div>

        <Reveal className={styles.mediaWrap} delay={100}>
          <div className={styles.mediaFrame}>
            <div className={styles.media}>
              <Image
                src={content.heroImageSrc}
                alt={content.heroImageAlt}
                fill
                sizes="(max-width: 960px) 100vw, 54vw"
                className={styles.image}
                priority={false}
              />
              <div className={styles.mediaShade} aria-hidden="true" />
              <div className={styles.mediaGrain} aria-hidden="true" />
              <div className={styles.mediaLines} aria-hidden="true" />

              <div className={styles.mediaFooter}>
                <p className={styles.mediaCaption}>{content.indiaLabel}</p>
                <p className={styles.mediaTagline}>{content.brandTagline}</p>
              </div>

              <p className={styles.yearMark} aria-hidden="true">
                1979
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
