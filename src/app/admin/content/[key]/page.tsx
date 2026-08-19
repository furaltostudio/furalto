"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { CONTENT_CATALOG_BY_KEY } from "@/lib/admin/contentCatalog";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { adminService } from "@/services/admin.service";

const FIELD_LABELS: Record<string, string> = {
  tagline: "Brand tagline (homepage headline)",
  subtagline: "Brand subtagline",
  announcementText: "Announcement bar text",
  announcementCta: "Announcement button text",
  announcementHref: "Announcement button link",
  footerDescription: "Footer description",
  email: "Contact email",
  phone: "Contact phone",
  whatsapp: "WhatsApp number",
  address: "Address",
  hours: "Business hours",
  gstin: "GSTIN (tax registration number)",
  instagram: "Instagram URL",
  pinterest: "Pinterest URL",
  facebook: "Facebook URL",
  youtube: "YouTube URL",
  eyebrow: "Eyebrow / small label",
  subtitle: "Subtitle",
  lead: "Lead paragraph",
  title: "Title",
  description: "Description",
  video: "Hero video path",
  primaryCtaLabel: "Primary button text",
  primaryCtaHref: "Primary button link",
  secondaryCtaLabel: "Secondary button text",
  secondaryCtaHref: "Secondary button link",
  ctaLabel: "Button text",
  ctaHref: "Button link",
  imageSrc: "Image URL",
  imageAlt: "Image alt text",
  label: "Label",
  detail: "Detail",
  href: "Link",
  cta: "Call to action",
  id: "ID",
  tone: "Swatch color / gradient CSS",
  index: "Step number",
  materialsLabel: "Materials heading",
  priceFrom: "Starting price text",
  timeNote: "Time note",
  city: "City",
  name: "Name",
  imageKey: "Image key (sofas, beds, dining, lighting…)",
  pagePath: "Website path",
  mastheadLeft: "Masthead left text",
  mastheadCenter: "Masthead center text",
  mastheadRight: "Masthead right text",
  brandMark: "Brand name",
  brandTagline: "Brand tagline",
  titleLine1: "Title line 1",
  titleAccent1: "Title accent 1",
  titleLine2: "Title line 2",
  titleAccent2: "Title accent 2",
  body: "Story paragraph",
  heroImageSrc: "Hero image URL",
  heroImageAlt: "Hero image alt text",
  processEyebrow: "Process eyebrow",
  indiaLabel: "Made in India line",
  quote: "Quote / client story",
  quoteAccent: "Quote accent line",
  featuredCount: "Stories to show on homepage",
  siteUrl: "Website URL text",
  purchase: "What they bought",
  location: "City / location",
  year: "Year",
  image: "Story image URL",
  role: "Client role / context",
  introEyebrow: "Intro eyebrow",
  introLead: "Intro paragraph",
  closeEyebrow: "Closing section eyebrow",
  closeTitle: "Closing section title",
  closeLead: "Closing section paragraph",
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero section",
  brandStrip: "Highlights under hero",
  inspirations: "Product inspirations",
  craftStory: "Craft story (Made in India)",
  categoryShowcase: "Category showcase",
  discover: "Discover section",
  customStudio: "Custom studio (Design your piece)",
  customServices: "Custom services banner",
  testimonials: "Client stories (homepage)",
  steps: "Steps",
  materials: "Material swatches",
  items: "Items / stories",
  trustPoints: "Trust points",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function flattenScalars(data: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[key] = String(value);
    }
  });
  return result;
}

function getStringArrayFields(data: Record<string, unknown>) {
  return Object.entries(data).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) && entry[1].every((item) => typeof item === "string")
  );
}

function getObjectArrayFields(data: Record<string, unknown>) {
  return Object.entries(data).filter(
    (entry): entry is [string, Record<string, unknown>[]] =>
      Array.isArray(entry[1]) &&
      entry[1].length > 0 &&
      entry[1].every((item) => isPlainObject(item))
  );
}

function getNestedObjectFields(data: Record<string, unknown>) {
  return Object.entries(data).filter(
    (entry): entry is [string, Record<string, unknown>] => isPlainObject(entry[1])
  );
}

function fieldLabel(fieldKey: string) {
  return FIELD_LABELS[fieldKey] || fieldKey;
}

function sectionLabel(sectionKey: string) {
  return SECTION_LABELS[sectionKey] || sectionKey;
}

