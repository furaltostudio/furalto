"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Cpu, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import {
  customFurnitureService,
  type CustomFurnitureCatalog,
  type CustomOption,
  type CustomSelection,
  type StudioBrief,
} from "@/services/custom-furniture.service";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: "intent", title: "Intent" },
  { id: "form", title: "Form" },
  { id: "material", title: "Material" },
  { id: "scale", title: "Scale" },
  { id: "commission", title: "Commission" },
] as const;

const SWATCH: Record<string, string> = {
  sofa: "linear-gradient(145deg, #d8cfc4 0%, #a89884 100%)",
  bed: "linear-gradient(145deg, #ddd4c8 0%, #9d8b78 100%)",
  "cloud-curve": "linear-gradient(145deg, #f2ece4 0%, #cfc4b6 100%)",
  "arc-lounge": "linear-gradient(145deg, #e8e0d6 0%, #b8a994 100%)",
  "modular-block": "linear-gradient(145deg, #e0d6c8 0%, #9f8f7c 100%)",
  "linear-channel": "linear-gradient(145deg, #d9d2c8 0%, #8a7d6e 100%)",
  "embrace-set": "linear-gradient(145deg, #efe8de 0%, #c4b5a4 100%)",
  "softline-channel": "linear-gradient(145deg, #ebe4da 0%, #b5a792 100%)",
  "panel-frame": "linear-gradient(145deg, #e4ddd3 0%, #a89884 100%)",
  "softedge-arc": "linear-gradient(145deg, #f0eae2 0%, #c2b5a4 100%)",
  "grid-block": "linear-gradient(145deg, #ddd6cc 0%, #8f8274 100%)",
  oak: "linear-gradient(145deg, #e0c49a 0%, #b08958 100%)",
  walnut: "linear-gradient(145deg, #8b5e3c 0%, #3f2416 100%)",
  teak: "linear-gradient(145deg, #c9a35a 0%, #7a5418 100%)",
  ash: "linear-gradient(145deg, #ece6db 0%, #c2b7a6 100%)",
  linen: "linear-gradient(145deg, #f0e9df 0%, #d2c4b2 100%)",
  velvet: "linear-gradient(145deg, #6b5b7a 0%, #2f2438 100%)",
  boucle: "linear-gradient(145deg, #e7e1d8 0%, #bdb3a6 100%)",
  performance: "linear-gradient(145deg, #c5d0c4 0%, #7f917e 100%)",
  leather: "linear-gradient(145deg, #9a5c3c 0%, #4a2416 100%)",
  natural: "linear-gradient(145deg, #e8d7b8 0%, #b89a6d 100%)",
  matte: "linear-gradient(145deg, #d5d0c8 0%, #8e8981 100%)",
  stained: "linear-gradient(145deg, #a67c52 0%, #5c3b22 100%)",
  metal: "linear-gradient(145deg, #e0c48a 0%, #8d6b32 100%)",
  standard: "linear-gradient(145deg, #efe8de 0%, #cbbba8 100%)",
  large: "linear-gradient(145deg, #e4d9cb 0%, #b49d84 100%)",
  bespoke: "linear-gradient(145deg, #d9cbb8 0%, #9a8168 100%)",
};

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function buildLocalEstimate(catalog: CustomFurnitureCatalog, selection: CustomSelection) {
  const piece = catalog.pieces.find((item) => item.id === selection.pieceId);
  const wood = catalog.woods.find((item) => item.id === selection.woodId);
  const fabric = catalog.fabrics.find((item) => item.id === selection.fabricId);
  const finish = catalog.finishes.find((item) => item.id === selection.finishId);
  const size = catalog.sizes.find((item) => item.id === selection.sizeId);
  if (!piece || !wood || !fabric || !finish || !size) return null;

  const base = piece.basePrice ?? 0;
  const woodAdd = wood.priceAdd ?? 0;
  const fabricAdd = fabric.priceAdd ?? 0;
  const finishAdd = finish.priceAdd ?? 0;
  const multiplier = size.multiplier ?? 1;

  return {
    amount: Math.round((base + woodAdd + fabricAdd + finishAdd) * multiplier),
    breakdown: {
      base,
      wood: woodAdd,
      fabric: fabricAdd,
      finish: finishAdd,
      sizeMultiplier: multiplier,
    },
    configuration: {
      pieceId: piece.id,
      pieceLabel: piece.label,
      pieceFamily: piece.family,
      inspiredBy: piece.inspiredBy,
      woodId: wood.id,
      woodLabel: wood.label,
      fabricId: fabric.id,
      fabricLabel: fabric.label,
      finishId: finish.id,
      finishLabel: finish.label,
      sizeId: size.id,
      sizeLabel: size.label,
    },
  };
}

