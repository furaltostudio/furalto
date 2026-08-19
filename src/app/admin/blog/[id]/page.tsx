"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { adminService } from "@/services/admin.service";

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  author: string;
  tags: string;
  publishedAt: string;
  isPublished: boolean;
  seoDescription: string;
  coverImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  category: "Journal",
  author: "Furalto Studio",
  tags: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  isPublished: true,
  seoDescription: "",
  coverImage: { src: "", alt: "", width: 1600, height: 1000 },
};

function toDatetimeLocalDate(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

export default function AdminBlogEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const pageTitle = useMemo(
    () => (isNew ? "Write new post" : "Edit journal post"),
    [isNew]
  );

  useEffect(() => {
    if (isNew) return;

    setIsLoading(true);
    adminService
      .getBlogPost(params.id)
      .then((response) => {
        const post = response.data.post;
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          category: post.category || "Journal",
          author: post.author || "Furalto Studio",
          tags: (post.tags || []).join(", "),
          publishedAt: toDatetimeLocalDate(post.publishedAt),
          isPublished: post.isPublished !== false,
          seoDescription: post.seoDescription || "",
          coverImage: {
            src: post.coverImage?.src || "",
            alt: post.coverImage?.alt || post.title,
            width: post.coverImage?.width || 1600,
            height: post.coverImage?.height || 1000,
          },
        });
      })
      .catch((loadError) => setError(getAuthErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, [isNew, params.id]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      category: form.category.trim() || "Journal",
      author: form.author.trim() || "Furalto Studio",
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: new Date(`${form.publishedAt}T10:00:00.000Z`).toISOString(),
      isPublished: form.isPublished,
      seoDescription: form.seoDescription.trim() || form.excerpt.trim(),
      coverImage: form.coverImage,
    };

    try {
      if (isNew) {
        const response = await adminService.createBlogPost(payload);
        setMessage("Post published.");
        router.replace(`/admin/blog/${response.data.post.id}`);
      } else {
        await adminService.updateBlogPost(params.id, payload);
        setMessage("Post saved.");
      }
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="admin-muted">Loading post…</p>;
  }

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-panel-title">{pageTitle}</h2>
            <p className="admin-muted">Markdown-lite body: use blank lines between paragraphs and ## for subheads.</p>
          </div>
          <Link href="/admin/blog" className="admin-link-button">
            Back to journal
          </Link>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {message ? <p className="admin-success">{message}</p> : null}

        <form className="admin-form-grid" onSubmit={(event) => void handleSubmit(event)}>
          <label className="admin-field">
            <span className="admin-label">Title</span>
            <input
              className="admin-input"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Slug (optional)</span>
            <input
              className="admin-input"
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              placeholder="auto-from-title"
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Category</span>
            <input
              className="admin-input"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Author</span>
            <input
              className="admin-input"
              value={form.author}
              onChange={(event) => updateField("author", event.target.value)}
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">Excerpt</span>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.excerpt}
              onChange={(event) => updateField("excerpt", event.target.value)}
              required
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">Body</span>
            <textarea
              className="admin-textarea"
              rows={16}
              value={form.body}
              onChange={(event) => updateField("body", event.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Tags (comma separated)</span>
            <input
              className="admin-input"
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Publish date</span>
            <input
              className="admin-input"
              type="date"
              value={form.publishedAt}
              onChange={(event) => updateField("publishedAt", event.target.value)}
              required
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">SEO description</span>
            <textarea
              className="admin-textarea"
              rows={2}
              value={form.seoDescription}
              onChange={(event) => updateField("seoDescription", event.target.value)}
            />
          </label>

          <div className="admin-field admin-field-full">
            <AdminImageUpload
              label="Cover image"
              value={form.coverImage.src}
              alt={form.coverImage.alt || form.title}
              folder="furalto/blog"
              onChange={(asset) =>
                updateField("coverImage", {
                  src: asset.src,
                  alt: asset.alt,
                  width: asset.width,
                  height: asset.height,
                })
              }
            />
          </div>

          <label className="admin-field admin-checkbox-field">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => updateField("isPublished", event.target.checked)}
            />
            <span>Published on the website</span>
          </label>

          <div className="admin-form-actions">
            <Button type="submit" isLoading={isSaving} loadingText="Saving…">
              {isNew ? "Publish post" : "Save changes"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
