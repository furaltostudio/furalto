"use client";

import { Plus, Trash2 } from "lucide-react";

export type ProductSpecDraft = {
  label: string;
  value: string;
};

type AdminProductCatalogProps = {
  specs: ProductSpecDraft[];
  details: string[];
  rooms: string[];
  relatedSlugs: string[];
  onSpecsChange: (value: ProductSpecDraft[]) => void;
  onDetailsChange: (value: string[]) => void;
  onRoomsChange: (value: string[]) => void;
  onRelatedSlugsChange: (value: string[]) => void;
};

const ROOM_PRESETS = [
  { id: "bedroom", label: "Bedroom" },
  { id: "living", label: "Living" },
  { id: "dining", label: "Dining" },
  { id: "office", label: "Office" },
  { id: "lounge", label: "Lounge" },
];

export function AdminProductCatalog({
  specs,
  details,
  rooms,
  relatedSlugs,
  onSpecsChange,
  onDetailsChange,
  onRoomsChange,
  onRelatedSlugsChange,
}: AdminProductCatalogProps) {
  const updateSpec = (index: number, patch: Partial<ProductSpecDraft>) => {
    onSpecsChange(specs.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)));
  };

  const relatedText = relatedSlugs.join(", ");

  return (
    <div className="admin-catalog">
      <div className="admin-catalog-block">
        <div className="admin-gallery-title-row">
          <span className="admin-label">Specs &amp; dimensions</span>
          <button
            type="button"
            className="admin-button"
            onClick={() => onSpecsChange([...specs, { label: "", value: "" }])}
          >
            <Plus size={14} />
            Add row
          </button>
        </div>
        <p className="admin-gallery-hint">
          Used by Craft &amp; Dimensions and the Size guide (needs Headboard Height / Overall Height).
        </p>
        {specs.length === 0 ? (
          <p className="admin-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
            No specs yet.
          </p>
        ) : (
          <ul className="admin-catalog-rows">
            {specs.map((spec, index) => (
              <li key={`spec-${index}`} className="admin-catalog-row">
                <input
                  className="admin-input"
                  value={spec.label}
                  placeholder="Label (e.g. Headboard Height)"
                  onChange={(event) => updateSpec(index, { label: event.target.value })}
                />
                <input
                  className="admin-input"
                  value={spec.value}
                  placeholder="Value (e.g. 1000 mm)"
                  onChange={(event) => updateSpec(index, { value: event.target.value })}
                />
                <button
                  type="button"
                  className="admin-gallery-icon-btn is-danger"
                  onClick={() => onSpecsChange(specs.filter((_, i) => i !== index))}
                  aria-label={`Remove spec ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-catalog-block">
        <div className="admin-gallery-title-row">
          <span className="admin-label">Design details</span>
          <button
            type="button"
            className="admin-button"
            onClick={() => onDetailsChange([...details, ""])}
          >
            <Plus size={14} />
            Add line
          </button>
        </div>
        <p className="admin-gallery-hint">Bullet points shown under Craft &amp; Dimensions.</p>
        {details.length === 0 ? (
          <p className="admin-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
            No detail lines yet.
          </p>
        ) : (
          <ul className="admin-catalog-rows">
            {details.map((line, index) => (
              <li key={`detail-${index}`} className="admin-catalog-row is-single">
                <input
                  className="admin-input"
                  value={line}
                  placeholder="Detail line"
                  onChange={(event) =>
                    onDetailsChange(
                      details.map((item, i) => (i === index ? event.target.value : item))
                    )
                  }
                />
                <button
                  type="button"
                  className="admin-gallery-icon-btn is-danger"
                  onClick={() => onDetailsChange(details.filter((_, i) => i !== index))}
                  aria-label={`Remove detail ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-catalog-block">
        <span className="admin-label">Rooms</span>
        <p className="admin-gallery-hint">Used for filters and related-product matching.</p>
        <div className="admin-catalog-chips">
          {ROOM_PRESETS.map((room) => {
            const active = rooms.includes(room.id);
            return (
              <button
                key={room.id}
                type="button"
                className={`admin-catalog-chip${active ? " is-active" : ""}`}
                onClick={() =>
                  onRoomsChange(
                    active ? rooms.filter((item) => item !== room.id) : [...rooms, room.id]
                  )
                }
              >
                {room.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-catalog-block">
        <label className="admin-field" style={{ margin: 0 }}>
          <span className="admin-label">Related product slugs</span>
          <p className="admin-gallery-hint">Comma-separated product slugs for the related strip.</p>
          <textarea
            className="admin-textarea"
            rows={2}
            value={relatedText}
            placeholder="aeris-bed, terra-block-bed"
            onChange={(event) =>
              onRelatedSlugsChange(
                event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              )
            }
          />
        </label>
      </div>
    </div>
  );
}
