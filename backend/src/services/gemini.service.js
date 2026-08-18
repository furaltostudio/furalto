const env = require("../config/env");
const catalog = require("../data/custom-furniture");
const {
  buildStudioBrief,
  briefToAdviceText,
} = require("./studio-advice.service");
const {
  answerFromSite,
  buildConfigurationSummary,
  buildSalesBriefs,
  buildSiteKnowledgeBlock,
  detectReplyLanguage,
  findRelevantProducts,
  formatProductLines,
  isCompareIntent,
  isDeliveryAsk,
  isFocusedProductAsk,
  toProductCards,
} = require("./studio-chat.service");

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
];

const extractText = (payload) => {
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join(" ")
    .trim();
  return text || null;
};

const parseJsonSafe = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const requestGeminiJson = async (apiKey, model, prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: 700,
        responseMimeType: "application/json",
      },
    }),
  });

  const detail = await response.text().catch(() => "");

  if (!response.ok) {
    const error = new Error(`Gemini ${response.status}`);
    error.status = response.status;
    error.detail = detail.slice(0, 300);
    throw error;
  }

  try {
    return parseJsonSafe(extractText(JSON.parse(detail)));
  } catch {
    return null;
  }
};

const normalizeBrief = (raw, configuration, fallback) => {
  if (!raw || typeof raw !== "object") return fallback;

  const family = configuration.pieceFamily || "sofa";
  const validIds = new Set(
    catalog.pieces
      .filter((piece) => piece.family === family && piece.id !== configuration.pieceId)
      .map((piece) => piece.id)
  );

  const alternates = Array.isArray(raw.alternates)
    ? raw.alternates
        .map((item) => ({
          pieceId: String(item?.pieceId || "").trim(),
          reason: String(item?.reason || "").trim(),
        }))
        .filter((item) => validIds.has(item.pieceId) && item.reason)
        .slice(0, 2)
    : fallback.alternates;

  const pairing = Array.isArray(raw.pairing)
    ? raw.pairing.map((tip) => String(tip || "").trim()).filter(Boolean).slice(0, 4)
    : fallback.pairing;

  return {
    headline: String(raw.headline || fallback.headline).trim().slice(0, 90),
    summary: String(raw.summary || fallback.summary).trim().slice(0, 520),
    pairing: pairing.length ? pairing : fallback.pairing,
    roomFit: String(raw.roomFit || fallback.roomFit).trim().slice(0, 280),
    care: String(raw.care || fallback.care).trim().slice(0, 220),
    fabricTip: raw.fabricTip ? String(raw.fabricTip).trim().slice(0, 180) : null,
    finishTip: raw.finishTip ? String(raw.finishTip).trim().slice(0, 180) : null,
    alternates: alternates.length ? alternates : fallback.alternates,
  };
};

/**
 * Structured Studio AI consultant brief via Gemini, with studio fallback.
 */
