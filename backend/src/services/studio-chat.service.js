/**
 * Site-wide Furalto assistant knowledge + deterministic fallbacks.
 */
const Product = require("../models/Product.model");
const catalog = require("../data/custom-furniture");

const SITE_FACTS = {
  brand: "Furalto",
  tagline: "Crafted with heart. Built on legacy.",
  since: "1979",
  story:
    "Furalto continues a craft begun in 1979 by Late Ramchandar, a master carpenter who led 100+ craftsmen. Founder Gayatri created the brand as a tribute — transforming true Indian craftsmanship into designer furniture for modern homes.",
  purpose:
    "To transform true Indian craftsmanship into designer furniture that elevates modern living.",
  gst: "Prices on the site include 18% GST unless noted otherwise.",
  delivery: "White-glove delivery is available at checkout for eligible orders.",
  showroom: {
    name: "Rohini Design Studio",
    city: "New Delhi",
    address:
      "Office No. 103–104, First Floor, Pocket 5, Sector 24, Rohini, New Delhi 110085",
    hours: "Monday – Saturday · 9am – 7pm IST",
    phone: "+91 93114 87655",
    email: "furaltostudio@gmail.com",
  },
  pages: [
    { path: "/blog", about: "Furalto journal — craft notes and buying guides" },
    { path: "/about", about: "Our legacy — Ramchandar’s workshop, Gayatri’s founding vision" },
    { path: "/collections", about: "Shop all collections" },
    { path: "/collections/sofas", about: "Sofas & lounge seating" },
    { path: "/collections/beds", about: "Beds & bedroom" },
    { path: "/collections/chairs", about: "Chairs" },
    { path: "/collections/dining", about: "Dining sets" },
    { path: "/custom", about: "Bespoke Studio — configure made-to-order sofas and beds" },
    { path: "/showrooms", about: "Visit Rohini Design Studio" },
    { path: "/appointments", about: "Book in-showroom or virtual consultation" },
    { path: "/trade-program", about: "Trade programme for designers & architects" },
    { path: "/track-order", about: "Track an order" },
    { path: "/contact", about: "Contact the studio" },
    { path: "/wishlist", about: "Saved pieces" },
    { path: "/cart", about: "Shopping cart & checkout" },
  ],
};

const CATEGORY_HINTS = [
  {
    re: /\b(bed|beds|bedroom|headboard|mattress)\b|बेड|बिस्तर|पलंग/i,
    category: "beds",
    label: "beds",
    labelHi: "बेड",
    href: "/collections/beds",
  },
  {
    re: /\b(sofa|sofas|couch|lounge|sectional)\b|सोफा/i,
    category: "sofas",
    label: "sofas",
    labelHi: "सोफा",
    href: "/collections/sofas",
  },
  {
    re: /\b(chair|chairs|armchair)\b|कुर्सी|चेयर/i,
    category: "chairs",
    label: "chairs",
    labelHi: "चेयर",
    href: "/collections/chairs",
  },
  {
    re: /\b(dining|table|tables)\b|डाइनिंग|मेज़|मेज/i,
    category: "dining",
    label: "dining",
    labelHi: "डाइनिंग",
    href: "/collections/dining",
  },
  {
    re: /\b(light|lighting|pendant|lamp)\b|लाइट|लैंप/i,
    category: "pendants",
    label: "lighting",
    labelHi: "लाइटिंग",
    href: "/collections/pendants",
  },
  {
    re: /\b(desk|office)\b|डेस्क|ऑफिस/i,
    category: "desks",
    label: "desks",
    labelHi: "डेस्क",
    href: "/collections/desks",
  },
  {
    re: /\b(rug|rugs)\b|रग|कार्पेट/i,
    category: "rugs",
    label: "rugs",
    labelHi: "रग्स",
    href: "/collections/rugs",
  },
];

const normalize = (text) => String(text || "").toLowerCase();

const formatInr = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

/** Reply script: Devanagari → Hindi; everything else (incl. Hinglish roman) → English. */
const detectReplyLanguage = (message) => {
  const text = String(message || "");
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
};

