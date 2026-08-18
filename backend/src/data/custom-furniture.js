/**
 * Bespoke studio catalogue — silhouettes mapped from live Furalto sofa/bed families.
 * Base prices mirror catalogue selling prices; material/size add-ons build the made-to-order estimate.
 * Estimate = (base + wood + fabric + finish) * sizeMultiplier
 */
const customFurnitureCatalog = {
  currency: "INR",
  leadTimeNote: "Made-to-order pieces typically take 6–10 weeks from confirmation.",
  disclaimer:
    "Indicative studio estimate only. Final pricing is confirmed after design consultation and material review.",
  intents: [
    {
      id: "sofa",
      label: "Sofa / Lounge",
      description: "Curve, modular, and linear seating tailored to your room.",
    },
    {
      id: "bed",
      label: "Bed",
      description: "Upholstered headboards and platforms in custom scale.",
    },
  ],
  pieces: [
    {
      id: "cloud-curve",
      family: "sofa",
      label: "Cloud Curve",
      description: "Soft organic modular seating — bouclé-friendly, low cloud profile.",
      inspiredBy: ["Cloud Curve Sofa", "Luna Cloud Curve", "Aura Veil", "Cloud Wave"],
      // Catalogue sofas in this family sell from ₹90,000
      basePrice: 90000,
    },
    {
      id: "arc-lounge",
      family: "sofa",
      label: "Arc Lounge",
      description: "Crescent and kidney silhouettes for rooftop and lobby-scale rooms.",
      inspiredBy: ["Lunara Arc Sofa", "Serene Curve Sofa", "Flowline Sofa", "Arcé Curve"],
      // Serene Curve / Lunara Arc catalogue: ₹1,20,000
      basePrice: 120000,
    },
    {
      id: "modular-block",
      family: "sofa",
      label: "Modular Block",
      description: "Low track-arm modules — rearrange for living, lounge, or open plans.",
      inspiredBy: ["Milano Modular", "Linea Lounge Modular", "Mono Block", "Verona Lounge"],
      basePrice: 120000,
    },
    {
      id: "linear-channel",
      family: "sofa",
      label: "Linear Channel",
      description: "Architectural seating with channel detail and clean horizontal lines.",
      inspiredBy: ["Linear Luxe Sofa", "Nova Lounge Sofa", "Urban Loft Sofa"],
      basePrice: 90000,
    },
    {
      id: "embrace-set",
      family: "sofa",
      label: "Embrace Lounge Set",
      description: "Curved sofa with matching round chairs — conversation-ready composition.",
      inspiredBy: ["Cloud Embrace Lounge Set"],
      // Cloud Embrace Lounge Set catalogue: ₹2,00,000
      basePrice: 200000,
    },
    {
      id: "softline-channel",
      family: "bed",
      label: "Softline Channel",
      description: "Tall vertical-channel headboard — calm, tailored bedroom presence.",
      inspiredBy: ["Aura Softline Bed", "Novara Panel Bed", "Aurelle Bed"],
      // Most Furalto beds catalogue: ₹65,000
      basePrice: 65000,
    },
    {
      id: "panel-frame",
      family: "bed",
      label: "Panel Frame",
      description: "Wide framed or layered panel headboards with architectural depth.",
      inspiredBy: ["Aurelio Panel Bed", "Aurelia Frame Bed", "Velora Layer Bed"],
      // Aurelio Panel / Velora Layer catalogue: ₹75,000
      basePrice: 75000,
    },
    {
      id: "softedge-arc",
      family: "bed",
      label: "Softedge Arc",
      description: "Rounded soft-edge and orbit silhouettes for quiet, modern rooms.",
      inspiredBy: ["Verda Softedge Bed", "Luna Orbit Bed", "Aurum Soft Edge Bed"],
      // Soft-edge / orbit beds catalogue: ₹75,000
      basePrice: 75000,
    },
    {
      id: "grid-block",
      family: "bed",
      label: "Grid & Block",
      description: "Grid-tufted or solid block platforms with strong graphic presence.",
      inspiredBy: ["GridLounge Bed", "Aeris Bed", "Terra Block Bed", "Obsidian Block Bed"],
      // GridLounge Bed catalogue: ₹95,000
      basePrice: 95000,
    },
  ],
  woods: [
    {
      id: "oak",
      label: "European Oak",
      description: "Warm grain for plinths, legs, and exposed frames.",
      priceAdd: 0,
    },
    {
      id: "walnut",
      label: "American Walnut",
      description: "Deep chocolate tone — pairs with cream and champagne upholstery.",
      priceAdd: 12000,
    },
    {
      id: "teak",
      label: "Teak",
      description: "Naturally durable for humid Indian climates.",
      priceAdd: 15000,
    },
    {
      id: "ash",
      label: "Ash",
      description: "Light open grain for airy contemporary rooms.",
      priceAdd: 6000,
    },
  ],
  fabrics: [
    {
      id: "linen",
      label: "Belgian Linen",
      description: "Breathable everyday luxury — soft cream living.",
      priceAdd: 0,
    },
    {
      id: "boucle",
      label: "Cream Bouclé",
      description: "Signature Furalto texture for cloud and curve silhouettes.",
      priceAdd: 12000,
    },
    {
      id: "velvet",
      label: "Cotton Velvet",
      description: "Colour depth and soft hand for statement lounges.",
      priceAdd: 10000,
    },
    {
      id: "performance",
      label: "Performance Weave",
      description: "Stain-resistant weave for family and hospitality use.",
      priceAdd: 8000,
    },
    {
      id: "leather",
      label: "Full-Grain Leather",
      description: "Patina that deepens — for arms, accents, or full covers.",
      priceAdd: 28000,
    },
  ],
  finishes: [
    {
      id: "natural",
      label: "Natural Oil",
      description: "Open-pore timber that stays tactile.",
      priceAdd: 0,
    },
    {
      id: "matte",
      label: "Matte Lacquer",
      description: "Soft sheen for bright Indian daylight.",
      priceAdd: 4000,
    },
    {
      id: "stained",
      label: "Custom Stain",
      description: "Matched to your floors, walls, and metals.",
      priceAdd: 8000,
    },
    {
      id: "metal",
      label: "Champagne Metal",
      description: "Brass / champagne hardware and plinth accents.",
      priceAdd: 10000,
    },
  ],
  sizes: [
    {
      id: "standard",
      label: "Catalogue Scale",
      description: "Proportions aligned to our live collection standards.",
      multiplier: 1,
    },
    {
      id: "large",
      label: "Expanded Scale",
      description: "Generous depth or length for open living rooms.",
      multiplier: 1.15,
    },
    {
      id: "bespoke",
      label: "Exact Room Fit",
      description: "Made to your measured footprint and clearances.",
      multiplier: 1.28,
    },
  ],
};

module.exports = customFurnitureCatalog;
