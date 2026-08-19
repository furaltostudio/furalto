import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type CreateMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
};

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${siteConfig.url}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function createMetadata({
  title,
  description = siteConfig.description,
  path = "",
  keywords = [...siteConfig.keywords],
  noIndex = false,
  ogImage = siteConfig.ogImage,
  ogType = "website",
}: CreateMetadataOptions = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} | ${siteConfig.tagline} — ${siteConfig.subtagline}`;
  const canonicalUrl = absoluteUrl(path || "/");
  const imageUrl = absoluteUrl(ogImage);
  const trimmedDescription =
    description.length > 160 ? `${description.slice(0, 157).trim()}…` : description;

  return {
    title: pageTitle,
    description: trimmedDescription,
    keywords,
    category: "shopping",
    applicationName: siteConfig.name,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: siteConfig.locale,
      url: canonicalUrl,
      siteName: siteConfig.name,
      title: pageTitle,
      description: trimmedDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${title || siteConfig.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: trimmedDescription,
      images: [imageUrl],
    },
  };
}
