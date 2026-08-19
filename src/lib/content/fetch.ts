import { siteConfig } from "@/config/site";
import type { ApiResponse } from "@/types";

export type SiteContentEntry = {
  key: string;
  title: string;
  type: string;
  description?: string;
  data: Record<string, unknown>;
  isPublished: boolean;
  updatedAt?: string;
};

function getApiBaseUrl() {
  return siteConfig.apiUrl || "http://localhost:5000";
}

/** Always fetch fresh CMS content — admin edits must show on the next page load. */
export async function fetchContentByKey(key: string): Promise<SiteContentEntry | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/content/${encodeURIComponent(key)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<{ content: SiteContentEntry }>;
    return payload.data.content;
  } catch {
    return null;
  }
}

export async function fetchAllContent(): Promise<SiteContentEntry[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/content`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiResponse<{ items: SiteContentEntry[] }>;
    return payload.data.items || [];
  } catch {
    return [];
  }
}
