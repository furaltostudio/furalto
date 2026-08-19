import { siteConfig } from "@/config/site";
import { businessContact } from "@/config/contact";
import type { Product } from "@/types/product";

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${siteConfig.url}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/favicon.png"),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(siteConfig.ogImage),
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    foundingDate: "1979",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office No. 103–104, First Floor, Pocket 5, Sector 24, Rohini",
      addressLocality: "New Delhi",
      postalCode: "110085",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.contact.phone,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** FurnitureStore / LocalBusiness for rich local + ecommerce signals */
export function getFurnitureStoreJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["FurnitureStore", "HomeAndConstructionBusiness"],
    "@id": `${siteConfig.url}/#store`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.ogImage),
    logo: absoluteUrl("/favicon.png"),
    description: siteConfig.description,
    telephone: businessContact.phone,
    email: businessContact.email,
    priceRange: "₹₹₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI, Razorpay",
    openingHours: "Mo-Sa 09:00-19:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office No. 103–104, First Floor, Pocket 5, Sector 24, Rohini",
      addressLocality: "New Delhi",
      postalCode: "110085",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.7495,
      longitude: 77.0565,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasMap: "https://maps.google.com/?q=Rohini+Sector+24+New+Delhi",
    sameAs: Object.values(siteConfig.social).filter(Boolean),
    parentOrganization: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function getBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getProductJsonLd(product: Product) {
  const categoryLabel = product.category.replace(/-/g, " ");
  const images = product.images.map((image) => absoluteUrl(image.src));
  const description =
    product.description ||
    `${product.name} — handcrafted ${categoryLabel} furniture by ${siteConfig.name}.`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: images,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: categoryLabel,
    material: product.finishes.map((item) => item.label).join(", ") || undefined,
    color: product.fabrics.map((item) => item.label).join(", ") || undefined,
    ...(product.reviewCount && product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating ?? 0,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(typeof product.soldCount === "number" && product.soldCount > 0
      ? {
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "unitsSold",
              value: product.soldCount,
            },
          ],
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  };
}

export function getProductSeoDescription(product: Product) {
  const categoryLabel = product.category.replace(/-/g, " ");
  const base =
    product.description?.trim() ||
    `Shop the ${product.name} — premium ${categoryLabel} furniture from ${siteConfig.name}.`;
  const withBrand = base.includes(siteConfig.name)
    ? base
    : `${base} Crafted for lasting homes across India.`;
  return withBrand.length > 160 ? `${withBrand.slice(0, 157).trim()}…` : withBrand;
}
