import { API_ROUTES } from "@/constants";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types";

export type CustomOption = {
  id: string;
  label: string;
  description: string;
  family?: "sofa" | "bed";
  inspiredBy?: string[];
  basePrice?: number;
  priceAdd?: number;
  multiplier?: number;
};

export type CustomFurnitureCatalog = {
  currency: string;
  leadTimeNote: string;
  disclaimer: string;
  intents: CustomOption[];
  pieces: CustomOption[];
  woods: CustomOption[];
  fabrics: CustomOption[];
  finishes: CustomOption[];
  sizes: CustomOption[];
};

export type StudioAlternate = {
  pieceId: string;
  reason: string;
};

export type StudioBrief = {
  headline: string;
  summary: string;
  pairing: string[];
  roomFit: string;
  care: string;
  fabricTip?: string | null;
  finishTip?: string | null;
  alternates: StudioAlternate[];
};

export type CustomEstimate = {
  currency: string;
  amount: number;
  breakdown: {
    base: number;
    wood: number;
    fabric: number;
    finish: number;
    sizeMultiplier: number;
  };
  configuration: {
    pieceId: string;
    pieceLabel: string;
    pieceFamily?: string;
    inspiredBy?: string[];
    woodId: string;
    woodLabel: string;
    fabricId: string;
    fabricLabel: string;
    finishId: string;
    finishLabel: string;
    sizeId: string;
    sizeLabel: string;
  };
  leadTimeNote: string;
  disclaimer: string;
  advice: string | null;
  adviceSource?: "gemini" | "studio" | null;
  adviceMessage?: string | null;
  brief?: StudioBrief | null;
};

export type CustomSelection = {
  pieceId: string;
  woodId: string;
  fabricId: string;
  finishId: string;
  sizeId: string;
};

export const customFurnitureService = {
  getCatalog() {
    return apiClient.get<ApiResponse<CustomFurnitureCatalog>>(
      API_ROUTES.customFurniture.catalog,
      { auth: false }
    );
  },

  estimate(
    selection: CustomSelection & {
      includeAdvice?: boolean;
      city?: string;
      roomNotes?: string;
    },
    includeAdvice = false
  ) {
    return apiClient.post<ApiResponse<{ estimate: CustomEstimate }>>(
      API_ROUTES.customFurniture.estimate,
      {
        ...selection,
        includeAdvice: includeAdvice || selection.includeAdvice || false,
      },
      { auth: false }
    );
  },

  submitQuote(
    payload: CustomSelection & {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      city?: string;
      message?: string;
      advice?: string;
    }
  ) {
    return apiClient.post<
      ApiResponse<{ quoteId: string; estimateAmount: number; status: string }>
    >(API_ROUTES.customFurniture.quote, payload, { auth: false });
  },

  chat(
    payload: {
      message: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
      city?: string;
      roomNotes?: string;
      pathname?: string;
    } & Partial<CustomSelection>
  ) {
    return apiClient.post<
      ApiResponse<{
        reply: string;
        source: "gemini" | "studio";
        message?: string | null;
        lang?: "hi" | "en";
        products?: Array<{
          name: string;
          slug: string;
          category?: string;
          price: number;
          href: string;
          label?: string;
          blurb?: string;
        }>;
      }>
    >(API_ROUTES.customFurniture.chat, payload, { auth: false });
  },
};
