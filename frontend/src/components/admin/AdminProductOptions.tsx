"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/admin/format";

export type ProductOptionDraft = {
  id: string;
  label: string;
  swatch?: string;
};

type OptionKind = "fabric" | "finish" | "size";

type AdminProductOptionsProps = {
  fabrics: ProductOptionDraft[];
  finishes: ProductOptionDraft[];
  sizes: ProductOptionDraft[];
  onFabricsChange: (value: ProductOptionDraft[]) => void;
  onFinishesChange: (value: ProductOptionDraft[]) => void;
  onSizesChange: (value: ProductOptionDraft[]) => void;
};

const FABRIC_PRESETS: ProductOptionDraft[] = [
  { id: "cream-linen", label: "Cream Linen", swatch: "#f5efe6" },
  { id: "taupe-boucle", label: "Taupe Bouclé", swatch: "#c8b9a8" },
  { id: "espresso-velvet", label: "Espresso Velvet", swatch: "#4a3428" },
  { id: "sand-performance", label: "Sand Performance", swatch: "#d8cdbf" },
  { id: "charcoal-wool", label: "Charcoal Wool", swatch: "#3f3f3f" },
  { id: "ivory-cotton", label: "Ivory Cotton", swatch: "#f4f0e8" },
];

const FINISH_PRESETS: ProductOptionDraft[] = [
  { id: "warm-oak", label: "Warm Oak", swatch: "#b8956f" },
  { id: "walnut", label: "Walnut", swatch: "#5c4033" },
  { id: "brushed-brass", label: "Brushed Brass", swatch: "#c6a15b" },
  { id: "matte-black", label: "Matte Black", swatch: "#1c1c1c" },
  { id: "natural-teak", label: "Natural Teak", swatch: "#a87c4f" },
  { id: "polished-chrome", label: "Polished Chrome", swatch: "#c9cdd1" },
];

const SIZE_PRESETS: ProductOptionDraft[] = [
  { id: "standard", label: "Standard" },
  { id: "extended", label: "Extended" },
  { id: "queen", label: "Queen" },
  { id: "king", label: "King" },
  { id: "small", label: "Small" },
  { id: "large", label: "Large" },
];

function OptionEditor({
  kind,
  title,
  options,
  presets,
  onChange,
}: {
  kind: OptionKind;
  title: string;
  options: ProductOptionDraft[];
  presets: ProductOptionDraft[];
  onChange: (value: ProductOptionDraft[]) => void;
}) {
  const [presetId, setPresetId] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [swatch, setSwatch] = useState("#d8cdbf");

  const availablePresets = presets.filter(
    (preset) =>
      !options.some(
        (option) =>
          option.id === preset.id ||
          option.label.toLowerCase() === preset.label.toLowerCase()
      )
  );

  const alreadyHas = (id: string, label: string) =>
    options.some(
      (option) =>
        option.id === id || option.label.toLowerCase() === label.toLowerCase()
    );

  const addOption = (next: ProductOptionDraft) => {
    const cleanLabel = next.label.trim();
    if (!cleanLabel) {
      return;
    }

    const id = next.id || slugify(cleanLabel) || `${kind}-${crypto.randomUUID()}`;
    if (alreadyHas(id, cleanLabel)) {
      return;
    }

    onChange([
      ...options,
      {
        id,
        label: cleanLabel,
        ...(kind === "size" ? {} : { swatch: next.swatch || swatch }),
      },
    ]);
  };

  const addPreset = () => {
    const preset = availablePresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    addOption(preset);
    setPresetId("");
  };

  const addCustom = () => {
    if (!customLabel.trim()) {
      return;
    }
    addOption({
      id: slugify(customLabel),
      label: customLabel.trim(),
      swatch: kind === "size" ? undefined : swatch,
    });
    setCustomLabel("");
  };

  return (
    <section className={`apo-editor apo-editor--${kind}`}>
      <header className="apo-editor-head">
        <h3 className="apo-editor-title">{title}</h3>
        <span className="apo-editor-count">
          {options.length === 0 ? "None added" : `${options.length} added`}
        </span>
      </header>

      <div className="apo-row">
        <select
          className="apo-select"
          value={presetId}
          onChange={(event) => setPresetId(event.target.value)}
          aria-label={`Choose ${title} preset`}
        >
          <option value="">Choose preset…</option>
          {availablePresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="apo-btn"
          disabled={!presetId}
          onClick={addPreset}
        >
          Add preset
        </button>
      </div>

      <div className="apo-row apo-row--custom">
        <input
          className="apo-input"
          value={customLabel}
          onChange={(event) => setCustomLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder={`Or type custom ${kind}`}
        />
        {kind !== "size" ? (
          <input
            className="apo-color"
            type="color"
            value={swatch}
            onChange={(event) => setSwatch(event.target.value)}
            title="Swatch color"
            aria-label={`${title} swatch`}
          />
        ) : null}
        <button
          type="button"
          className="apo-btn apo-btn--primary"
          disabled={!customLabel.trim()}
          onClick={addCustom}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {options.length > 0 ? (
        <ul className="apo-selected">
          {options.map((option, index) => (
            <li key={`${option.id}-${index}`} className="apo-chip">
              {option.swatch ? (
                <span
                  className="apo-swatch"
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden="true"
                />
              ) : (
                <span className="apo-swatch apo-swatch--empty" aria-hidden="true" />
              )}
              <span className="apo-chip-label">{option.label}</span>
              <button
                type="button"
                className="apo-chip-remove"
                onClick={() => onChange(options.filter((_, i) => i !== index))}
                aria-label={`Remove ${option.label}`}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="apo-empty">Pick a preset or write your own option.</p>
      )}
    </section>
  );
}

export function AdminProductOptions({
  fabrics,
  finishes,
  sizes,
  onFabricsChange,
  onFinishesChange,
  onSizesChange,
}: AdminProductOptionsProps) {
  return (
    <div className="apo">
      <div className="apo-header">
        <h2 className="apo-title">Variants</h2>
        <p className="apo-copy">
          Choose from presets or type custom fabric, finish, and size options.
        </p>
      </div>

      <div className="apo-grid">
        <OptionEditor
          kind="fabric"
          title="Fabric"
          options={fabrics}
          presets={FABRIC_PRESETS}
          onChange={onFabricsChange}
        />
        <OptionEditor
          kind="finish"
          title="Finish"
          options={finishes}
          presets={FINISH_PRESETS}
          onChange={onFinishesChange}
        />
        <OptionEditor
          kind="size"
          title="Size"
          options={sizes}
          presets={SIZE_PRESETS}
          onChange={onSizesChange}
        />
      </div>
    </div>
  );
}
