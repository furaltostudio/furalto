"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Product, ProductOption, ProductSpec } from "@/types/product";
import type { ProductSelection } from "@/lib/products/resolve-specs";
import { groupProductSpecs, resolveProductSpecs } from "@/lib/products/resolve-specs";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

type ProductSpecsPanelProps = {
  product: Product;
  selection: ProductSelection;
};

type MeasureTriplet = {
  length?: string;
  height?: string;
  depth?: string;
};

function findOption(options: ProductOption[], id: string) {
  return options.find((option) => option.id === id);
}

function splitMeasure(value: string) {
  const match = value.trim().match(/^([\d.,]+)\s*(.*)$/);
  if (!match || !match[2]) {
    return { figure: value.trim(), unit: "" };
  }
  return { figure: match[1], unit: match[2] };
}

function pickMeasure(
  items: Array<ProductSpec & { emphasis?: boolean }> | undefined,
  patterns: RegExp[],
) {
  if (!items?.length) return undefined;
  for (const pattern of patterns) {
    const hit = items.find((item) => pattern.test(item.label));
    if (hit) return hit.value;
  }
  return undefined;
}

function buildMeasureTriplet(
  items: Array<ProductSpec & { emphasis?: boolean }> | undefined,
): MeasureTriplet {
  return {
    length: pickMeasure(items, [/^length$/i, /^width$/i, /overall.?width/i]),
    height: pickMeasure(items, [/^height$/i, /overall.?height/i]),
    depth: pickMeasure(items, [/^depth$/i, /overall.?depth/i]),
  };
}

function SpecBlock({
  index,
  title,
  children,
  delay = 0,
}: {
  index: string;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal as="div" className="product-specs-block" delay={delay}>
      <div className="product-specs-block-head">
        <span className="product-specs-block-index" aria-hidden="true">
          {index}
        </span>
        <h3>{title}</h3>
      </div>
      {children}
    </Reveal>
  );
}

