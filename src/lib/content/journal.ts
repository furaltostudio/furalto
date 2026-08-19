import type { BlogPost } from "@/services/blog.service";
import { blogService } from "@/services/blog.service";
import journalPosts from "@/content/journal-posts.json";

type JournalSeed = (typeof journalPosts)[number];

function toBlogPost(post: JournalSeed): BlogPost {
  return {
    id: `journal-${post.slug}`,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    coverImage: post.coverImage,
    category: post.category,
    author: post.author,
    tags: post.tags,
    publishedAt: post.publishedAt,
    seoDescription: post.excerpt,
    isPublished: true,
    updatedAt: post.publishedAt,
  };
}

export const staticJournalPosts: BlogPost[] = [...journalPosts]
  .map(toBlogPost)
  .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

export function getStaticJournalPost(slug: string) {
  return staticJournalPosts.find((post) => post.slug === slug) ?? null;
}

export async function loadJournalPosts(): Promise<BlogPost[]> {
  try {
    const result = await blogService.list({ limit: "24" });
    if (result.posts.length >= 10) {
      return result.posts;
    }

    const bySlug = new Map(result.posts.map((post) => [post.slug, post]));
    for (const post of staticJournalPosts) {
      if (!bySlug.has(post.slug)) {
        bySlug.set(post.slug, post);
      }
    }

    return [...bySlug.values()].sort(
      (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
    );
  } catch {
    return staticJournalPosts;
  }
}

export async function loadJournalPost(slug: string): Promise<BlogPost | null> {
  try {
    return await blogService.getBySlug(slug);
  } catch {
    return getStaticJournalPost(slug);
  }
}