const getCustomFurnitureAdvice = async ({
  configuration,
  estimateAmount,
  roomNotes = "",
  city = "",
}) => {
  const fallbackBrief = buildStudioBrief({ configuration, roomNotes, city });
  const fallbackAdvice = briefToAdviceText(fallbackBrief);
  const apiKey = env.gemini.apiKey;

  if (!apiKey) {
    return {
      advice: fallbackAdvice,
      brief: fallbackBrief,
      source: "studio",
      message: "Studio consultant mode (add GEMINI_API_KEY for richer Gemini guidance).",
    };
  }

  const family = configuration.pieceFamily || "sofa";
  const alternatePool = catalog.pieces
    .filter((piece) => piece.family === family && piece.id !== configuration.pieceId)
    .map((piece) => `${piece.id} (${piece.label})`)
    .join(", ");

  const inspired =
    Array.isArray(configuration.inspiredBy) && configuration.inspiredBy.length
      ? configuration.inspiredBy.join(", ")
      : "Furalto living collection";

  const prompt = [
    "You are Furalto Studio AI — a senior furniture design consultant for luxury Indian homes.",
    "Brand voice: heritage Indian craftsmanship since 1979; tribute to Late Ramchandar; founder Gayatri; cream, navy, champagne; made-to-order craftsmanship. Tagline: Crafted with heart. Built on legacy.",
    "Return ONLY valid JSON with this exact shape:",
    JSON.stringify({
      headline: "short headline",
      summary: "2-3 sentences",
      pairing: ["tip1", "tip2", "tip3"],
      roomFit: "one sentence on scale/room fit",
      care: "one short care tip",
      fabricTip: "optional fabric upgrade tip or null",
      finishTip: "optional finish tip or null",
      alternates: [
        { pieceId: "valid-id", reason: "why switch" },
        { pieceId: "valid-id", reason: "why switch" },
      ],
    }),
    "Rules:",
    "- No markdown, no emoji, no prices invented.",
    "- alternates.pieceId MUST be chosen only from the allowed alternate pool.",
    "- Keep language practical and warm.",
    "- Mention final pricing is confirmed in consultation inside summary.",
    "",
    `Intent family: ${family}`,
    `Silhouette: ${configuration.pieceLabel} (${configuration.pieceId})`,
    `Inspired by: ${inspired}`,
    `Wood: ${configuration.woodLabel}`,
    `Upholstery: ${configuration.fabricLabel}`,
    `Finish: ${configuration.finishLabel}`,
    `Scale: ${configuration.sizeLabel}`,
    `City: ${city || "not provided"}`,
    `Room notes: ${roomNotes || "not provided"}`,
    `Indicative estimate: ₹${Number(estimateAmount).toLocaleString("en-IN")}`,
    `Allowed alternate pieceIds: ${alternatePool || "none"}`,
  ].join("\n");

  const tried = new Set();

  for (const model of GEMINI_MODELS) {
    if (!model || tried.has(model)) continue;
    tried.add(model);

    try {
      const json = await requestGeminiJson(apiKey, model, prompt);
      if (json) {
        const brief = normalizeBrief(json, configuration, fallbackBrief);
        return {
          advice: briefToAdviceText(brief),
          brief,
          source: "gemini",
          message: null,
        };
      }
    } catch (error) {
      console.warn(
        `[Gemini] ${model} failed:`,
        error.status || "",
        error.detail || error.message
      );

      if (error.status === 429 || error.status === 403) {
        break;
      }
    }
  }

  return {
    advice: fallbackAdvice,
    brief: fallbackBrief,
    source: "studio",
    message:
      "Showing studio consultant guidance. Gemini quota may be exceeded — try again later.",
  };
};

const requestGeminiText = async (apiKey, model, contents) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 650,
      },
    }),
  });

  const detail = await response.text().catch(() => "");

  if (!response.ok) {
    const error = new Error(`Gemini ${response.status}`);
    error.status = response.status;
    error.detail = detail.slice(0, 300);
    throw error;
  }

  try {
    return extractText(JSON.parse(detail));
  } catch {
    return null;
  }
};

/**
 * Conversational Studio AI — site-wide Furalto concierge (Gemini + catalogue fallback).
 */
