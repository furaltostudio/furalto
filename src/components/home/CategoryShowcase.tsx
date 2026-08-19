"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import {
  categoryShowcaseItems,
  categoryShowcaseSection,
  type CategoryShowcaseItem,
} from "@/config/category-showcase";
import { cn } from "@/lib/utils/cn";
import styles from "./CategoryShowcase.module.css";

const DRAG_THRESHOLD = 60;
const CARDS_PER_PAGE = 2;

function chunkItems<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

export function CategoryShowcase({
  eyebrow = categoryShowcaseSection.eyebrow,
  title = categoryShowcaseSection.title,
  lead = categoryShowcaseSection.lead,
  items = categoryShowcaseItems,
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  items?: CategoryShowcaseItem[];
}) {
  const [activePage, setActivePage] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragMoved = useRef(false);

  const pages = useMemo(() => chunkItems(items, CARDS_PER_PAGE), [items]);
  const pageCount = pages.length;
  const safeActivePage = Math.min(activePage, Math.max(pageCount - 1, 0));

  const goTo = useCallback(
    (page: number) => {
      if (pageCount === 0) return;
      setActivePage((page + pageCount) % pageCount);
    },
    [pageCount]
  );

  const goPrev = useCallback(() => goTo(activePage - 1), [activePage, goTo]);
  const goNext = useCallback(() => goTo(activePage + 1), [activePage, goTo]);

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
    dragStartX.current = event.clientX;
    dragMoved.current = false;
    setIsDragging(true);
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

          <Link href="/collections" className={styles.viewAll}>
            View all collections
            <ArrowRight strokeWidth={1.25} aria-hidden="true" />
          </Link>
        </Reveal>

        <div className={styles.slider}>
          <div
            className={cn(styles.viewport, isDragging && styles.viewportDragging)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={suppressDragClick}
          >
            <div
              className={styles.track}
              style={{
                transform: `translateX(calc(-${safeActivePage * 100}% / ${Math.max(pageCount, 1)} + ${dragOffset * 0.35}px))`,
                transition: isDragging ? "none" : undefined,
              }}
            >
              {pages.map((page, pageIndex) => (
                <div key={`page-${pageIndex}`} className={styles.page}>
                  {page.map((category, cardIndex) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      index={pageIndex * CARDS_PER_PAGE + cardIndex + 1}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Reveal className={styles.footer} delay={100}>
          <div className={styles.dots} role="tablist" aria-label="Category pages">
            {pages.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                role="tab"
                aria-selected={index === safeActivePage}
                aria-label={`Page ${index + 1}`}
                className={cn(styles.dot, index === safeActivePage && styles.dotActive)}
                onClick={() => goTo(index)}
              />
            ))}
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.nav}
              onClick={goPrev}
              aria-label="Previous categories"
            >
              <ArrowLeft strokeWidth={1.25} aria-hidden="true" />
            </button>

            <div className={styles.counter} aria-hidden="true">
              <span className={styles.counterCurrent}>
                {String(safeActivePage + 1).padStart(2, "0")}
              </span>
              <span className={styles.counterLine} />
              <span className={styles.counterTotal}>
                {String(pageCount).padStart(2, "0")}
              </span>
            </div>

            <button
              type="button"
              className={styles.nav}
              onClick={goNext}
              aria-label="Next categories"
            >
              <ArrowRight strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: CategoryShowcaseItem;
  index: number;
}) {
  return (
    <Link href={category.href} className={styles.card}>
      <span className={styles.cardMedia}>
        <Image
          src={category.image}
          alt={category.imageAlt}
          fill
          sizes="(max-width: 767px) 50vw, 50vw"
          className={styles.cardImage}
        />
        <span className={styles.cardShade} aria-hidden="true" />
        <span className={styles.cardGrain} aria-hidden="true" />
        <span className={styles.cardFrame} aria-hidden="true" />
      </span>

      <span className={styles.cardIndex} aria-hidden="true">
        {String(index).padStart(2, "0")}
      </span>

      <span className={styles.cardContent}>
        <span className={styles.cardEyebrow}>Collection</span>
        <strong className={styles.cardTitle}>{category.label}</strong>
        <span className={styles.cardCta}>
          {category.cta}
          <ArrowRight strokeWidth={1.25} aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