const buildSiteKnowledgeBlock = () => {
  const s = SITE_FACTS.showroom;
  return [
    `Brand: ${SITE_FACTS.brand}. ${SITE_FACTS.tagline} Since ${SITE_FACTS.since}.`,
    SITE_FACTS.gst,
    SITE_FACTS.delivery,
    `Showroom: ${s.name}, ${s.city}. ${s.address}. Hours: ${s.hours}. Phone: ${s.phone}. Email: ${s.email}.`,
    `Key pages: ${SITE_FACTS.pages.map((p) => `${p.path} (${p.about})`).join("; ")}.`,
    `Bespoke lead time: ${catalog.leadTimeNote}`,
    `Bespoke disclaimer: ${catalog.disclaimer}`,
  ].join("\n");
};

const detectCategoryHint = (message) =>
  CATEGORY_HINTS.find((item) => item.re.test(message)) || null;

const toProductCards = (products) =>
  (products || []).map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
    href: `/products/${p.slug}`,
    label: `${p.name} — ${formatInr(p.price)}`,
    blurb: String(p.description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 110),
  }));

const isCompareIntent = (message) =>
  /\b(compare|comparison|vs\.?|versus|difference|differ|better|which one|kaunsa|konsa|dono)\b|तुलना|फर्क|कौन\s*सा|कौनसा|बेहतर/i.test(
    message
  );

/** User is asking about one named product / why buy it. */
const isFocusedProductAsk = (message) =>
  /\b(about (this|the|it)|bare\s*me|baare\s*me|details|tell me more|or btao|aur batao|kyu|kyun|why (should i )?buy|yehi|this product|is product|that product|lbuy|buy karna|worth (it|buying)|le\s*lu|lena chahiye|recommend this)\b|क्यों\s*खरीद|के\s*बारे|यह\s*वाले|इसे\s*क्यों/i.test(
    message
  );

const PRODUCT_STOP = new Set([
  "the",
  "and",
  "for",
  "best",
  "want",
  "please",
  "suggest",
  "with",
  "from",
  "that",
  "this",
  "have",
  "need",
  "mujhe",
  "muje",
  "chahiye",
  "chaiye",
  "batao",
  "btao",
  "dikhao",
  "karo",
  "karna",
  "compare",
  "comparison",
  "versus",
  "which",
  "kaunsa",
  "konsa",
  "dono",
  "difference",
  "better",
  "about",
  "bare",
  "baare",
  "product",
  "products",
  "more",
  "tell",
  "should",
  "buy",
  "lbuy",
  "why",
  "kyu",
  "kyun",
  "yehi",
  "yeah",
  "or",
  // delivery / timing chatter — must not match product names (e.g. "mil" → Milano)
  "delivery",
  "deliver",
  "dispatch",
  "shipping",
  "arrive",
  "reach",
  "kitne",
  "kitna",
  "dino",
  "dinon",
  "days",
  "day",
  "time",
  "timeline",
  "mil",
  "milegi",
  "milengi",
  "jati",
  "jata",
  "jayegi",
  "jayega",
  "ayega",
  "aayega",
  "ayegi",
  "aayegi",
  "kab",
  "hai",
  "hoga",
  "hogi",
  "lagega",
  "working",
]);

const extractSearchWords = (message) =>
  normalize(message)
    .replace(/[\u0900-\u097F]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !PRODUCT_STOP.has(w))
    .slice(0, 10);

const scoreProductAgainstWords = (product, words) => {
  const n = normalize(product.name);
  const slug = normalize(product.slug).replace(/-/g, " ");
  const nameTokens = n.split(/\s+/).filter((t) => t.length > 2);
  const slugTokens = slug.split(/\s+/).filter((t) => t.length > 2);
  let score = 0;
  for (const w of words) {
    // Short tokens must match a whole name/slug word (avoid "mil" → Milano).
    if (w.length <= 3) {
      if (nameTokens.includes(w) || slugTokens.includes(w)) score += 2;
      continue;
    }
    if (n.includes(w)) score += w.length >= 5 ? 4 : 3;
    else if (slug.includes(w)) score += 2;
  }
  const hit = nameTokens.filter((t) => words.includes(t)).length;
  if (nameTokens.length && hit >= Math.min(2, nameTokens.length)) {
    score += 5 + hit;
  }
  return score;
};

