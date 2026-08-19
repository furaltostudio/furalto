"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import {
  inspirationSection,
  inspirationSlides,
  type InspirationHotspot,
  type InspirationSlide,
} from "@/config/inspirations";
import { formatProductName } from "@/lib/products/format";
import { cn } from "@/lib/utils/cn";
import styles from "./ProductInspirations.module.css";

const DRAG_THRESHOLD = 60;

export function ProductInspirations({
  title = inspirationSection.title,
  slides = inspirationSlides,
}: {
  title?: string;
  slides?: InspirationSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragMoved = useRef(false);
  const safeSlides = slides.length > 0 ? slides : inspirationSlides;
  const slideCount = safeSlides.length;
  const activeSlide = safeSlides[activeIndex] ?? safeSlides[0];
  const exploreHref = "/inspiration";
  const exploreLabel = "Explore all";

  const interactiveSelector = [
    `.${styles.hotspot}`,
    `.${styles.nav}`,
    `.${styles.dot}`,
    `.${styles.controls}`,
    `.${styles.explore}`,
  ].join(", ");

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + slideCount) % slideCount);
      setActiveHotspotId(null);
    },
    [slideCount]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) {
        setActiveHotspotId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveHotspotId(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleHotspot = (id: string) => {
    setActiveHotspotId((current) => (current === id ? null : id));
  };

  const endDrag = useCallback(() => {
    if (dragStartX.current === null) return;

    const offset = dragOffset;
    dragStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (offset <= -DRAG_THRESHOLD) goNext();
    else if (offset >= DRAG_THRESHOLD) goPrev();
  }, [dragOffset, goNext, goPrev]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest(interactiveSelector)) return;

    dragStartX.current = event.clientX;
    dragMoved.current = false;
    setIsDragging(true);
    setActiveHotspotId(null);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > 4) dragMoved.current = true;
    setDragOffset(delta);
  };

  const suppressDragClick = (event: React.MouseEvent) => {
    if (dragMoved.current) {
      event.preventDefault();
      event.stopPropagation();
      dragMoved.current = false;
    }
  };

  if (!activeSlide) return null;

  return (
    <section
      ref={sectionRef}
      className={cn(styles.section, activeHotspotId && styles.sectionPopoverOpen)}
      aria-label={title}
    >
      <div
        className={cn(
          styles.stage,
          isDragging && styles.stageDragging,
          activeHotspotId && styles.stagePopoverOpen
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={suppressDragClick}
      >
        <InspirationSlideView
          key={activeSlide.id}
          slide={activeSlide}
          activeHotspotId={activeHotspotId}
          onToggleHotspot={toggleHotspot}
          dragOffset={dragOffset}
          isDragging={isDragging}
        />

        <div className={`container-app ${styles.ui}`}>
            <div className={styles.uiTop}>
              <div className={styles.heading}>
                <p className={styles.eyebrow}>{inspirationSection.eyebrow}</p>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.slideLabel}>
                  {activeSlide.label || activeSlide.imageAlt}
                </p>
              </div>

              <Link href={exploreHref} className={styles.explore}>
                {exploreLabel}
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.uiBottom}>
              <div className={styles.dots} role="tablist" aria-label="Inspiration slides">
                {safeSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Slide ${index + 1}`}
                    className={cn(styles.dot, index === activeIndex && styles.dotActive)}
                    onClick={() => goTo(index)}
                  />
                ))}
              </div>

              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.nav}
                  onClick={goPrev}
                  aria-label="Previous inspiration"
                >
                  <ArrowLeft strokeWidth={1.25} aria-hidden="true" />
                </button>

                <div className={styles.counter} aria-hidden="true">
                  <span className={styles.counterCurrent}>
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.counterLine} />
                  <span className={styles.counterTotal}>
                    {String(slideCount).padStart(2, "0")}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.nav}
                  onClick={goNext}
                  aria-label="Next inspiration"
                >
                  <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}

type InspirationSlideViewProps = {
  slide: InspirationSlide;
  activeHotspotId: string | null;
  onToggleHotspot: (id: string) => void;
  dragOffset: number;
  isDragging: boolean;
};

function InspirationSlideView({
  slide,
  activeHotspotId,
  onToggleHotspot,
  dragOffset,
  isDragging,
}: InspirationSlideViewProps) {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <div
      className={cn(styles.slide, hasEntered && styles.slideEntered)}
      onAnimationEnd={(event) => {
        if (event.animationName.includes("inspirationsSlideIn")) {
          setHasEntered(true);
        }
      }}
      style={{
        transform: dragOffset ? `translateX(${dragOffset * 0.35}px)` : undefined,
        transition: isDragging ? "none" : undefined,
      }}
    >
      <div className={styles.imageFrame}>
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          width={slide.imageWidth}
          height={slide.imageHeight}
          priority
          sizes="100%"
          className={styles.image}
          draggable={false}
        />

        <div className={styles.overlay} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

        <div className={styles.hotspotLayer}>
          {slide.hotspots.map((hotspot) => (
            <InspirationHotspot
              key={hotspot.id}
              hotspot={hotspot}
              isActive={activeHotspotId === hotspot.id}
              onToggle={() => onToggleHotspot(hotspot.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type InspirationHotspotProps = {
  hotspot: InspirationHotspot;
  isActive: boolean;
  onToggle: () => void;
};

function InspirationHotspot({ hotspot, isActive, onToggle }: InspirationHotspotProps) {
  const stopPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle();
  };

  const edgeX = hotspot.x <= 28 ? "left" : hotspot.x >= 72 ? "right" : "center";
  const edgeY = hotspot.y >= 52 ? "bottom" : "top";

  return (
    <div
      className={cn(
        styles.hotspot,
        isActive && styles.hotspotActive,
        edgeX === "left" && styles.hotspotXLeft,
        edgeX === "right" && styles.hotspotXRight,
        edgeY === "bottom" && styles.hotspotYBottom
      )}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      onPointerDown={stopPropagation}
    >
      <button
        type="button"
        className={styles.hotspotBtn}
        onClick={handleToggle}
        onPointerDown={stopPropagation}
        aria-expanded={isActive}
        aria-label={`View ${hotspot.product.name}`}
      >
        <span className={styles.hotspotRing} aria-hidden="true" />
        <Plus className={styles.hotspotIcon} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {isActive && (
        <div
          className={styles.popover}
          role="dialog"
          aria-label={hotspot.product.name}
          onPointerDown={stopPropagation}
        >
          <p className={styles.popoverName}>{formatProductName(hotspot.product.name)}</p>
          <p className={styles.popoverPrice}>{hotspot.product.price}</p>
          <Link href={hotspot.product.href} className={styles.popoverCta}>
            Buy now
            <span className={styles.popoverCtaLine} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