const chatWithStudio = async ({
  message,
  history = [],
  configuration = null,
  estimateAmount = null,
  roomNotes = "",
  city = "",
  pathname = "",
}) => {
  const historyText = Array.isArray(history)
    ? history
        .map((turn) => String(turn?.content || turn?.text || ""))
        .filter(Boolean)
        .join("\n")
    : "";
  const products = await findRelevantProducts(message, { historyText });
  const productCards = toProductCards(products);
  const replyLang = detectReplyLanguage(message);
  const compare = isCompareIntent(message);
  const focused = isFocusedProductAsk(message);
  const deliveryAsk = isDeliveryAsk(message);
  const productLines = formatProductLines(products);
  // Sales briefs bias Gemini toward pitches — skip them on delivery/timing asks.
  const salesBriefs = deliveryAsk ? [] : buildSalesBriefs(products, replyLang);
  const fallback = answerFromSite(message, {
    configuration,
    estimateAmount,
    roomNotes,
    city,
    products,
    lang: replyLang,
  });
  const apiKey = env.gemini.apiKey;

  const withProducts = (payload) => ({
    ...payload,
    // Never attach a product card unless the shopper named (or clearly referred to) one.
    products:
      deliveryAsk || focused
        ? productCards.slice(0, productCards.length ? 1 : 0)
        : productCards,
    lang: replyLang,
  });

  // Factual site answers — use catalogue truth so delivery/showroom/track never become a sales pitch.
  if (
    deliveryAsk ||
    /\b(showroom|track[\s-]?order|where is my order|contact (us|page)|whatsapp|call (you|studio)|book (an )?appoint)/i.test(
      message
    ) ||
    /शोोरूम|ट्रैक|संपर्क|अपॉइंटमेंट/.test(message)
  ) {
    return withProducts({
      reply: fallback,
      source: "studio",
      message: null,
    });
  }

  if (!apiKey) {
    return withProducts({
      reply: fallback,
      source: "studio",
      message: "Studio chat mode (add GEMINI_API_KEY for richer Gemini replies).",
    });
  }

  const configLine = buildConfigurationSummary(configuration, estimateAmount);
  const languageRule =
    replyLang === "hi"
      ? "CRITICAL LANGUAGE RULE: The shopper wrote in Devanagari Hindi. Reply in clear Hindi (Devanagari). Keep product names in English."
      : "CRITICAL LANGUAGE RULE: The shopper wrote in English or Hinglish (Roman script). Reply in clear, simple English. Do NOT reply in Devanagari Hindi.";

  const focusRule = deliveryAsk
    ? `CRITICAL INTENT: DELIVERY / ARRIVAL TIME. The shopper wants to know how long until the piece reaches home. Answer ONLY timing/dispatch/delivery for ${products[0]?.name || "the named product"} — do NOT give a generic “buy this sofa” sales pitch. Use catalogue dispatch notes. Stay positive and specific.`
    : focused
      ? `CRITICAL: The shopper asked about a SPECIFIC product. Answer ONLY about ${products[0]?.name || "that named product"}. Do NOT switch to a different hero product unless they asked to compare.`
      : "Answer the shopper’s exact question first. Do not force a generic sales pitch if they asked something else (price, delivery, size, showroom, etc.).";

  const systemPreamble = [
    "You are Furalto Studio AI — a helpful Gemini-style assistant for the Furalto furniture website (India).",
    "You know the whole site: products, collections, delivery, showroom, appointments, custom studio, trade, tracking, contact.",
    "Be conversational and useful. Understand English, Hindi, and Hinglish.",
    "STEP 1: detect intent (delivery / why-buy / compare / showroom / price / browse).",
    "STEP 2: answer THAT intent directly in a positive way.",
    "If the message mixes product name + delivery question (e.g. “if I buy X, kitne dino me ayega”), answer DELIVERY for X — not a sales recommendation list.",
    "If they say “ye/this/mere ye”, use the latest product from catalogue context / chat history.",
    "Persona: warm luxury consultant — never pushy, never negative about Furalto pieces.",
    "No emoji. No markdown headings.",
    languageRule,
    focusRule,
    "Include markdown links when helpful: [Product Name — ₹price](/products/slug).",
    "Delivery facts: use catalogue dispatch notes (often 10–15 working days). White-glove at checkout. Never invent exact calendar dates.",
    "Never invent stock, fake discounts, or prices beyond catalogue amounts.",
    buildSiteKnowledgeBlock(),
    pathname ? `Shopper page: ${pathname}.` : "",
    configLine ? `Bespoke composition in progress: ${configLine}.` : "",
    city ? `City: ${city}.` : "",
    roomNotes ? `Room notes: ${roomNotes}.` : "",
    salesBriefs.length
      ? `Catalogue context:\n${salesBriefs.join("\n")}`
      : productLines.length
        ? `Catalogue matches:\n${productLines.join("\n")}`
        : "No catalogue match yet — answer generally and ask one clarifying question if needed.",
  ]
    .filter(Boolean)
    .join("\n");

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `${systemPreamble}\n\nReply to the shopper’s exact question — helpful, positive, and specific.`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text:
            replyLang === "hi"
              ? "समझ गया। पहले उनका exact सवाल समझूँगा — delivery, price, comparison या product — फिर उसी का सीधा, positive जवाब दूँगा।"
              : "Understood. I’ll detect their exact intent first — delivery, price, compare, or product — then answer that directly in a clear, positive way.",
        },
      ],
    },
  ];

  const trimmedHistory = Array.isArray(history) ? history.slice(-8) : [];
  for (const turn of trimmedHistory) {
    const role = turn?.role === "assistant" || turn?.role === "model" ? "model" : "user";
    const text = String(turn?.content || turn?.text || "").trim();
    if (!text) continue;
    contents.push({ role, parts: [{ text: text.slice(0, 800) }] });
  }

  contents.push({
    role: "user",
    parts: [{ text: String(message).trim().slice(0, 500) }],
  });

  const tried = new Set();

  for (const model of GEMINI_MODELS) {
    if (!model || tried.has(model)) continue;
    tried.add(model);

    try {
      const reply = await requestGeminiText(apiKey, model, contents);
      if (reply) {
        return withProducts({
          reply: reply.slice(0, 1400),
          source: "gemini",
          message: null,
        });
      }
    } catch (error) {
      console.warn(
        `[Gemini chat] ${model} failed:`,
        error.status || "",
        error.detail || error.message
      );

      if (error.status === 429 || error.status === 403) {
        break;
      }
    }
  }

  return withProducts({
    reply: fallback,
    source: "studio",
    message:
      "Studio chat fallback active. Gemini quota may be exceeded — try again later.",
  });
};

module.exports = {
  getCustomFurnitureAdvice,
  chatWithStudio,
};
