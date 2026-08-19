"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Button } from "@/components/ui/Button";
import { formatAdminDate } from "@/lib/admin/format";
import { adminService } from "@/services/admin.service";
import type { BlogPost } from "@/services/blog.service";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminService.getBlogPosts({
        page: String(page),
        limit: "20",
        ...(query.trim() ? { q: query.trim() } : {}),
      });
      setPosts(response.data.posts);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) {
      return;
    }
    setBusyId(post.id);
    try {
      await adminService.deleteBlogPost(post.id);
      await loadPosts();
    } catch {
      setError("Unable to delete post.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <div className="admin-toolbar">
          <form
            className="admin-inline-form"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              void loadPosts();
            }}
          >
            <input
              className="admin-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, slug, category"
              aria-label="Search blog posts"
            />
            <Button type="submit" className="admin-secondary-button">
              Search
            </Button>
          </form>
          <Link href="/admin/blog/new" className="admin-primary-link">
            Write new post
          </Link>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {isLoading ? <p className="admin-muted">Loading posts…</p> : null}

        {!isLoading && posts.length === 0 ? (
          <AdminEmptyState
            title="No blog posts yet"
            description="Write your first article for the Furalto blog."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className="admin-cell-stack">
                        <strong>{post.title}</strong>
                        <span className="admin-muted">/{post.slug}</span>
                      </div>
                    </td>
                    <td>{post.category}</td>
                    <td>
                      <AdminBadge status={post.isPublished ? "active" : "inactive"} />
                    </td>
                    <td>{formatAdminDate(post.publishedAt)}</td>
                    <td className="admin-row-actions">
                      <Link href={`/blog/${post.slug}`} className="admin-link-button" target="_blank">
                        View
                      </Link>
                      <Link href={`/admin/blog/${post.id}`} className="admin-link-button">
                        Edit
                      </Link>
                      <Button
                        type="button"
                        className="admin-link-button"
                        isLoading={busyId === post.id}
                        loadingText="Deleting…"
                        onClick={() => void handleDelete(post)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} total={total} limit={20} onPageChange={setPage} />
      </section>
    </div>
  );
}