function OptionGrid({
  options,
  value,
  onChange,
  showPrice,
  variant = "default",
}: {
  options: CustomOption[];
  value: string;
  onChange: (id: string) => void;
  showPrice?: "add" | "base" | "multiplier";
  variant?: "default" | "intent" | "compact";
}) {
  return (
    <div
      className={cn(
        "custom-config-options",
        variant === "intent" && "custom-config-options--intent",
        variant === "compact" && "custom-config-options--compact"
      )}
    >
      {options.map((option) => {
        const selected = option.id === value;
        let priceLabel = "";
        if (showPrice === "base" && option.basePrice != null) {
          priceLabel = `From ${formatInr(option.basePrice)}`;
        } else if (showPrice === "add" && option.priceAdd != null) {
          priceLabel =
            option.priceAdd === 0 ? "Included" : `+ ${formatInr(option.priceAdd)}`;
        } else if (showPrice === "multiplier" && option.multiplier != null) {
          priceLabel =
            option.multiplier === 1
              ? "Catalogue pricing"
              : `+${Math.round((option.multiplier - 1) * 100)}% scale`;
        }

        return (
          <button
            key={option.id}
            type="button"
            className={cn("custom-config-option", selected && "is-selected")}
            onClick={() => onChange(option.id)}
          >
            <span
              className="custom-config-swatch"
              style={{ background: SWATCH[option.id] || "var(--champagne)" }}
              aria-hidden="true"
            />
            <span className="custom-config-option-body">
              <span className="custom-config-option-top">
                <span className="custom-config-option-label">{option.label}</span>
                {selected ? (
                  <span className="custom-config-check" aria-hidden="true">
                    <Check size={14} strokeWidth={1.75} />
                  </span>
                ) : null}
              </span>
              <span className="custom-config-option-desc">{option.description}</span>
              {option.inspiredBy?.length ? (
                <span className="custom-config-inspired">
                  Inspired by {option.inspiredBy.slice(0, 2).join(" · ")}
                  {option.inspiredBy.length > 2 ? " +" : ""}
                </span>
              ) : null}
              {priceLabel ? (
                <span className="custom-config-option-price">{priceLabel}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function CustomConfigurator() {
  const [catalog, setCatalog] = useState<CustomFurnitureCatalog | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [intentId, setIntentId] = useState<"sofa" | "bed">("sofa");
  const [pieceId, setPieceId] = useState("cloud-curve");
  const [woodId, setWoodId] = useState("oak");
  const [fabricId, setFabricId] = useState("linen");
  const [finishId, setFinishId] = useState("natural");
  const [sizeId, setSizeId] = useState("standard");
  const [roomNotes, setRoomNotes] = useState("");
  const [adviceText, setAdviceText] = useState("");
  const [brief, setBrief] = useState<StudioBrief | null>(null);
  const [adviceSource, setAdviceSource] = useState<"gemini" | "studio" | null>(null);
  const [adviceMessage, setAdviceMessage] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });
  const autoConsultedKey = useRef("");

  useEffect(() => {
    customFurnitureService
      .getCatalog()
      .then((response) => {
        const data = response.data;
        setCatalog(data);
        const firstSofa =
          data.pieces.find((piece) => piece.family === "sofa") || data.pieces[0];
        setPieceId(firstSofa?.id || "cloud-curve");
        setWoodId(data.woods[0]?.id || "oak");
        setFabricId(
          data.fabrics.find((fabric) => fabric.id === "linen")?.id ||
            data.fabrics[0]?.id ||
            "linen"
        );
        setFinishId(data.finishes[0]?.id || "natural");
        setSizeId(data.sizes[0]?.id || "standard");
      })
      .catch((error) => setLoadError(getAuthErrorMessage(error)));
  }, []);

  const selection = useMemo(
    () => ({ pieceId, woodId, fabricId, finishId, sizeId }),
    [pieceId, woodId, fabricId, finishId, sizeId]
  );

  const familyPieces = useMemo(() => {
    if (!catalog) return [];
    return catalog.pieces.filter((piece) => piece.family === intentId);
  }, [catalog, intentId]);

  useEffect(() => {
    if (!catalog || familyPieces.length === 0) return;
    if (!familyPieces.some((piece) => piece.id === pieceId)) {
      setPieceId(familyPieces[0].id);
    }
  }, [catalog, familyPieces, pieceId]);

  const estimate = useMemo(() => {
    if (!catalog) return null;
    return buildLocalEstimate(catalog, selection);
  }, [catalog, selection]);

  const selectedPiece = catalog?.pieces.find((piece) => piece.id === pieceId);

  const requestAdvice = async (opts?: { silent?: boolean }) => {
    setAdviceLoading(true);
    if (!opts?.silent) setFormError("");
    try {
      const response = await customFurnitureService.estimate(
        {
          ...selection,
          city: contact.city,
          roomNotes: roomNotes || contact.message,
        },
        true
      );
      const next = response.data.estimate;
      if (!next?.advice && !next?.brief) {
        if (!opts?.silent) {
          setFormError("Unable to generate studio guidance right now. Please try again.");
        }
        return;
      }
      setAdviceText(next.advice || next.brief?.summary || "");
      setBrief(next.brief || null);
      setAdviceSource(next.adviceSource || null);
      setAdviceMessage(next.adviceMessage || null);
    } catch (error) {
      if (!opts?.silent) setFormError(getAuthErrorMessage(error));
    } finally {
      setAdviceLoading(false);
    }
  };

  // Auto-consult once composition reaches Scale (or later), when selection settles.
  useEffect(() => {
    if (!catalog || stepIndex < 3) return;
    const key = `${selection.pieceId}|${selection.woodId}|${selection.fabricId}|${selection.finishId}|${selection.sizeId}|${contact.city}|${roomNotes}`;
    if (autoConsultedKey.current === key) return;

    const timer = window.setTimeout(() => {
      autoConsultedKey.current = key;
      void requestAdvice({ silent: true });
    }, 700);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, stepIndex, selection, contact.city, roomNotes]);

  const applyAlternate = (nextPieceId: string) => {
    const piece = catalog?.pieces.find((item) => item.id === nextPieceId);
    if (!piece) return;
    if (piece.family === "sofa" || piece.family === "bed") {
      setIntentId(piece.family);
    }
    setPieceId(nextPieceId);
    setStepIndex(1);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const mergedNotes = [contact.message, roomNotes].filter(Boolean).join("\n\n");
      await customFurnitureService.submitQuote({
        ...selection,
        ...contact,
        message: mergedNotes,
        advice: adviceText || brief?.summary || "",
      });
      setSubmitted(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return <p className="custom-config-error">{loadError}</p>;
  }

  if (!catalog) {
    return (
      <div className="custom-config-loading">
        <p className="custom-config-eyebrow">Bespoke Studio</p>
        <p className="custom-config-muted">Loading silhouettes from the catalogue…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="custom-config-success">
        <p className="custom-config-eyebrow">Request received</p>
        <span className="custom-config-rule" aria-hidden="true" />
        <h2>Your composition is with our studio</h2>
        <p>
          A Furalto specialist will review your selections
          {estimate ? ` — indicative estimate ${formatInr(estimate.amount)}` : ""} — and
          contact you within one to two business days.
        </p>
      </div>
    );
  }

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="custom-config">
      <header className="custom-config-hero">
        <div className="custom-config-hero-copy">
          <p className="custom-config-eyebrow">Bespoke Studio · AI guided</p>
          <h1>Compose with catalogue DNA + Studio AI</h1>
          <p className="custom-config-lead">
            Build from live Furalto silhouettes. Studio AI reads your materials, room notes,
            and scale — then suggests pairings and smarter alternates. Need broader help?
            Use the Studio AI icon (bottom left) anytime across the site.
          </p>
        </div>
        <div className="custom-config-hero-meter" aria-hidden="true">
          <div
            className="custom-config-ring"
            style={{ ["--progress" as string]: `${progress}%` }}
          >
            <strong>{String(stepIndex + 1).padStart(2, "0")}</strong>
            <em>/{String(STEPS.length).padStart(2, "0")}</em>
          </div>
          <p>Step · {step.title}</p>
        </div>
      </header>

      <div className="custom-config-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <nav className="custom-config-steps" aria-label="Configuration steps">
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "custom-config-step",
              index === stepIndex && "is-active",
              index < stepIndex && "is-done"
            )}
            onClick={() => setStepIndex(index)}
          >
            <span className="custom-config-step-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="custom-config-step-label">{item.title}</span>
          </button>
        ))}
      </nav>

      <div className="custom-config-layout">
        <div className="custom-config-main">
          <Reveal key={step.id}>
            {step.id === "intent" ? (
              <>
                <p className="custom-config-kicker">01 · Intent</p>
                <h2>What are we building?</h2>
                <p className="custom-config-lead">
                  Start with seating or sleeping — every path maps to silhouettes already
                  in the Furalto collection.
                </p>
                <OptionGrid
                  options={catalog.intents}
                  value={intentId}
                  onChange={(id) => setIntentId(id as "sofa" | "bed")}
                  variant="intent"
                />
              </>
            ) : null}

            {step.id === "form" ? (
              <>
                <p className="custom-config-kicker">02 · Form</p>
                <h2>Choose your silhouette</h2>
                <p className="custom-config-lead">
                  Each form is distilled from live products — curve, modular, channel, or
                  softedge — then made to your brief.
                </p>
                <OptionGrid
                  options={familyPieces}
                  value={pieceId}
                  onChange={setPieceId}
                  showPrice="base"
                />
              </>
            ) : null}

            {step.id === "material" ? (
              <>
                <p className="custom-config-kicker">03 · Material</p>
                <h2>Tune the surface language</h2>
                <p className="custom-config-lead">
                  Upholstery first, then timber and finish — cream bouclé, walnut plinths,
                  champagne metal.
                </p>
                <div className="custom-config-material-stack">
                  <div>
                    <h3>Upholstery</h3>
                    <OptionGrid
                      options={catalog.fabrics}
                      value={fabricId}
                      onChange={setFabricId}
                      showPrice="add"
                      variant="compact"
                    />
                  </div>
                  <div>
                    <h3>Frame &amp; timber</h3>
                    <OptionGrid
                      options={catalog.woods}
                      value={woodId}
                      onChange={setWoodId}
                      showPrice="add"
                      variant="compact"
                    />
                  </div>
                  <div>
                    <h3>Finish</h3>
                    <OptionGrid
                      options={catalog.finishes}
                      value={finishId}
                      onChange={setFinishId}
                      showPrice="add"
                      variant="compact"
                    />
                  </div>
                </div>
              </>
            ) : null}

            {step.id === "scale" ? (
              <>
                <p className="custom-config-kicker">04 · Scale</p>
                <h2>Set the footprint</h2>
                <p className="custom-config-lead">
                  Stay on catalogue proportions, expand for open rooms, or fit exact
                  measurements. Add room notes so Studio AI can judge fit.
                </p>
                <OptionGrid
                  options={catalog.sizes}
                  value={sizeId}
                  onChange={setSizeId}
                  showPrice="multiplier"
                />
                <label className="custom-config-room-field">
                  <span>Room notes for Studio AI</span>
                  <textarea
                    rows={3}
                    value={roomNotes}
                    onChange={(e) => setRoomNotes(e.target.value)}
                    placeholder="e.g. 14×18 living, north light, kids at home, cream walls…"
                  />
                </label>
              </>
            ) : null}

            {step.id === "commission" ? (
              <>
                <p className="custom-config-kicker">05 · Commission</p>
                <h2>Request your studio build</h2>
                <p className="custom-config-lead">
                  Share contact details. Studio AI notes travel with your brief to the
                  design team.
                </p>
                <form className="custom-config-form" onSubmit={handleSubmit}>
                  <div className="custom-config-form-grid">
                    <label>
                      <span>First name</span>
                      <input
                        required
                        value={contact.firstName}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, firstName: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Last name</span>
                      <input
                        required
                        value={contact.lastName}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, lastName: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        required
                        value={contact.email}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, email: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Phone</span>
                      <input
                        required
                        value={contact.phone}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, phone: e.target.value }))
                        }
                      />
                    </label>
                    <label className="custom-config-span-2">
                      <span>City</span>
                      <input
                        value={contact.city}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, city: e.target.value }))
                        }
                        placeholder="Helps Studio AI with climate & delivery context"
                      />
                    </label>
                    <label className="custom-config-span-2">
                      <span>Extra notes</span>
                      <textarea
                        rows={4}
                        value={contact.message}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, message: e.target.value }))
                        }
                        placeholder="Delivery window, preferred visit time, trade account…"
                      />
                    </label>
                  </div>
                  {formError ? <p className="custom-config-error">{formError}</p> : null}
                  <Button
                    type="submit"
                    className="custom-config-primary"
                    isLoading={isSubmitting}
                    loadingText="Sending…"
                  >
                    Submit commission
                    <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                  </Button>
                </form>
              </>
            ) : null}
          </Reveal>

          {step.id !== "commission" ? (
            <div className="custom-config-nav">
              <button
                type="button"
                className="custom-config-secondary"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              >
                Back
              </button>
              <button
                type="button"
                className="custom-config-primary"
                onClick={() =>
                  setStepIndex((current) => Math.min(STEPS.length - 1, current + 1))
                }
              >
                Continue
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        <aside className="custom-config-summary" aria-live="polite">
          <div className="custom-config-summary-top">
            <p className="custom-config-eyebrow">Indicative estimate</p>
            <p className="custom-config-price">
              {estimate ? formatInr(estimate.amount) : "—"}
            </p>
            <p className="custom-config-summary-note">{catalog.leadTimeNote}</p>
          </div>

          {estimate ? (
            <ul className="custom-config-breakdown">
              <li>
                <span>Silhouette</span>
                <strong>{formatInr(estimate.breakdown.base)}</strong>
              </li>
              <li>
                <span>Timber</span>
                <strong>+ {formatInr(estimate.breakdown.wood)}</strong>
              </li>
              <li>
                <span>Upholstery</span>
                <strong>+ {formatInr(estimate.breakdown.fabric)}</strong>
              </li>
              <li>
                <span>Finish</span>
                <strong>+ {formatInr(estimate.breakdown.finish)}</strong>
              </li>
              <li>
                <span>Scale</span>
                <strong>× {estimate.breakdown.sizeMultiplier}</strong>
              </li>
              <li className="custom-config-breakdown-total">
                <span>Total</span>
                <strong>{formatInr(estimate.amount)}</strong>
              </li>
            </ul>
          ) : null}

          <div className="custom-config-selection">
            <div className="custom-config-selection-swatches" aria-hidden="true">
              {[fabricId, woodId, finishId].map((id) => (
                <span
                  key={id}
                  style={{ background: SWATCH[id] || "var(--champagne)" }}
                />
              ))}
            </div>
            <p className="custom-config-selection-title">
              {estimate?.configuration.pieceLabel || selectedPiece?.label || "—"}
            </p>
            <p>
              {estimate?.configuration.fabricLabel} · {estimate?.configuration.woodLabel}
            </p>
            <p>
              {estimate?.configuration.finishLabel} · {estimate?.configuration.sizeLabel}
            </p>
          </div>

          <div className="custom-ai-panel">
            <div className="custom-ai-panel-head">
              <p className="custom-config-eyebrow">Studio AI</p>
              <span className="custom-ai-status">
                {adviceLoading
                  ? "Reading composition…"
                  : adviceSource === "gemini"
                    ? "Gemini live"
                    : adviceSource === "studio"
                      ? "Studio mode"
                      : "Ready"}
              </span>
            </div>

            <button
              type="button"
              className="custom-config-advice-btn"
              onClick={() => void requestAdvice()}
              disabled={adviceLoading}
            >
              {adviceLoading ? (
                <Cpu size={15} strokeWidth={1.35} aria-hidden="true" className="is-spin" />
              ) : (
                <Sparkles size={15} strokeWidth={1.35} aria-hidden="true" />
              )}
              {adviceLoading ? "Consulting…" : "Run Studio AI"}
            </button>

            {brief ? (
              <div className="custom-ai-brief">
                <p className="custom-ai-headline">{brief.headline}</p>
                <p className="custom-config-advice">{brief.summary}</p>

                {brief.pairing?.length ? (
                  <div className="custom-ai-block">
                    <p className="custom-ai-label">Pairing</p>
                    <ul>
                      {brief.pairing.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {brief.roomFit ? (
                  <div className="custom-ai-block">
                    <p className="custom-ai-label">Room fit</p>
                    <p>{brief.roomFit}</p>
                  </div>
                ) : null}

                {brief.care ? (
                  <div className="custom-ai-block">
                    <p className="custom-ai-label">Care</p>
                    <p>{brief.care}</p>
                  </div>
                ) : null}

                {(brief.fabricTip || brief.finishTip) && (
                  <div className="custom-ai-block">
                    <p className="custom-ai-label">Upgrades</p>
                    {brief.fabricTip ? <p>{brief.fabricTip}</p> : null}
                    {brief.finishTip ? <p>{brief.finishTip}</p> : null}
                  </div>
                )}

                {brief.alternates?.length ? (
                  <div className="custom-ai-block">
                    <p className="custom-ai-label">Smarter alternates</p>
                    <div className="custom-ai-alternates">
                      {brief.alternates.map((alt) => {
                        const piece = catalog.pieces.find((item) => item.id === alt.pieceId);
                        if (!piece) return null;
                        return (
                          <button
                            key={alt.pieceId}
                            type="button"
                            className="custom-ai-alternate"
                            onClick={() => applyAlternate(alt.pieceId)}
                          >
                            <span className="custom-ai-alternate-title">
                              <Wand2 size={13} strokeWidth={1.5} aria-hidden="true" />
                              {piece.label}
                            </span>
                            <span className="custom-ai-alternate-reason">{alt.reason}</span>
                            <span className="custom-ai-alternate-cta">Apply →</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <p className="custom-config-summary-hint">
                  {adviceSource === "gemini"
                    ? "Generated with Google Gemini"
                    : adviceMessage || "Studio consultant guidance"}
                </p>
              </div>
            ) : (
              <p className="custom-config-summary-hint">
                From Scale onward, Studio AI auto-reads your composition. Add room notes
                for better fit guidance — or ask the site-wide Studio AI icon anytime.
              </p>
            )}
          </div>

          {formError && step.id !== "commission" ? (
            <p className="custom-config-error">{formError}</p>
          ) : null}

          <p className="custom-config-disclaimer">{catalog.disclaimer}</p>
        </aside>
      </div>
    </div>
  );
}
