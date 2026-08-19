import {
  getFurnitureStoreJsonLd,
  getOrganizationJsonLd,
  getWebsiteJsonLd,
} from "@/lib/seo/jsonld";

type JsonLdProps = {
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
};

/** Renders one or more JSON-LD graph nodes for search engines. */
export function JsonLd({ data }: JsonLdProps = {}) {
  const schemas = data
    ? Array.isArray(data)
      ? data
      : [data]
    : [getOrganizationJsonLd(), getWebsiteJsonLd(), getFurnitureStoreJsonLd()];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
