"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ProductImage } from "@/types/product";
import { useKnockoutImage } from "@/hooks/useKnockoutImage";
import { scaleCompareImageSrc } from "@/lib/images/catalog";
import {
  bodyLandmarkForRatio,
  cmFromUnit,
  cmToFeetInches,
  clampUserHeightCm,
  feetInchesToCm,
  formatLength,
  formatRulerMark,
  heightBoundsForUnit,
  heightPresetsForUnit,
  getScaleImageIndex,
  getScaleCutoutSrc,
  unitFromCm,
  unitLabel,
  type MeasureUnit,
} from "@/lib/products/scale";
import { cn } from "@/lib/utils/cn";

const MASCOT_SRC = "/brand/mascot/furalto-mascot-scale.png";
/** Intrinsic pixel aspect of the mascot asset (width / height). */
const MASCOT_ASPECT = 270 / 731;
const GAP_CM = 12;
const FLOOR_PAD_PX = 64;
const DEFAULT_HEIGHT_CM = 175;
/** Shoulder/body width at the default 175 cm reference height. */
const REF_BODY_SPAN_CM = 55;
const REF_HEIGHT_CM = 175;
const UNITS: MeasureUnit[] = ["mm", "cm", "in", "ft"];

type ProductScaleCompareProps = {
  productName: string;
  productSlug?: string;
  images: ProductImage[];
  heightCm: number;
  widthCm?: number | null;
  depthCm?: number | null;
  seatHeightCm?: number | null;
  seatLabel?: string;
  kind?: "bed" | "furniture";
  scaleImageIndex?: number | null;
  className?: string;
};