export default function AdminContentEditPage() {
  const params = useParams<{ key: string }>();
  const router = useRouter();
  const key = decodeURIComponent(params.key || "");

  const [title, setTitle] = useState("");
  const [type, setType] = useState("section");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [rawJson, setRawJson] = useState("");
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!key) return;

    adminService
      .getContentItem(key)
      .then((response) => {
        const content = response.data.content;
        const contentData = (content.data || {}) as Record<string, unknown>;
        setTitle(content.title);
        setType(content.type);
        setDescription(content.description || "");
        setIsPublished(content.isPublished);
        setData(contentData);
        setRawJson(JSON.stringify(contentData, null, 2));
        const hasScalars = Object.keys(flattenScalars(contentData)).length > 0;
        const hasArrays =
          getStringArrayFields(contentData).length > 0 ||
          getObjectArrayFields(contentData).length > 0;
        const hasNested = getNestedObjectFields(contentData).length > 0;
        setUseAdvanced(!hasScalars && !hasArrays && !hasNested);
      })
      .catch((err) => setError(getAuthErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [key]);

  const scalarFields = useMemo(() => flattenScalars(data), [data]);
  const stringArrays = useMemo(() => getStringArrayFields(data), [data]);
  const objectArrays = useMemo(() => getObjectArrayFields(data), [data]);
  const nestedObjects = useMemo(() => getNestedObjectFields(data), [data]);

  const updateScalar = (fieldKey: string, value: string) => {
    setData((current) => ({ ...current, [fieldKey]: value }));
  };

  const updateStringArray = (fieldKey: string, value: string) => {
    const items = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    setData((current) => ({ ...current, [fieldKey]: items }));
  };

  const updateObjectArrayField = (
    arrayKey: string,
    index: number,
    fieldKey: string,
    value: string
  ) => {
    setData((current) => {
      const list = Array.isArray(current[arrayKey])
        ? [...(current[arrayKey] as Record<string, unknown>[])]
        : [];
      const row = { ...(list[index] || {}) };
      if (fieldKey === "highlights" || fieldKey === "perks") {
        row[fieldKey] = value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      } else {
        row[fieldKey] = value;
      }
      list[index] = row;
      return { ...current, [arrayKey]: list };
    });
  };

  const updateNestedScalar = (sectionKey: string, fieldKey: string, value: string) => {
    setData((current) => {
      const section = isPlainObject(current[sectionKey])
        ? { ...(current[sectionKey] as Record<string, unknown>) }
        : {};
      section[fieldKey] = value;
      return { ...current, [sectionKey]: section };
    });
  };

  const updateNestedStringArray = (sectionKey: string, fieldKey: string, value: string) => {
    const items = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    setData((current) => {
      const section = isPlainObject(current[sectionKey])
        ? { ...(current[sectionKey] as Record<string, unknown>) }
        : {};
      section[fieldKey] = items;
      return { ...current, [sectionKey]: section };
    });
  };

  const updateNestedObjectArrayField = (
    sectionKey: string,
    arrayKey: string,
    index: number,
    fieldKey: string,
    value: string
  ) => {
    setData((current) => {
      const section = isPlainObject(current[sectionKey])
        ? { ...(current[sectionKey] as Record<string, unknown>) }
        : {};
      const list = Array.isArray(section[arrayKey])
        ? [...(section[arrayKey] as Record<string, unknown>[])]
        : [];
      const row = { ...(list[index] || {}) };
      if (fieldKey === "highlights" || fieldKey === "perks") {
        row[fieldKey] = value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      } else {
        row[fieldKey] = value;
      }
      list[index] = row;
      section[arrayKey] = list;
      return { ...current, [sectionKey]: section };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let payloadData = useAdvanced
        ? (JSON.parse(rawJson) as Record<string, unknown>)
        : { ...data };

      // Stories are edited on Client Stories only — never persist duplicate items on homepage.
      if (key === "homepage" && isPlainObject(payloadData.testimonials)) {
        const section = { ...(payloadData.testimonials as Record<string, unknown>) };
        delete section.items;
        if (!section.featuredCount) section.featuredCount = "5";
        payloadData = { ...payloadData, testimonials: section };
      }

      await adminService.saveContent(key, {
        title,
        type,
        description,
        isPublished,
        data: payloadData,
      });

      try {
        const { apiClient } = await import("@/lib/api/client");
        const livePath = CONTENT_CATALOG_BY_KEY[key]?.path;
        const paths = [
          livePath,
          key === "page.testimonials" || key === "homepage" ? "/" : null,
          key === "page.testimonials" ? "/testimonials" : null,
        ].filter((path): path is string => Boolean(path));

        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiClient.getAccessToken()
              ? { Authorization: `Bearer ${apiClient.getAccessToken()}` }
              : {}),
          },
          body: JSON.stringify({ paths }),
        });
      } catch {
        // Content is saved; cache bust is best-effort
      }

      setData(payloadData);
      setRawJson(JSON.stringify(payloadData, null, 2));
      setSuccess("Saved. Live website will show the update on refresh.");
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "Advanced JSON is invalid. Please check the format."
          : getAuthErrorMessage(err)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const catalog = CONTENT_CATALOG_BY_KEY[key];

  if (isLoading) {
    return <p className="admin-muted">Loading…</p>;
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={catalog?.title || title || "Edit Content"}
        description={
          catalog?.blurb ||
          description ||
          "Update this website section. Fill in the fields below and click Save."
        }
        actions={
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {catalog?.path ? (
              <a
                href={catalog.path}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-button"
              >
                View live page
              </a>
            ) : null}
            <Link href="/admin/content" className="admin-button">
              Back to all pages
            </Link>
          </div>
        }
      />

      <form className="admin-form" onSubmit={handleSubmit}>
        {error ? <p className="admin-error">{error}</p> : null}
        {success ? <p className="admin-success">{success}</p> : null}

        <label className="admin-field">
          <span>Title</span>
          <input
            className="admin-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="admin-field">
          <span>Helper note for editors</span>
          <input
            className="admin-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="admin-field admin-checkbox-field">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span>Published (visible on website)</span>
        </label>

        {!useAdvanced ? (
          <>
            {Object.keys(scalarFields).length > 0 ? (
              <div className="admin-form-grid">
                {Object.entries(scalarFields)
                  .filter(([fieldKey]) => fieldKey !== "pagePath")
                  .map(([fieldKey, value]) => (
                  <label key={fieldKey} className="admin-field">
                    <span>{fieldLabel(fieldKey)}</span>
                    <input
                      className="admin-input"
                      value={value}
                      onChange={(e) => updateScalar(fieldKey, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {stringArrays.map(([fieldKey, values]) => (
              <label key={fieldKey} className="admin-field">
                <span>{fieldLabel(fieldKey)} (one per line)</span>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  value={values.join("\n")}
                  onChange={(e) => updateStringArray(fieldKey, e.target.value)}
                />
              </label>
            ))}

            {objectArrays.map(([arrayKey, rows]) => (
              <section key={arrayKey} className="admin-section" style={{ marginTop: "1.5rem" }}>
                <h2 className="admin-section-title">{sectionLabel(arrayKey)}</h2>
                {rows.map((row, index) => (
                  <div
                    key={`${arrayKey}-${index}`}
                    className="admin-form-grid"
                    style={{
                      marginBottom: "1.25rem",
                      paddingBottom: "1.25rem",
                      borderBottom: "1px solid var(--admin-border, #e5e5e5)",
                    }}
                  >
                    <p className="admin-muted" style={{ gridColumn: "1 / -1" }}>
                      Item {index + 1}
                    </p>
                    {Object.entries(row).map(([fieldKey, value]) => {
                      const display =
                        Array.isArray(value) && value.every((item) => typeof item === "string")
                          ? value.join("\n")
                          : String(value ?? "");
                      const isMultiline =
                        fieldKey === "highlights" ||
                        fieldKey === "perks" ||
                        fieldKey === "description" ||
                        fieldKey === "quote" ||
                        fieldKey === "introLead" ||
                        fieldKey === "closeLead" ||
                        display.length > 80;

                      return (
                        <label key={fieldKey} className="admin-field">
                          <span>{fieldLabel(fieldKey)}</span>
                          {isMultiline ? (
                            <textarea
                              className="admin-textarea"
                              rows={3}
                              value={display}
                              onChange={(e) =>
                                updateObjectArrayField(arrayKey, index, fieldKey, e.target.value)
                              }
                            />
                          ) : (
                            <input
                              className="admin-input"
                              value={display}
                              onChange={(e) =>
                                updateObjectArrayField(arrayKey, index, fieldKey, e.target.value)
                              }
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                ))}
              </section>
            ))}

            {nestedObjects.map(([sectionKey, section]) => {
              const nestedScalars = flattenScalars(section);
              const nestedStringArrays = getStringArrayFields(section);
              const nestedObjectArrays = getObjectArrayFields(section);

              return (
                <section
                  key={sectionKey}
                  className="admin-section"
                  style={{ marginTop: "1.75rem" }}
                >
                  <h2 className="admin-section-title">{sectionLabel(sectionKey)}</h2>

                  {sectionKey === "inspirations" ? (
                    <p className="admin-muted" style={{ marginBottom: "1rem" }}>
                      For lifestyle images and product pins, use the dedicated{" "}
                      <Link href="/admin/inspirations">Shop the Look</Link> editor. You can still
                      edit the section title below.
                    </p>
                  ) : null}

                  {sectionKey === "testimonials" && key === "homepage" ? (
                    <p className="admin-muted" style={{ marginBottom: "1rem" }}>
                      Edit story text and images under{" "}
                      <Link href="/admin/content/page.testimonials">Client Stories</Link>. Here you
                      only control the homepage section title, lead, button, and how many stories to
                      feature.
                    </p>
                  ) : null}

                  {Object.keys(nestedScalars).length > 0 ? (
                    <div className="admin-form-grid">
                      {Object.entries(nestedScalars).map(([fieldKey, value]) => (
                        <label key={fieldKey} className="admin-field">
                          <span>{fieldLabel(fieldKey)}</span>
                          <input
                            className="admin-input"
                            value={value}
                            onChange={(e) =>
                              updateNestedScalar(sectionKey, fieldKey, e.target.value)
                            }
                          />
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {nestedStringArrays.map(([fieldKey, values]) => (
                    <label key={fieldKey} className="admin-field">
                      <span>{fieldLabel(fieldKey)} (one per line)</span>
                      <textarea
                        className="admin-textarea"
                        rows={4}
                        value={values.join("\n")}
                        onChange={(e) =>
                          updateNestedStringArray(sectionKey, fieldKey, e.target.value)
                        }
                      />
                    </label>
                  ))}

                  {nestedObjectArrays
                    .filter(
                      ([arrayKey]) =>
                        !(sectionKey === "inspirations" && arrayKey === "slides") &&
                        !(key === "homepage" && sectionKey === "testimonials" && arrayKey === "items")
                    )
                    .map(([arrayKey, rows]) => (
                    <div key={arrayKey} style={{ marginTop: "1rem" }}>
                      <h3 className="admin-section-title" style={{ fontSize: "0.95rem" }}>
                        {sectionLabel(arrayKey)}
                      </h3>
                      {rows.map((row, index) => (
                        <div
                          key={`${sectionKey}-${arrayKey}-${index}`}
                          className="admin-form-grid"
                          style={{
                            marginBottom: "1.25rem",
                            paddingBottom: "1.25rem",
                            borderBottom: "1px solid var(--admin-border, #e5e5e5)",
                          }}
                        >
                          <p className="admin-muted" style={{ gridColumn: "1 / -1" }}>
                            Item {index + 1}
                          </p>
                          {Object.entries(row).map(([fieldKey, value]) => {
                            const display =
                              Array.isArray(value) &&
                              value.every((item) => typeof item === "string")
                                ? value.join("\n")
                                : String(value ?? "");
                            const isMultiline =
                              fieldKey === "highlights" ||
                              fieldKey === "perks" ||
                              fieldKey === "description" ||
                              fieldKey === "quote" ||
                              fieldKey === "introLead" ||
                              fieldKey === "closeLead" ||
                              display.length > 80;

                            return (
                              <label key={fieldKey} className="admin-field">
                                <span>{fieldLabel(fieldKey)}</span>
                                {isMultiline ? (
                                  <textarea
                                    className="admin-textarea"
                                    rows={3}
                                    value={display}
                                    onChange={(e) =>
                                      updateNestedObjectArrayField(
                                        sectionKey,
                                        arrayKey,
                                        index,
                                        fieldKey,
                                        e.target.value
                                      )
                                    }
                                  />
                                ) : (
                                  <input
                                    className="admin-input"
                                    value={display}
                                    onChange={(e) =>
                                      updateNestedObjectArrayField(
                                        sectionKey,
                                        arrayKey,
                                        index,
                                        fieldKey,
                                        e.target.value
                                      )
                                    }
                                  />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              );
            })}
          </>
        ) : (
          <label className="admin-field">
            <span>Content data (advanced JSON)</span>
            <textarea
              className="admin-textarea"
              rows={18}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              spellCheck={false}
            />
          </label>
        )}

        <button
          type="button"
          className="admin-button"
          onClick={() => {
            if (!useAdvanced) {
              setRawJson(JSON.stringify(data, null, 2));
            } else {
              try {
                setData(JSON.parse(rawJson) as Record<string, unknown>);
              } catch {
                setError("Fix JSON before switching to simple fields.");
                return;
              }
            }
            setUseAdvanced((current) => !current);
          }}
        >
          {useAdvanced ? "Switch to simple fields" : "Advanced JSON editor"}
        </button>

        <div className="admin-form-actions">
          <Button
            type="submit"
            className="admin-button admin-button-primary"
            isLoading={isSubmitting}
            loadingText="Saving…"
          >
            Save changes
          </Button>
          <button type="button" className="admin-button" onClick={() => router.push("/admin/content")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