function SpecRows({
  items,
}: {
  items: Array<ProductSpec & { emphasis?: boolean }>;
}) {
  return (
    <dl className="product-specs-list">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn("product-specs-row", item.emphasis && "is-updated")}
        >
          <dt>{item.label}</dt>
          <dd key={`${item.label}-${item.value}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function MeasureGlyph({ measures }: { measures: MeasureTriplet }) {
  const length = measures.length ? splitMeasure(measures.length) : null;
  const height = measures.height ? splitMeasure(measures.height) : null;
  const depth = measures.depth ? splitMeasure(measures.depth) : null;

  return (
    <div className="product-specs-glyph-wrap">
      <svg
        className="product-specs-glyph"
        viewBox="0 0 220 148"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Soft ground plane */}
        <path
          d="M34 118H186"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="1"
        />

        {/* Primary volume */}
        <rect
          x="46"
          y="42"
          width="128"
          height="64"
          stroke="currentColor"
          strokeWidth="1.15"
        />
        {/* Subtle depth cue */}
        <path
          d="M174 42L190 30V94L174 106"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path
          d="M46 42L62 30H190"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1"
        />

        {/* Length bracket */}
        <path
          d="M46 28V22H174V28"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Height bracket */}
        <path
          d="M36 42H30V106H36"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Depth bracket */}
        <path
          d="M196 34H202V98H196"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.7"
        />

        <text x="110" y="16" textAnchor="middle" className="product-specs-glyph-axis">
          L
        </text>
        <text x="18" y="78" textAnchor="middle" className="product-specs-glyph-axis">
          H
        </text>
        <text x="210" y="70" textAnchor="middle" className="product-specs-glyph-axis">
          D
        </text>
      </svg>

      {(length || height || depth) ? (
        <dl className="product-specs-glyph-readout">
          {length ? (
            <div>
              <dt>L</dt>
              <dd>
                <span>{length.figure}</span>
                {length.unit ? <small>{length.unit}</small> : null}
              </dd>
            </div>
          ) : null}
          {height ? (
            <div>
              <dt>H</dt>
              <dd>
                <span>{height.figure}</span>
                {height.unit ? <small>{height.unit}</small> : null}
              </dd>
            </div>
          ) : null}
          {depth ? (
            <div>
              <dt>D</dt>
              <dd>
                <span>{depth.figure}</span>
                {depth.unit ? <small>{depth.unit}</small> : null}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}

export function ProductSpecsPanel({ product, selection }: ProductSpecsPanelProps) {
  const specs = useMemo(
    () => resolveProductSpecs(product, selection),
    [product, selection],
  );
  const [previousSpecs, setPreviousSpecs] = useState<ProductSpec[]>(specs);
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      setPreviousSpecs(specs);
      return;
    }
    const timer = window.setTimeout(() => setPreviousSpecs(specs), 650);
    return () => window.clearTimeout(timer);
  }, [selection.fabricId, selection.finishId, selection.sizeId, specs]);

  const groups = groupProductSpecs(specs, previousSpecs);
  const fabric = findOption(product.fabrics, selection.fabricId);
  const finish = findOption(product.finishes, selection.finishId);
  const size = findOption(product.sizes, selection.sizeId);
  const hasConfiguration = Boolean(fabric || finish || size);

  const dimensions = groups.find((group) => group.id === "dimensions");
  const materials = groups.find((group) => group.id === "materials");
  const build = groups.find((group) => group.id === "build");
  const configuration = groups.find((group) => group.id === "configuration");
  const measureTriplet = useMemo(
    () => buildMeasureTriplet(dimensions?.items),
    [dimensions?.items],
  );

  const designDetails = product.details.filter(
    (detail) => !/^care\s*:/i.test(detail) && !/^delivered\b/i.test(detail),
  );
  const careDetails = product.details.filter(
    (detail) => /^care\s*:/i.test(detail) || /^delivered\b/i.test(detail),
  );

  if (!product.details.length && !specs.length) {
    return null;
  }

  let blockIndex = 1;
  const nextIndex = () => String(blockIndex++).padStart(2, "0");

  return (
    <section
      className="product-specs"
      id="product-specs"
      aria-labelledby="product-specs-heading"
    >
      <div className="product-specs-atmosphere" aria-hidden="true" />

      <div className="product-specs-shell">
        <Reveal as="header" className="product-specs-masthead">
          <div className="product-specs-intro">
            <p className="product-specs-kicker">Atelier sheet</p>
            <h2 id="product-specs-heading" className="product-specs-title">
              Craft <em>&</em> dimensions
            </h2>
            <p className="product-specs-copy">
              {hasConfiguration
                ? "Proportions and materials shift with your fabric, finish, and size."
                : "The measured truth of the piece — proportions, materials, and build."}
            </p>

            {hasConfiguration ? (
              <div className="product-specs-picks" aria-live="polite">
                {fabric ? (
                  <div className="product-specs-pick">
                    {fabric.swatch ? (
                      <span
                        className="product-specs-pick-swatch"
                        style={{ backgroundColor: fabric.swatch }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div>
                      <span>Fabric</span>
                      <strong>{fabric.label}</strong>
                    </div>
                  </div>
                ) : null}
                {finish ? (
                  <div className="product-specs-pick">
                    {finish.swatch ? (
                      <span
                        className="product-specs-pick-swatch"
                        style={{ backgroundColor: finish.swatch }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div>
                      <span>Finish</span>
                      <strong>{finish.label}</strong>
                    </div>
                  </div>
                ) : null}
                {size ? (
                  <div className="product-specs-pick">
                    <div>
                      <span>Size</span>
                      <strong>{size.label}</strong>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="product-specs-masthead-aside">
            <MeasureGlyph measures={measureTriplet} />
          </div>
        </Reveal>

        {dimensions && dimensions.items.length > 0 ? (
          <Reveal as="div" className="product-specs-measure" delay={80}>
            <div className="product-specs-measure-rail">
              <p className="product-specs-measure-kicker">Proportions</p>
              <span className="product-specs-measure-rule" aria-hidden="true" />
            </div>
            <div className="product-specs-dims" aria-label="Dimensions">
              {dimensions.items.map((item, i) => {
                const { figure, unit } = splitMeasure(item.value);
                return (
                  <article
                    key={item.label}
                    className={cn(
                      "product-specs-dim",
                      item.emphasis && "is-updated",
                    )}
                    style={{ "--dim-i": i } as CSSProperties}
                  >
                    <p className="product-specs-dim-label">{item.label}</p>
                    <p
                      className="product-specs-dim-value"
                      key={`${item.label}-${item.value}`}
                    >
                      <span className="product-specs-dim-figure">{figure}</span>
                      {unit ? (
                        <span className="product-specs-dim-unit">{unit}</span>
                      ) : null}
                    </p>
                  </article>
                );
              })}
            </div>
          </Reveal>
        ) : null}

        <div className="product-specs-columns">
          {materials && materials.items.length > 0 ? (
            <SpecBlock index={nextIndex()} title="Materials" delay={120}>
              <SpecRows items={materials.items} />
            </SpecBlock>
          ) : null}

          {build && build.items.length > 0 ? (
            <SpecBlock index={nextIndex()} title="Build" delay={180}>
              <SpecRows items={build.items} />
            </SpecBlock>
          ) : null}

          {configuration && configuration.items.length > 0 ? (
            <SpecBlock index={nextIndex()} title="Configuration" delay={220}>
              <SpecRows items={configuration.items} />
            </SpecBlock>
          ) : null}

          {product.details.length > 0 ? (
            <SpecBlock
              index={nextIndex()}
              title={careDetails.length ? "Care & delivery" : "Details"}
              delay={240}
            >
              <ul className="product-specs-details">
                {(careDetails.length ? careDetails : designDetails).map(
                  (detail) => (
                    <li key={detail}>
                      {detail.replace(/^care\s*:\s*/i, "")}
                    </li>
                  ),
                )}
              </ul>
            </SpecBlock>
          ) : null}
        </div>
      </div>
    </section>
  );
}