/** True when the current message names a catalogue piece (or clearly refers to “this/ye”). */
const messageNamesProduct = (message, products = []) => {
  const q = normalize(message);
  if (!q.trim()) return false;
  if (/\b(ye|yeh|yahi|yehi|this|it|uska|uski|usko|mere ye|wali|wale)\b/i.test(q)) {
    return Boolean(products[0]);
  }
  for (const p of products) {
    const tokens = normalize(p.name)
      .split(/\s+/)
      .filter((t) => t.length > 3 && !PRODUCT_STOP.has(t));
    const hits = tokens.filter((t) => q.includes(t));
    if (hits.some((t) => t.length >= 5) || hits.length >= 2) return true;
    const slugBits = normalize(p.slug)
      .replace(/-/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 4);
    if (slugBits.some((t) => q.includes(t))) return true;
  }
  return false;
};

const findNamedProducts = async (words, limit = 8) => {
  if (!words.length) return [];
  const named = await Product.find({
    isActive: true,
    $or: words.map((w) => ({
      $or: [
        { name: { $regex: w, $options: "i" } },
        { slug: { $regex: w, $options: "i" } },
      ],
    })),
  })
    .select("name slug category price description details averageRating soldCount")
    .limit(20)
    .lean();

  return named
    .map((p) => ({ p, score: scoreProductAgainstWords(p, words) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || (b.p.soldCount || 0) - (a.p.soldCount || 0))
    .slice(0, limit)
    .map((row) => row.p);
};

const findRelevantProducts = async (message, { historyText = "" } = {}) => {
  const hint = detectCategoryHint(message);
  const compare = isCompareIntent(message);
  const focused = isFocusedProductAsk(message);
  const deliveryAsk = isDeliveryAsk(message);
  const refersPrior =
    /\b(ye|yeh|yahi|yehi|this|it|uska|uski|usko|mere ye|wali|wale)\b/i.test(message);
  // Delivery / timing: only search the current message unless they say “this/ye”.
  const searchBlob =
    deliveryAsk && !refersPrior ? message : `${message} ${historyText}`;
  const words = extractSearchWords(searchBlob);

  try {
    const named = await findNamedProducts(words, compare ? 6 : 8);

    if (deliveryAsk) {
      const strong = named.filter((p) => scoreProductAgainstWords(p, words) >= 6);
      if (strong.length && messageNamesProduct(message, strong)) {
        return strong.slice(0, 1);
      }
      if (refersPrior && named.length) {
        return named.slice(0, 1);
      }
      // General delivery question — no product guess.
      return [];
    }

    if (focused && named.length) {
      const top = named[0];
      const related = named
        .filter((p) => p.slug !== top.slug && p.category === top.category)
        .slice(0, 1);
      return [top, ...related];
    }

    if (compare && named.length >= 2) {
      return named.slice(0, 3);
    }

    if (named.length && scoreProductAgainstWords(named[0], words) >= 6) {
      return named.slice(0, 3);
    }

    const filter = { isActive: true };
    if (hint) {
      filter.category = hint.category;
    } else if (words.length) {
      filter.$or = [
        { name: { $regex: words.join("|"), $options: "i" } },
        { description: { $regex: words.slice(0, 3).join("|"), $options: "i" } },
        { category: { $regex: words.join("|"), $options: "i" } },
      ];
    } else if (named.length) {
      return named.slice(0, 4);
    } else {
      return [];
    }

    const browse = await Product.find(filter)
      .select("name slug category price description details averageRating soldCount")
      .sort({ soldCount: -1, averageRating: -1 })
      .limit(compare ? 3 : 4)
      .lean();

    if (named[0] && !browse.some((p) => p.slug === named[0].slug)) {
      return [named[0], ...browse].slice(0, 4);
    }
    return browse;
  } catch {
    return [];
  }
};

const softBenefit = (product, hi) => {
  const name = normalize(product.name);
  const text = `${product.description || ""} ${(product.details || []).join(" ")}`.toLowerCase();

  if (/orbit|luna orbit/.test(name)) {
    return hi
      ? "sculptural headboard presence — statement bedroom के लिए बहुत strong"
      : "sculptural headboard presence that makes the bedroom feel intentional";
  }
  if (/nova|radiant/.test(name)) {
    return hi
      ? "geometric radial headboard + channel tufting — modern bedroom में architectural statement"
      : "a geometric radial headboard with channel tufting — architectural presence for a modern bedroom";
  }
  if (/aurelia|frame/.test(name)) {
    return hi
      ? "clean frame silhouette — modern rooms में neat और timeless बैठता है"
      : "a clean frame silhouette that stays neat and timeless in modern rooms";
  }
  if (/softline|aura soft/.test(name)) {
    return hi
      ? "upholstered softline comfort — cosy, calm sleeping corners के लिए"
      : "upholstered softline comfort made for cosy, calm sleeping corners";
  }
  if (/cloud|curve|chaise/.test(name) || /boucle|cloud|soft|curve/.test(text)) {
    return hi
      ? "नरम, शांत cloud-like presence — रोज के luxury के लिए balanced"
      : "a soft, cloud-like presence that still feels quietly luxurious day to day";
  }
  if (/shell|panel|grid|linear|channel|nova/.test(name) || /frame|panel|grid|linear/.test(text)) {
    return hi
      ? "साफ़ architectural line — tailored modern look"
      : "a clean architectural line that looks tailored in modern rooms";
  }
  if (/modular|section/.test(text)) {
    return hi
      ? "layout के साथ flex करता है — घर बदलने पर भी सही रहता है"
      : "flexible with your layout as the home evolves";
  }
  return hi
    ? "Furalto quiet-luxury finish quality के साथ easy styling"
    : "easy to style with Furalto’s quiet-luxury material language";
};

const pieceLabel = (hint, hi) => {
  if (!hint) return "piece";
  const singular = {
    beds: "bed",
    sofas: "sofa",
    chairs: "chair",
    dining: "dining set",
    pendants: "light",
    desks: "desk",
    rugs: "rug",
  };
  if (hi) return hint.labelHi || singular[hint.category] || hint.label;
  return singular[hint.category] || hint.label.replace(/s$/, "");
};

/** Markdown links so the chat UI can make them clickable. */
const formatProductLines = (products) =>
  toProductCards(products).map((p) => `- [${p.name} — ${formatInr(p.price)}](${p.href})`);

const buildSalesBriefs = (products, lang = "en") => {
  const hi = lang === "hi";
  return (products || []).map((p, index) => {
    const link = `[${p.name} — ${formatInr(p.price)}](/products/${p.slug})`;
    const blurb = String(p.description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140);
    const benefit = softBenefit(p, hi);
    if (hi) {
      return `${index + 1}. ${link}\n   क्यों लेना चाहिए: ${benefit}.${blurb ? ` ${blurb}` : ""} GST inclusive pricing · white-glove delivery checkout पर।`;
    }
    return `${index + 1}. ${link}\n   Why it wins: ${benefit}.${blurb ? ` ${blurb}` : ""} GST-inclusive pricing with white-glove delivery at checkout.`;
  });
};

const buildFocusedProductPitch = (product, { hi }) => {
  if (!product) return null;
  const link = `[${product.name} — ${formatInr(product.price)}](/products/${product.slug})`;
  const blurb = String(product.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=\.)\s+/)[0]
    .slice(0, 220);
  const highlights = (product.details || [])
    .filter(
      (d) =>
        !/^care:/i.test(d) &&
        !/packaging|dispatch|delivered|vacuum|spill|sunlight|bleach|indoor use/i.test(d)
    )
    .slice(0, 4);

  if (hi) {
    return [
      `${link} — बिलकुल इसी piece की बात करते हैं।`,
      blurb ? `ये क्या है: ${blurb}` : null,
      `आपको ये क्यों लेना चाहिए: ${softBenefit(product, true)}.`,
      highlights.length ? `खास बातें:\n${highlights.map((h) => `• ${h}`).join("\n")}` : null,
      `Price ${formatInr(product.price)} (GST inclusive). White-glove delivery checkout पर उपलब्ध।`,
      `अगला कदम: अभी [${product.name}](/products/${product.slug}) खोलें, wishlist/cart में रखें, या finishes छूने [/appointments](/appointments) बुक करें।`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Let’s talk specifically about ${link}.`,
    blurb ? `What it is: ${blurb}` : null,
    `Why you should buy this one: ${softBenefit(product, false)}.`,
    highlights.length
      ? `What makes it worth it:\n${highlights.map((h) => `• ${h}`).join("\n")}`
      : null,
    `Priced at ${formatInr(product.price)} (GST inclusive), with white-glove delivery available at checkout.`,
    `Next step: open [${product.name}](/products/${product.slug}), save it to wishlist/cart, or book [/appointments](/appointments) to feel the finishes in Rohini.`,
  ]
    .filter(Boolean)
    .join("\n");
};

const buildSalesPitch = (products, { hi, hint, compare, focused }) => {
  if (!products?.length) return null;

  if (focused) {
    return buildFocusedProductPitch(products[0], { hi });
  }

  const collectionLink = hint?.href || "/collections";
  const label = hint ? (hi ? hint.labelHi || hint.label : hint.label) : "catalogue";
  const hero = products[0];
  const heroLink = `[${hero.name} — ${formatInr(hero.price)}](/products/${hero.slug})`;
  const heroBenefit = softBenefit(hero, hi);

  if (compare && products.length >= 2) {
    const a = products[0];
    const b = products[1];
    const aLink = `[${a.name} — ${formatInr(a.price)}](/products/${a.slug})`;
    const bLink = `[${b.name} — ${formatInr(b.price)}](/products/${b.slug})`;
    const lines = hi
      ? [
          "दोनों ही Furalto के strong picks हैं — कोई कमज़ोर विकल्प नहीं, बस अलग mood है:",
          `• ${aLink} — ${softBenefit(a, true)}.`,
          `• ${bLink} — ${softBenefit(b, true)}.`,
        ]
      : [
          "Both are strong Furalto picks — not a weak option either way, just different moods:",
          `• ${aLink} — ${softBenefit(a, false)}.`,
          `• ${bLink} — ${softBenefit(b, false)}.`,
        ];

    if (products[2]) {
      const c = products[2];
      const cLink = `[${c.name} — ${formatInr(c.price)}](/products/${c.slug})`;
      lines.push(
        hi
          ? `• ${cLink} — ${softBenefit(c, true)}. Third option अगर और choice चाहिए।`
          : `• ${cLink} — ${softBenefit(c, false)}. A strong third option if you want more choice.`
      );
    }

    lines.push(
      hi
        ? `मेरी सलाह: दोनों links खोलकर photos side-by-side देखें, wishlist में save करें, फिर जो mood दिल को छुए वही लें — या Rohini में [/appointments](/appointments) बुक कर finishes छू के decide करें। और options: [${label}](${collectionLink}).`
        : `My advice: open both links, compare photos side-by-side, save favourites to wishlist, then choose the mood you love — or book [/appointments](/appointments) to decide in Rohini. More options: [${label}](${collectionLink}).`
    );
    return lines.join("\n");
  }

  const alts = products.slice(1, 3);
  const piece = pieceLabel(hint, hi);
  const lines = hi
    ? [
        `अगर आप ऐसा ${piece} चाहते हैं जो quietly premium लगे और घर में सालों तक सही बैठे, तो मैं ${heroLink} से शुरू करने को कहूँगा।`,
        `क्यों: ${heroBenefit}. Price ${formatInr(hero.price)} (GST inclusive) — value भी thoughtful है।`,
      ]
    : [
        `If you want a ${piece} that feels quietly premium and still lives well every day, I’d start with ${heroLink}.`,
        `Why: ${heroBenefit}. At ${formatInr(hero.price)} (GST inclusive), it’s a considered step into Furalto quality.`,
      ];

  if (alts.length) {
    lines.push(hi ? "अगर mood थोड़ा अलग चाहिए:" : "If you want a slightly different mood:");
    for (const alt of alts) {
      const link = `[${alt.name} — ${formatInr(alt.price)}](/products/${alt.slug})`;
      lines.push(
        hi
          ? `• ${link} — ${softBenefit(alt, true)}.`
          : `• ${link} — ${softBenefit(alt, false)}.`
      );
    }
  }

  lines.push(
    hi
      ? `अगला कदम: link खोलें → wishlist/cart में रखें, या finishes देखने [/appointments](/appointments) बुक करें। पूरी range: [${label}](${collectionLink}). Made-to-order हो तो [/custom](/custom).`
      : `Next step: open the link → save to wishlist/cart, or book [/appointments](/appointments) to see finishes. Full range: [${label}](${collectionLink}). Want made-to-order? [/custom](/custom).`
  );

  return lines.join("\n");
};

const buildConfigurationSummary = (configuration, estimateAmount) => {
  if (!configuration) return "";
  const parts = [
    configuration.pieceLabel,
    configuration.fabricLabel,
    configuration.woodLabel,
    configuration.finishLabel,
    configuration.sizeLabel,
  ].filter(Boolean);
  const base = parts.join(" · ");
  if (estimateAmount) {
    return `${base} (indicative ${formatInr(estimateAmount)})`;
  }
  return base;
};

const extractDispatchNote = (product) => {
  if (!product) return null;
  const pool = [
    product.description || "",
    product.packaging || "",
    product.packagingAndDelivery || "",
    ...((product.details || []).map((d) => String(d))),
  ].join("\n");

  // Prefer real timing lines — ignore packaging like "Delivered in 2 pieces".
  const timing =
    pool.match(/dispatch(?:\s*timeline)?\s*:?\s*[^.|\n]{0,80}/i) ||
    pool.match(/\d+\s*[–\-to]+\s*\d+\s*working days[^.|\n]{0,60}/i) ||
    pool.match(/lead time[^.|\n]{0,80}/i);

  if (!timing) return null;
  const note = timing[0].replace(/\s+/g, " ").trim().replace(/[.]+$/, "");
  // Reject packaging-only hits
  if (/delivered in \d+\s*pieces?/i.test(note) && !/working days|dispatch|lead time/i.test(note)) {
    return null;
  }
  return note.slice(0, 220);
};

const isDeliveryAsk = (message) => {
  const q = normalize(message);
  // Catch Hinglish variants: kitne din/dino, ayega/aayega, ghar aa jayega, etc.
  return (
    /kitne\s*din|kitne\s*dino|kitne\s*dinon|kitna\s*time|kitne\s*days|kab\s*aa|kab\s*mil|ghar\s*aa|aa\s*jyega|aa\s*jayega|aa\s*jayegi|ayega|aayega|ayegi|aayegi|deliver|dispatch|shipping|arrive|reach|lead\s*time|timeline|when\s*will|how\s*long|dinon?\s*me|days?\s*(me|mein)|time\s*lagega|kitne\s*time/.test(
      q
    ) || /कितने\s*दिन|कब\s*आ|कब\s*मिल|डिलीवरी|पहुंच|समय\s*लगेगा/.test(message)
  );
};

const buildDeliveryAnswer = (products, { hi }) => {
  const product = products[0];
  const dispatch = extractDispatchNote(product);
  const link = product
    ? `[${product.name} — ${formatInr(product.price)}](/products/${product.slug})`
    : null;

  if (hi) {
    if (product && dispatch) {
      return [
        `${link} के लिए timing अच्छी है — catalogue note: ${dispatch}`,
        `${SITE_FACTS.delivery} Exact slot city/address confirm होने के बाद checkout पर lock होता है।`,
        `Ready हो तो product page खोलकर order आगे बढ़ा सकते हो — या [/appointments](/appointments) पर timing clear कर लो।`,
      ].join("\n");
    }
    return [
      product
        ? `${link} ready stock / standard finishes के लिए usually 10–15 working days में dispatch शुरू हो जाता है (custom finish थोड़ा extra ले सकता है)।`
        : `Standard pieces अक्सर 10–15 working days में dispatch होते हैं; bespoke: ${catalog.leadTimeNote}`,
      `${SITE_FACTS.delivery}`,
      `Order confirm होते ही team clear timeline देगी — [/track-order](/track-order) से status भी देख सकते हो।`,
    ].join("\n");
  }

  if (product && dispatch) {
    return [
      `For ${link}, the catalogue timing is: ${dispatch}`,
      `${SITE_FACTS.delivery} Your exact slot locks in once address and checkout are confirmed.`,
      `If you’re happy with the piece, open the product page and continue — or book [/appointments](/appointments) to finalise timing with the studio.`,
    ].join("\n");
  }

  return [
    product
      ? `For ${link}, standard finishes usually dispatch in about 10–15 working days (custom finishes can take a little longer).`
      : `Most catalogue pieces dispatch in about 10–15 working days; bespoke builds: ${catalog.leadTimeNote}`,
    SITE_FACTS.delivery,
    `Once you order, the studio shares a clear timeline — you can also follow progress on [/track-order](/track-order).`,
  ].join("\n");
};

const answerFromSite = (
  message,
  { configuration, estimateAmount, roomNotes, city, products = [], lang } = {}
) => {
  const replyLang = lang || detectReplyLanguage(message);
  const hi = replyLang === "hi";
  const q = normalize(message);
  const configLine = buildConfigurationSummary(configuration, estimateAmount);
  const hint = detectCategoryHint(message);
  const compare = isCompareIntent(message);
  const focused = isFocusedProductAsk(message);
  const s = SITE_FACTS.showroom;

  // Answer the actual question first (delivery / timing follow-ups)
  if (isDeliveryAsk(message)) {
    return buildDeliveryAnswer(products, { hi });
  }

  if (/showroom|visit|rohini|delhi|store|location|address|map|शोोरूम|शोroom|पता|कहाँ|kahan/.test(q)) {
    return hi
      ? `हमारा showroom: ${s.name}, ${s.city} — ${s.address}. समय: ${s.hours}. कॉल: ${s.phone}. विवरण: [/showrooms](/showrooms). अपॉइंटमेंट: [/appointments](/appointments)।`
      : `Visit ${s.name} in ${s.city}: ${s.address}. Hours ${s.hours}. Call ${s.phone} or see [/showrooms](/showrooms). Book at [/appointments](/appointments).`;
  }

  if (/appoint|consult|book|meeting|अपॉइंटमेंट|अपॉइंट|मुलाकात/.test(q)) {
    return hi
      ? `In-showroom या virtual design session बुक करें: [/appointments](/appointments) — layout, fabric और timeline में मदद मिलेगी।`
      : "Book an in-showroom or virtual design session at [/appointments](/appointments) — specialists help with layout, fabrics, and timelines.";
  }

  if (/track|order status|shipment|where is my order|ऑर्डर|ट्रैक/.test(q)) {
    return hi
      ? `अपना ऑर्डर ट्रैक करें: [/track-order](/track-order)। नई डिलीवरी का white-glove समय checkout पर confirm होता है।`
      : "Track your order at [/track-order](/track-order). White-glove scheduling for new pieces is confirmed at checkout.";
  }

  if (/contact|phone|email|whatsapp|call|support|संपर्क|फोन/.test(q)) {
    return hi
      ? `Studio से बात करें: ${s.email} या ${s.phone}. Site पर WhatsApp float भी है। पूरा contact: [/contact](/contact)।`
      : `Reach the studio at ${s.email} or ${s.phone}. WhatsApp is on the site float. Full options: [/contact](/contact).`;
  }

  if (/trade|designer|architect|ट्रेड|डिज़ाइनर/.test(q)) {
    return hi
      ? `Designers और architects के लिए Trade Programme: [/trade-program](/trade-program)।`
      : "Designers and architects can join the Trade Programme at [/trade-program](/trade-program).";
  }

  if (/gst|tax|inclusive|price include|टैक्स|जीएसटी/.test(q)) {
    return hi
      ? "साइट पर कीमतों में आमतौर पर 18% GST शामिल होता है, जब तक अलग से न लिखा हो।"
      : SITE_FACTS.gst;
  }

  if (/custom|bespoke|commission|made to order|customise|customize|कस्टम|बेस्पोक/.test(q)) {
    return hi
      ? `Made-to-order sofa/bed के लिए Bespoke Studio: [/custom](/custom) — silhouette, fabric, timber और scale चुनें, फिर commission भेजें।`
      : "Compose a made-to-order sofa or bed in Bespoke Studio at [/custom](/custom) — then submit a commission.";
  }

  const shoppingIntent =
    hint ||
    compare ||
    focused ||
    /suggest|recommend|best|buy|khareed|chahiye|chaiye|want a|looking for|catalogue|collection|खरीद|चाहिए|बताओ|सुझाओ|dikhao|batao|btao|le\s*lu|lena|purchase|order|bare me|baare|kaisa|kaisi|worth/.test(
      q
    );

  if (shoppingIntent) {
    const pitch = buildSalesPitch(products, { hi, hint, compare, focused });
    if (pitch) return pitch;
    if (hint) {
      return hi
        ? `हमारे ${hint.labelHi || hint.label} देखें: [${hint.labelHi || hint.label}](${hint.href}). Bespoke बनवाना हो तो [/custom](/custom), या consult के लिए [/appointments](/appointments)।`
        : `Explore our ${hint.label} at [${hint.label}](${hint.href}). You can also open [/custom](/custom) for bespoke, or book [/appointments](/appointments).`;
    }
  }

  if (
    configLine &&
    /my (sofa|bed|piece|composition|estimate)|current (sofa|bed|selection)|this (sofa|bed|config)|मेरा|मेरी composition/.test(
      q
    )
  ) {
    return hi
      ? `आपकी मौजूदा Bespoke composition: ${configLine}${city ? ` (${city})` : ""}। Fabric, room fit, या Scale notes के बारे में पूछ सकते हैं।`
      : `Your current Bespoke Studio composition is ${configLine}${city ? ` for ${city}` : ""}. Ask about fabric, room fit, or Scale notes.`;
  }

  if (
    configuration &&
    /fabric|upholstery|velvet|boucle|linen|leather|kids|pet|wood|timber|finish|scale|fit|room notes|फैब्रिक|बच्चे/.test(
      q
    )
  ) {
    if (/kids|pet|family|stain|spill|बच्चे|पालतू/.test(q)) {
      return hi
        ? "बच्चों या pets के लिए Performance weave चुनें — luxury look के साथ रोजमर्रा की मजबूती। [/custom](/custom) पर Material में बदलें।"
        : "For kids or pets, choose Performance weave in Bespoke Studio. Switch under Material on [/custom](/custom).";
    }
  }

  if (/sofa|bed|chair|dining|collection|shop|catalogue|catalog|सोफा|बेड|कलेक्शन/.test(q)) {
    return hi
      ? `Sofas, Beds, Chairs और Dining ऊपर nav या [/collections](/collections) से देखें। Custom के लिए [/custom](/custom)। कमरा बताएं तो और सही सुझाव दूँगा।`
      : "Shop Sofas, Beds, Chairs, and Dining from the top nav or [/collections](/collections). For tailored pieces, use [/custom](/custom).";
  }

  if (/hello|hi\b|hey|namaste|help|confused|kya|kaise|नमस्ते|मदद/.test(q)) {
    return hi
      ? "नमस्ते — मैं Furalto Studio AI हूँ। Product, delivery, comparison, showroom — जो पूछो उसी का सीधा जवाब दूँगा।"
      : "I’m Furalto Studio AI. Ask about any product, delivery timing, comparisons, or the showroom — I’ll answer the question you asked.";
  }

  // Follow-up with known product context but unclear intent
  if (products.length) {
    const p = products[0];
    const link = `[${p.name} — ${formatInr(p.price)}](/products/${p.slug})`;
    return hi
      ? `Aap ${link} ke context mein ho. Delivery timing, fabric, size, comparison — jo chahiye seedha poochho, main usi hisaab se guide karunga.`
      : `We’re looking at ${link}. Ask me anything specific — delivery timing, why to buy it, fabrics, sizing, or a comparison — and I’ll answer that directly.`;
  }

  return hi
    ? "Main Furalto products, delivery, comparisons, Rohini showroom, appointments aur [/custom](/custom) bespoke mein madad kar sakta hoon. Jo dil mein sawaal hai, woh poochho."
    : "I can help with Furalto products, delivery timing, comparisons, the Rohini showroom, appointments, or [/custom](/custom). Ask whatever is on your mind.";
};

module.exports = {
  SITE_FACTS,
  buildSiteKnowledgeBlock,
  buildConfigurationSummary,
  findRelevantProducts,
  formatProductLines,
  buildSalesBriefs,
  toProductCards,
  detectReplyLanguage,
  isCompareIntent,
  isFocusedProductAsk,
  isDeliveryAsk,
  answerFromSite,
  answerFromCatalog: answerFromSite,
};
