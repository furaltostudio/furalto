const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const catalog = require("../data/custom-furniture");
const CustomQuote = require("../models/CustomQuote.model");
const { getCustomFurnitureAdvice, chatWithStudio } = require("./gemini.service");
const { sendCustomQuoteNotifyEmail } = require("./email.service");
const { notifyCustomQuote } = require("./notification.service");

const findOption = (list, id, label) => {
  const match = list.find((item) => item.id === id);
  if (!match) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid ${label}`);
  }
  return match;
};

const getCatalog = () => ({
  currency: catalog.currency,
  leadTimeNote: catalog.leadTimeNote,
  disclaimer: catalog.disclaimer,
  intents: catalog.intents,
  pieces: catalog.pieces,
  woods: catalog.woods,
  fabrics: catalog.fabrics,
  finishes: catalog.finishes,
  sizes: catalog.sizes,
});

const buildEstimate = ({ pieceId, woodId, fabricId, finishId, sizeId }) => {
  const piece = findOption(catalog.pieces, pieceId, "piece");
  const wood = findOption(catalog.woods, woodId, "wood");
  const fabric = findOption(catalog.fabrics, fabricId, "fabric");
  const finish = findOption(catalog.finishes, finishId, "finish");
  const size = findOption(catalog.sizes, sizeId, "size");

  const subtotal = piece.basePrice + wood.priceAdd + fabric.priceAdd + finish.priceAdd;
  const amount = Math.round(subtotal * size.multiplier);

  return {
    currency: catalog.currency,
    amount,
    breakdown: {
      base: piece.basePrice,
      wood: wood.priceAdd,
      fabric: fabric.priceAdd,
      finish: finish.priceAdd,
      sizeMultiplier: size.multiplier,
    },
    configuration: {
      pieceId: piece.id,
      pieceLabel: piece.label,
      pieceFamily: piece.family,
      inspiredBy: piece.inspiredBy || [],
      woodId: wood.id,
      woodLabel: wood.label,
      fabricId: fabric.id,
      fabricLabel: fabric.label,
      finishId: finish.id,
      finishLabel: finish.label,
      sizeId: size.id,
      sizeLabel: size.label,
    },
    leadTimeNote: catalog.leadTimeNote,
    disclaimer: catalog.disclaimer,
  };
};

const estimateConfiguration = async (selection, { includeAdvice = false } = {}) => {
  const estimate = buildEstimate(selection);
  let advice = null;
  let adviceSource = null;
  let adviceMessage = null;
  let brief = null;

  if (includeAdvice) {
    const result = await getCustomFurnitureAdvice({
      configuration: estimate.configuration,
      estimateAmount: estimate.amount,
      roomNotes: selection.roomNotes || selection.message || "",
      city: selection.city || "",
    });
    advice = result.advice;
    adviceSource = result.source;
    adviceMessage = result.message;
    brief = result.brief || null;
  }

  return {
    ...estimate,
    advice,
    adviceSource,
    adviceMessage,
    brief,
  };
};

const submitQuote = async (payload) => {
  const estimate = buildEstimate(payload);

  const quote = await CustomQuote.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    city: payload.city || "",
    message: payload.message || "",
    configuration: estimate.configuration,
    estimate: {
      currency: estimate.currency,
      amount: estimate.amount,
      breakdown: estimate.breakdown,
    },
    advice: payload.advice || "",
    status: "new",
  });

  const plain = quote.toObject ? quote.toObject() : quote;
  sendCustomQuoteNotifyEmail(plain, estimate.amount).catch(() => undefined);
  notifyCustomQuote(plain, estimate.amount).catch(() => undefined);

  return {
    quoteId: quote._id,
    estimateAmount: quote.estimate.amount,
    status: quote.status,
  };
};

const listQuotes = async ({ status, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [quotes, total] = await Promise.all([
    CustomQuote.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    CustomQuote.countDocuments(filter),
  ]);

  return { quotes, total, page: Number(page), limit: Number(limit) };
};

const updateQuoteStatus = async (id, status) => {
  const quote = await CustomQuote.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  if (!quote) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Custom quote not found");
  }

  return quote;
};

const chatAboutConfiguration = async (payload) => {
  let configuration = null;
  let estimateAmount = null;

  const hasSelection =
    payload.pieceId &&
    payload.woodId &&
    payload.fabricId &&
    payload.finishId &&
    payload.sizeId;

  if (hasSelection) {
    try {
      const estimate = buildEstimate(payload);
      configuration = estimate.configuration;
      estimateAmount = estimate.amount;
    } catch {
      configuration = null;
      estimateAmount = null;
    }
  }

  return chatWithStudio({
    message: payload.message,
    history: payload.history || [],
    configuration,
    estimateAmount,
    roomNotes: payload.roomNotes || "",
    city: payload.city || "",
    pathname: payload.pathname || "",
  });
};

module.exports = {
  getCatalog,
  estimateConfiguration,
  submitQuote,
  chatAboutConfiguration,
  listQuotes,
  updateQuoteStatus,
};
