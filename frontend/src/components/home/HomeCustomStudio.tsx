"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import {
  homeCustomStudioDefaults,
  type HomeCustomStudioContent,
} from "@/config/home-custom-studio";
import styles from "./HomeCustomStudio.module.css";

export function HomeCustomStudio({
  content = homeCustomStudioDefaults,
}: {
  content?: HomeCustomStudioContent;
}) {
  const {
    eyebrow,
    title,
    lead,
    ctaLabel,
    ctaHref,
    imageSrc,
    imageAlt,
    materialsLabel,
    priceFrom,
    timeNote,
    steps,
    materials,
  } = content;

  return (
    <section className={styles.section} aria-label={title || "Design furniture your way"}>
      <div className={styles.atmosphere} aria-hidden="true" />

      <div className={`container-app ${styles.inner}`}>
        <div className={styles.shell}>
          <Reveal className={styles.copy}>
            <div className={styles.masthead}>
              <span className={styles.mastBrand}>Furalto</span>
              <span className={styles.mastRule} aria-hidden="true" />
              <p className={styles.eyebrow}>{eyebrow}</p>
            </div>

            <h2 className={styles.title}>{title}</h2>
            <p className={styles.lead}>{lead}</p>

            <div className={styles.actions}>
              <Link href={ctaHref} className={styles.cta}>
                {ctaLabel}
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </Link>
              <Link href="/appointments" className={styles.ctaGhost}>
                Book a consultation
              </Link>
            </div>

            <ol className={styles.steps}>
              {steps.map((step, index) => (
                <li key={step.index}>
                  <Reveal delay={80 + index * 60}>
                    <div className={styles.step}>
                      <span className={styles.stepIndex}>{step.index}</span>
                      <span className={styles.stepTitle}>{step.title}</span>
                      <span className={styles.stepDetail}>{step.detail}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className={styles.visual} delay={90}>
            <div className={styles.photoFrame}>
              <div className={styles.photo}>
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(min-width: 900px) 48vw, 100vw"
                  className={styles.image}
                />
                <div className={styles.fade} aria-hidden="true" />
                <div className={styles.grain} aria-hidden="true" />
                <div className={styles.frameLines} aria-hidden="true" />
                <p className={styles.photoCaption}>Custom atelier</p>
              </div>
            </div>

            <div className={styles.dock}>
              <div className={styles.dockHead}>
                <p className={styles.dockLabel}>{materialsLabel}</p>
                <p className={styles.dockHint}>Live in the configurator</p>
              </div>

              <ul className={styles.swatches}>
                {materials.map((material) => (
                  <li key={material.id} className={styles.swatch}>
                    <span
                      className={styles.chip}
                      style={{ background: material.tone }}
                      title={material.label}
                      aria-hidden="true"
                    />
                    <span className={styles.swatchLabel}>{material.label}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.metaRow}>
                <p className={styles.meta}>
                  From <strong>{priceFrom}</strong>
                </p>
                <p className={styles.metaTime}>{timeNote}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
