"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, FolderTree, Plus, RefreshCw, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { slugify } from "@/lib/admin/format";
import { adminService, type AdminCategory } from "@/services/admin.service";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = useCallback(async (opts?: { quiet?: boolean }) => {
    if (opts?.quiet) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError("");

    try {
      const response = await adminService.getCategories();
      setCategories(response.data.categories || []);
    } catch (loadError) {
      setError(getAuthErrorMessage(loadError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const stats = useMemo(() => {
    const active = categories.filter((category) => category.isActive).length;
    return {
      total: categories.length,
      active,
      inactive: categories.length - active,
    };
  }, [categories]);

  const previewSlug = newCategorySlug.trim() || slugify(newCategoryName) || "slug";

  const handleCreateCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!newCategoryName.trim()) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await adminService.createCategory({
        name: newCategoryName.trim(),
        slug: newCategorySlug.trim() || slugify(newCategoryName),
      });
      setNewCategoryName("");
      setNewCategorySlug("");
      setMessage("Category created.");
      await loadCategories({ quiet: true });
    } catch (createError) {
      setError(getAuthErrorMessage(createError));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryActive = async (category: AdminCategory) => {
    setBusyId(category.id);
    setError("");
    try {
      await adminService.updateCategory(category.id, { isActive: !category.isActive });
      setMessage(
        category.isActive ? `"${category.name}" hidden from forms.` : `"${category.name}" enabled.`
      );
      await loadCategories({ quiet: true });
    } catch (updateError) {
      setError(getAuthErrorMessage(updateError));
    } finally {
      setBusyId(null);
    }
  };

  const deleteCategory = async (category: AdminCategory) => {
    if (!window.confirm(`Delete category “${category.name}”? This cannot be undone.`)) {
      return;
    }

    setBusyId(category.id);
    setError("");
    try {
      await adminService.deleteCategory(category.id);
      setMessage("Category deleted.");
      await loadCategories({ quiet: true });
    } catch (deleteError) {
      setError(getAuthErrorMessage(deleteError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-page admin-categories-page">
      <div className="admin-stat-grid admin-categories-stats">
        <AdminStatCard
          label="Total"
          value={stats.total}
          hint="Furniture types"
          icon={<FolderTree size={16} />}
        />
        <AdminStatCard
          label="Active"
          value={stats.active}
          hint="In product form"
          tone="success"
          icon={<Eye size={16} />}
        />
        <AdminStatCard
          label="Disabled"
          value={stats.inactive}
          hint="Hidden from pickers"
          tone={stats.inactive > 0 ? "warning" : "default"}
          icon={<EyeOff size={16} />}
        />
      </div>

      <section className="admin-panel admin-panel-elevated admin-categories-create">
        <div className="admin-panel-header">
          <div>
            <p className="admin-page-kicker">New type</p>
            <h2>Add category</h2>
            <p className="admin-panel-subtitle">
              Used by product forms and collection pages. Top nav is configured separately.
            </p>
          </div>
        </div>

        <form className="admin-categories-form" onSubmit={handleCreateCategory}>
          <div className="admin-categories-form-row">
            <label className="admin-categories-field">
              <span className="admin-categories-label">Category name</span>
              <input
                className="admin-input"
                placeholder="e.g. Sofas"
                value={newCategoryName}
                onChange={(event) => {
                  const name = event.target.value;
                  setNewCategoryName(name);
                  if (!newCategorySlug || newCategorySlug === slugify(newCategoryName)) {
                    setNewCategorySlug(slugify(name));
                  }
                }}
                required
              />
            </label>

            <label className="admin-categories-field">
              <span className="admin-categories-label">URL slug</span>
              <input
                className="admin-input"
                placeholder="sofas"
                value={newCategorySlug}
                onChange={(event) => setNewCategorySlug(slugify(event.target.value))}
              />
            </label>

            <div className="admin-categories-form-actions">
              <Button
                type="submit"
                className="admin-button admin-button-primary"
                isLoading={isSaving}
                loadingText="Adding…"
              >
                <Plus size={16} />
                Add category
              </Button>
            </div>
          </div>

          <p className="admin-categories-slug-preview">
            Storefront path <code>/{previewSlug}</code>
          </p>
        </form>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}
      {message ? <p className="admin-success">{message}</p> : null}

      <section className="admin-panel admin-categories-list-panel">
        <div className="admin-panel-header admin-categories-list-header">
          <div>
            <p className="admin-page-kicker">Catalogue</p>
            <h2>Furniture categories</h2>
            <p className="admin-panel-subtitle">
              Enable or hide types without deleting historical products.
            </p>
          </div>
          <div className="admin-categories-list-meta">
            <span className="admin-categories-count">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </span>
            <Button
              type="button"
              className="admin-button admin-categories-refresh"
              onClick={() => void loadCategories({ quiet: true })}
              isLoading={isRefreshing}
              spinnerOnly
              aria-label="Refresh categories"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="admin-categories-skeleton" aria-hidden>
            {[0, 1].map((item) => (
              <div key={item} className="admin-categories-skeleton-row" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-categories-empty">
            <AdminEmptyState
              title="No categories yet"
              description="Create your first furniture category (e.g. Sofas, Beds) to unlock product dropdowns."
            />
          </div>
        ) : (
          <ul className="admin-category-list">
            {categories.map((category) => {
              const busy = busyId === category.id;
              return (
                <li key={category.id}>
                  <article
                    className={`admin-category-card${category.isActive ? "" : " is-inactive"}`}
                  >
                    <div className="admin-category-identity">
                      <span className="admin-category-monogram" aria-hidden>
                        {(category.name.trim()[0] || "?").toUpperCase()}
                      </span>
                      <div className="admin-category-copy">
                        <h3>{category.name}</h3>
                        <p className="admin-category-slug">/{category.slug}</p>
                      </div>
                    </div>

                    <div className="admin-category-card-actions">
                      <AdminBadge status={category.isActive ? "active" : "inactive"} />
                      <Button
                        type="button"
                        className="admin-button"
                        isLoading={busy}
                        loadingText={category.isActive ? "Disabling…" : "Enabling…"}
                        onClick={() => void toggleCategoryActive(category)}
                      >
                        {category.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        {category.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        type="button"
                        className="admin-button admin-button-danger"
                        disabled={busy}
                        onClick={() => void deleteCategory(category)}
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