function pickStudioImage(
  images: ProductImage[],
  productSlug?: string,
  kind: "bed" | "furniture" = "furniture",
  scaleImageIndex?: number | null
) {
  const isDiagram = (image: ProductImage) =>
    /spec|diagram|measure|sheet|blueprint/i.test(`${image.alt} ${image.src}`);

  const preferredIndex = getScaleImageIndex(productSlug, scaleImageIndex);
  const preferred = images[preferredIndex];
  if (preferred && !isDiagram(preferred)) return preferred;

  const second = images[1];
  if (second && !isDiagram(second)) return second;

  const usable = images.filter((image) => !isDiagram(image));
  if (usable.length === 0) return images[0];

  const scored = usable.map((image, index) => {
    const text = `${image.alt} ${image.src}`.toLowerCase();
    let score = 0;
    if (/front|elevation|straight|ortho|head.?on|facing/.test(text)) score += 20;
    if (/side|profile|angle|3[\s_-]?4|quarter|perspective|diagonal/.test(text))
      score -= 12;
    if (/top|overhead|plan|aerial|bird/.test(text)) score -= 14;
    if (/room|lifestyle|living|interior|scene|setting|bedroom/.test(text))
      score -= 10;
    if (kind === "bed" && /\.png(\?|$)/i.test(image.src)) score -= 6;
    if (index === 1) score += 10;
    if (index === 0) score += kind === "bed" ? 8 : -8;
    return { image, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.image || usable[1] || usable[0];
}

export function ProductScaleCompare({
  productName,
  productSlug,
  images,
  heightCm,
  widthCm,
  depthCm,
  seatHeightCm,
  seatLabel = "Seat",
  kind = "furniture",
  scaleImageIndex = null,
  className,
}: ProductScaleCompareProps) {
  const inputId = useId();
  const feetId = useId();
  const inchesId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState<MeasureUnit>("cm");
  const [userHeightCm, setUserHeightCm] = useState(DEFAULT_HEIGHT_CM);
  const [heightDraft, setHeightDraft] = useState(
    String(unitFromCm(DEFAULT_HEIGHT_CM, "cm"))
  );
  const defaultFt = cmToFeetInches(DEFAULT_HEIGHT_CM);
  const [feetDraft, setFeetDraft] = useState(String(defaultFt.feet));
  const [inchesDraft, setInchesDraft] = useState(String(defaultFt.inches));
  const [stagePx, setStagePx] = useState({ w: 320, h: 200 });

  const isBed = kind === "bed";
  const bedLengthCm =
    isBed && depthCm != null && depthCm > 0
      ? depthCm
      : isBed && widthCm != null
        ? widthCm
        : null;

  const secondaryCm =
    seatHeightCm && seatHeightCm > 0
      ? seatHeightCm
      : isBed
        ? Math.round(heightCm * 0.42)
        : null;

  // Same as sofas: overall width × product height (headboard for beds).
  const trueWidthCm = Math.max(widthCm || heightCm * 1.6, heightCm * 0.85);

  const curatedCutoutSrc = getScaleCutoutSrc(productSlug);
  const studioImage = useMemo(
    () => pickStudioImage(images, productSlug, kind, scaleImageIndex),
    [images, productSlug, kind, scaleImageIndex]
  );
  const rawProductSrc =
    curatedCutoutSrc ||
    (studioImage
      ? scaleCompareImageSrc(studioImage.src, { width: 1400, height: 1100 })
      : "");

  // Curated assets are already tight — still run prepare for fringe scrub when local.
  // Live gallery shots always go through knockout + trim.
  const liveCutout = useKnockoutImage(rawProductSrc || null);
  const cutout = liveCutout;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) {
        setStagePx({ w: rect.width, h: rect.height });
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clampedUserHeight = clampUserHeightCm(userHeightCm);
  const personWidthCm = clampedUserHeight * MASCOT_ASPECT;
  const personSpanCm =
    REF_BODY_SPAN_CM * (clampedUserHeight / REF_HEIGHT_CM);

  const displayWidthCm = trueWidthCm;
  const totalWidthCm = personWidthCm + GAP_CM + displayWidthCm;
  const rulerMaxCm = Math.max(clampedUserHeight, heightCm);

  const usableW = Math.max(120, stagePx.w - 48);
  const usableH = Math.max(120, stagePx.h - FLOOR_PAD_PX);
  const pxPerCm = Math.min(usableH / rulerMaxCm, usableW / totalWidthCm);

  const plotH = rulerMaxCm * pxPerCm;
  const personH = clampedUserHeight * pxPerCm;
  const personW = personWidthCm * pxPerCm;
  const productH = heightCm * pxPerCm;
  const productW = displayWidthCm * pxPerCm;
  const gapW = GAP_CM * pxPerCm;
  const personSpanW = personSpanCm * pxPerCm;

  const heightRatio = heightCm / clampedUserHeight;
  const secondaryRatio = secondaryCm ? secondaryCm / clampedUserHeight : null;
  const landmark = bodyLandmarkForRatio(heightRatio);
  const peopleWide = Math.max(1, Math.round(trueWidthCm / personSpanCm));

  const widthMarks = useMemo(() => {
    const marks: number[] = [0];
    const step = personSpanCm;
    for (let cm = step; cm < trueWidthCm - 0.5; cm += step) {
      marks.push(Math.round(cm * 10) / 10);
    }
    marks.push(trueWidthCm);
    return marks;
  }, [trueWidthCm, personSpanCm]);

  const bounds = heightBoundsForUnit(unit);
  const presets = heightPresetsForUnit(unit);
  const ftParts = cmToFeetInches(clampedUserHeight);

  const syncHeightCm = (cm: number) => {
    const clamped = clampUserHeightCm(cm);
    setUserHeightCm(clamped);
    const parts = cmToFeetInches(clamped);
    setFeetDraft(String(parts.feet));
    setInchesDraft(String(parts.inches));
    if (unit !== "ft") {
      setHeightDraft(String(unitFromCm(clamped, unit)));
    }
    return clamped;
  };

  const rulerMarks = useMemo(() => {
    const step = unit === "in" ? 25.4 : unit === "ft" ? 30.48 : 50;
    const marks: number[] = [0];
    for (let cm = step; cm < rulerMaxCm - 0.5; cm += step) {
      marks.push(Math.round(cm * 10) / 10);
    }
    marks.push(Math.round(rulerMaxCm * 10) / 10);
    return marks;
  }, [rulerMaxCm, unit]);

  const setUnitAndSync = (next: MeasureUnit) => {
    setUnit(next);
    const parts = cmToFeetInches(clampedUserHeight);
    setFeetDraft(String(parts.feet));
    setInchesDraft(String(parts.inches));
    if (next !== "ft") {
      setHeightDraft(String(unitFromCm(clampedUserHeight, next)));
    }
  };

  const applyHeightDraft = (raw: string | number) => {
    const next = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
    if (!Number.isFinite(next)) {
      setHeightDraft(String(unitFromCm(userHeightCm, unit)));
      return;
    }
    syncHeightCm(cmFromUnit(next, unit));
  };

  const applyFeetInchesDraft = () => {
    const feet = Number.parseInt(feetDraft, 10);
    const inches = Number.parseInt(inchesDraft, 10);
    if (!Number.isFinite(feet) || !Number.isFinite(inches)) {
      setFeetDraft(String(ftParts.feet));
      setInchesDraft(String(ftParts.inches));
      return;
    }
    syncHeightCm(feetInchesToCm(feet, inches));
  };

  const yFromFloor = (cm: number) => (cm / rulerMaxCm) * 100;

  return (
    <div
      className={cn(
        "product-scale-compare",
        isBed && bedLengthCm ? "has-lie-fit" : null,
        className
      )}
      aria-label="Size guide"
      onClick={(event) => event.stopPropagation()}
    >
      <header className="product-scale-top">
        <h3 className="product-scale-title">{productName}</h3>

        <div className="product-scale-controls">
          <div className="product-scale-units" role="group" aria-label="Units">
            {UNITS.map((item) => (
              <button
                key={item}
                type="button"
                className={cn("product-scale-unit", unit === item && "is-active")}
                onClick={() => setUnitAndSync(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {unit === "ft" ? (
            <div className="product-scale-height">
              <span className="product-scale-height-kicker">Your height</span>
              <span className="product-scale-height-box is-ft">
                <label className="product-scale-ft-field" htmlFor={feetId}>
                  <input
                    id={feetId}
                    type="number"
                    inputMode="numeric"
                    min={"minFeet" in bounds ? bounds.minFeet : 3}
                    max={"maxFeet" in bounds ? bounds.maxFeet : 7}
                    step={1}
                    value={feetDraft}
                    onChange={(event) => setFeetDraft(event.target.value)}
                    onBlur={applyFeetInchesDraft}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    aria-label="Height in feet"
                  />
                  <span>ft</span>
                </label>
                <label className="product-scale-ft-field" htmlFor={inchesId}>
                  <input
                    id={inchesId}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={11}
                    step={1}
                    value={inchesDraft}
                    onChange={(event) => setInchesDraft(event.target.value)}
                    onBlur={applyFeetInchesDraft}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    aria-label="Height in inches"
                  />
                  <span>in</span>
                </label>
              </span>
            </div>
          ) : (
            <label className="product-scale-height" htmlFor={inputId}>
              <span className="product-scale-height-kicker">Your height</span>
              <span className="product-scale-height-box">
                <input
                  id={inputId}
                  type="number"
                  inputMode="decimal"
                  min={"min" in bounds ? bounds.min : undefined}
                  max={"max" in bounds ? bounds.max : undefined}
                  step={unit === "in" ? 0.1 : 1}
                  value={heightDraft}
                  onChange={(event) => setHeightDraft(event.target.value)}
                  onBlur={() => applyHeightDraft(heightDraft)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  aria-label="Your height"
                />
                <span>{unitLabel(unit)}</span>
              </span>
            </label>
          )}

          <div className="product-scale-presets" role="group" aria-label="Height presets">
            {presets
              .filter((preset) => Math.abs(preset.cm - clampedUserHeight) > 2)
              .map((preset) => (
                <button
                  key={preset.cm}
                  type="button"
                  className="product-scale-preset"
                  onClick={() => {
                    syncHeightCm(preset.cm);
                    if (unit !== "ft") {
                      setHeightDraft(String(unitFromCm(preset.cm, unit)));
                    }
                  }}
                >
                  {preset.label}
                </button>
              ))}
          </div>
        </div>
      </header>

      <div className="product-scale-stage" ref={stageRef}>
        <div className="product-scale-plot" style={{ height: `${plotH + 36}px` }}>
          <div className="product-scale-ruler" style={{ height: `${plotH}px` }} aria-hidden="true">
            {rulerMarks.map((cm) => (
              <span
                key={cm}
                className={cn("product-scale-ruler-mark", cm === 0 && "is-zero")}
                style={{ bottom: `${yFromFloor(cm)}%` }}
              >
                <em>{formatRulerMark(cm, unit)}</em>
              </span>
            ))}
            <span
              className="product-scale-ruler-accent"
              style={{ bottom: `${yFromFloor(heightCm)}%` }}
            />
            {secondaryCm ? (
              <span
                className="product-scale-ruler-accent is-seat"
                style={{ bottom: `${yFromFloor(secondaryCm)}%` }}
              />
            ) : null}
          </div>

          <div
            className="product-scale-scene-stack"
            style={{
              gridTemplateColumns: `${personW}px ${gapW}px ${productW}px`,
            }}
          >
            <div
              className="product-scale-scene"
              style={{ height: `${plotH}px`, gridColumn: "1 / -1" }}
            >
              <div className="product-scale-floor" aria-hidden="true" />

              <div
                className="product-scale-guide"
                style={{ bottom: `${yFromFloor(heightCm)}%` }}
                aria-hidden="true"
              >
                <span className="product-scale-guide-label">
                  {isBed
                    ? `Headboard ${formatLength(heightCm, unit)} · ${landmark.label}`
                    : `${formatLength(heightCm, unit)} · ${landmark.label}`}
                </span>
                <span className="product-scale-guide-line" />
              </div>

              {secondaryCm ? (
                <div
                  className="product-scale-guide is-seat"
                  style={{ bottom: `${yFromFloor(secondaryCm)}%` }}
                  aria-hidden="true"
                >
                  <span className="product-scale-guide-label">
                    {isBed ? "Mattress" : seatLabel}{" "}
                    {formatLength(secondaryCm, unit)}
                    {secondaryRatio
                      ? ` · ${Math.round(secondaryRatio * 100)}%`
                      : ""}
                  </span>
                  <span className="product-scale-guide-line" />
                </div>
              ) : null}

              <div
                className="product-scale-compare-cols"
                style={{
                  gridTemplateColumns: `${personW}px ${gapW}px ${productW}px`,
                }}
              >
                <div
                  className="product-scale-figure is-person"
                  style={{ width: `${personW}px`, height: `${personH}px` }}
                >
                  <Image
                    src={MASCOT_SRC}
                    alt=""
                    width={270}
                    height={731}
                    className="product-scale-figure-img"
                    unoptimized
                    priority
                  />
                  <span className="product-scale-chip is-person">
                    You · {formatLength(clampedUserHeight, unit)}
                  </span>
                </div>

                <div aria-hidden="true" />

                <div
                  className={cn(
                    "product-scale-figure is-product",
                    cutout.ready && "is-ready"
                  )}
                  style={{ width: `${productW}px`, height: `${productH}px` }}
                >
                  {cutout.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cutout.src}
                      alt={productName}
                      className="product-scale-cutout"
                      draggable={false}
                    />
                  ) : null}
                  <span className="product-scale-chip is-dims">
                    {isBed
                      ? `${formatLength(heightCm, unit)} headboard`
                      : `${formatLength(heightCm, unit)} H`}
                  </span>
                </div>
              </div>
            </div>

            <div className="product-scale-width-person" aria-hidden="true">
              <div
                className="product-scale-width-person-bar"
                style={{ width: `${personSpanW}px` }}
              />
              <em>~{formatLength(personSpanCm, unit)} body</em>
            </div>
            <div aria-hidden="true" />
            <div className="product-scale-width-measure" aria-hidden="true">
              <div className="product-scale-width-track">
                {widthMarks.map((cm) => (
                  <span
                    key={cm}
                    className={cn(
                      "product-scale-width-tick",
                      cm === 0 && "is-start",
                      cm === trueWidthCm && "is-end"
                    )}
                    style={{ left: `${(cm / trueWidthCm) * 100}%` }}
                  />
                ))}
              </div>
              <p className="product-scale-width-label">
                {formatLength(trueWidthCm, unit)} wide · ~{peopleWide}× body width
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="product-scale-legend" aria-label="Key measurements">
        <span>
          <em>You</em>
          {formatLength(clampedUserHeight, unit)}
        </span>
        <span>
          <em>{isBed ? "Headboard" : "Height"}</em>
          {formatLength(heightCm, unit)}
        </span>
        {secondaryCm ? (
          <span>
            <em>{isBed ? "Mattress" : seatLabel}</em>
            {formatLength(secondaryCm, unit)}
            {secondaryRatio ? ` · ${Math.round(secondaryRatio * 100)}%` : ""}
          </span>
        ) : null}
        <span>
          <em>Width</em>
          {formatLength(trueWidthCm, unit)}
        </span>
      </div>

      {isBed && bedLengthCm && bedLengthCm > 0 ? (
        <div className="product-scale-lie-fit" aria-label="Lying down space">
          <div className="product-scale-lie-fit-head">
            <span>Lying down</span>
            <span>
              Mattress {formatLength(bedLengthCm, unit)} · you take{" "}
              {Math.round((clampedUserHeight / bedLengthCm) * 100)}%
            </span>
          </div>
          <div className="product-scale-lie-fit-track">
            <div
              className="product-scale-lie-fit-you"
              style={{
                width: `${Math.min(100, (clampedUserHeight / bedLengthCm) * 100)}%`,
              }}
            >
              <em>You {formatLength(clampedUserHeight, unit)}</em>
            </div>
            {bedLengthCm > clampedUserHeight ? (
              <div className="product-scale-lie-fit-spare">
                <em>
                  +{formatLength(bedLengthCm - clampedUserHeight, unit)} spare
                </em>
              </div>
            ) : (
              <div className="product-scale-lie-fit-spare is-tight">
                <em>Fits tight</em>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <footer className="product-scale-foot">
        <p className="product-scale-story">
          {isBed ? (
            <>
              Standing: headboard at your {landmark.label}. Width{" "}
              {formatLength(trueWidthCm, unit)}.
            </>
          ) : (
            <>
              Backrest at {landmark.label}
              {" · "}
              {Math.round(heightRatio * 100)}% of your height
              {depthCm ? ` · ${formatLength(depthCm, unit)} deep` : ""}
              {` · ${formatLength(trueWidthCm, unit)} wide (~${peopleWide} people)`}
            </>
          )}
        </p>
      </footer>
    </div>
  );
}
