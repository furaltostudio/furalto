/**
 * Deterministic studio consultant brief when Gemini is unavailable.
 */
const catalog = require("../data/custom-furniture");

const WOOD_NOTES = {
  oak: "European oak brings warmth without overpowering cream upholstery.",
  walnut: "Walnut adds quiet depth — keep textiles soft so the grain stays the hero.",
  teak: "Teak holds up well in humid Indian climates and ages with a honeyed patina.",
  ash: "Ash keeps the silhouette light and airy for contemporary rooms.",
};

const FABRIC_NOTES = {
  linen: "Belgian linen is breathable for everyday luxury seating.",
  velvet: "Velvet gives colour depth; keep it away from harsh direct sun where possible.",
  boucle: "Cream bouclé is signature Furalto texture for cloud and curve silhouettes.",
  performance: "Performance weave balances beauty with family and hospitality use.",
  leather: "Full-grain leather develops richer patina with simple, consistent care.",
};

const FINISH_NOTES = {
  natural: "Natural oil keeps timber tactile and honest under the hand.",
  matte: "Matte lacquer softens glare in bright Indian daylight.",
  stained: "Custom stain can be tuned to floors, walls, and metals.",
  metal: "Champagne metal accents read tailored — match nearby hardware.",
};

const SIZE_NOTES = {
  standard: "Catalogue scale suits most rooms without dominating circulation.",
  large: "Expanded scale feels generous in open plans — confirm doorway clearances.",
  bespoke: "Exact room fit needs measured drawings before production lock.",
};

const ALTERNATES = {
  "cloud-curve": ["arc-lounge", "embrace-set"],
  "arc-lounge": ["cloud-curve", "modular-block"],
  "modular-block": ["linear-channel", "cloud-curve"],
  "linear-channel": ["modular-block", "arc-lounge"],
  "embrace-set": ["cloud-curve", "arc-lounge"],
  "softline-channel": ["panel-frame", "softedge-arc"],
  "panel-frame": ["softline-channel", "grid-block"],
  "softedge-arc": ["softline-channel", "panel-frame"],
  "grid-block": ["panel-frame", "softline-channel"],
};

const REASONS = {
  "cloud-curve": "Softer organic presence for calm living rooms.",
  "arc-lounge": "Stronger crescent line for open or statement lounges.",
  "modular-block": "More rearrangeable for evolving layouts.",
  "linear-channel": "Cleaner architectural line for formal living.",
  "embrace-set": "Adds matching chairs for conversation seating.",
  "softline-channel": "Taller channel headboard for tailored bedrooms.",
  "panel-frame": "Wider framed presence with architectural depth.",
  "softedge-arc": "Softer rounded profile for quiet modern rooms.",
  "grid-block": "Graphic grid/block presence for bold bedrooms.",
};

const buildStudioBrief = ({ configuration, roomNotes = "", city = "" }) => {
  const family = configuration.pieceFamily || "sofa";
  const pieceId = configuration.pieceId;
  const validIds = new Set(
    catalog.pieces.filter((piece) => piece.family === family).map((piece) => piece.id)
  );

  const altIds = (ALTERNATES[pieceId] || [])
    .filter((id) => validIds.has(id) && id !== pieceId)
    .slice(0, 2);

  const roomHint = [city, roomNotes].filter(Boolean).join(" — ");
  const roomFit = roomHint
    ? `For ${roomHint}: keep circulation clear and confirm wall length before locking ${configuration.sizeLabel.toLowerCase()} scale.`
    : SIZE_NOTES[configuration.sizeId] ||
      "Share room dimensions so we can validate scale before production.";

  const pairing = [
    FABRIC_NOTES[configuration.fabricId] || "Your upholstery sets daily comfort and character.",
    WOOD_NOTES[configuration.woodId] || "Your timber choice anchors the composition.",
    FINISH_NOTES[configuration.finishId] || "Finish ties timber and metal accents together.",
  ];

  const summary = [
    `Your ${configuration.pieceLabel} in ${configuration.fabricLabel} with ${configuration.woodLabel} reads as quiet Furalto luxury.`,
    roomFit,
    "Final pricing and lead time are confirmed in a design consultation.",
  ].join(" ");

  return {
    headline: `${configuration.pieceLabel} · studio reading`,
    summary,
    pairing,
    roomFit,
    care:
      configuration.fabricId === "boucle" || configuration.fabricId === "velvet"
        ? "Brush lightly and rotate cushions; avoid harsh vacuum heads on textured weaves."
        : "Wipe timber with a dry soft cloth; treat spills on fabric promptly with a clean damp cloth.",
    fabricTip:
      configuration.fabricId === "linen"
        ? "Consider bouclé if you want more sculptural texture on curve silhouettes."
        : null,
    finishTip:
      configuration.finishId === "natural"
        ? "Champagne metal accents lift cream upholstery without adding visual weight."
        : null,
    alternates: altIds.map((id) => ({
      pieceId: id,
      reason: REASONS[id] || "A strong alternate from the same Furalto family.",
    })),
  };
};

const briefToAdviceText = (brief) =>
  [brief.summary, brief.pairing.join(" "), brief.care]
    .filter(Boolean)
    .join(" ");

const buildStudioAdvice = (args) => briefToAdviceText(buildStudioBrief(args));

module.exports = {
  buildStudioAdvice,
  buildStudioBrief,
  briefToAdviceText,
};
