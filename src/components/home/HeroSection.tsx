"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";

export type HeroContent = {
  eyebrow: string;
  subtitle: string;
  video: string;
  tagline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

type HeroSectionProps = {
  content?: Partial<HeroContent>;
};

export function HeroSection({ content }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hero = {
    eyebrow: content?.eyebrow || siteConfig.hero.eyebrow,
    subtitle: content?.subtitle || siteConfig.hero.subtitle,
    video: content?.video || siteConfig.hero.video,
    tagline: content?.tagline || siteConfig.tagline,
    primaryCta: content?.primaryCta || siteConfig.hero.primaryCta,
    secondaryCta: content?.secondaryCta || siteConfig.hero.secondaryCta,
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        // Autoplay may be blocked until user interaction.
      }
    };

    playVideo();
  }, []);

  return (
    <section className="hero-section" aria-label="Featured collection">
      <div className="hero-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={hero.video} type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-vignette" />
      </div>

      <div className="container-app hero-container">
        <div className="hero-content">
          <p className="hero-eyebrow animate-fade-up">
            <span className="hero-eyebrow-pill">{hero.eyebrow}</span>
          </p>

          <h1 className="hero-title animate-fade-up animate-delay-1">{hero.tagline}</h1>

          <p className="hero-subtitle animate-fade-up animate-delay-2">{hero.subtitle}</p>

          <span className="hero-divider animate-fade-up animate-delay-2" aria-hidden="true" />

          <div className="hero-actions animate-fade-up animate-delay-3">
            <Link href={hero.primaryCta.href} className="hero-btn hero-btn-primary">
              {hero.primaryCta.label}
            </Link>
            <Link href={hero.secondaryCta.href} className="hero-btn hero-btn-secondary">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <a href="#content" className="hero-scroll" aria-label="Scroll to content">
        <span className="hero-scroll-line" aria-hidden="true" />
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5V19M12 19L6 13M12 19L18 13"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}
