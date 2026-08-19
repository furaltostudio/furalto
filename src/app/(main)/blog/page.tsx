import { BlogIndexContent } from "@/components/blog/BlogContent";
import { blogService, type BlogPost } from "@/services/blog.service";
import { createMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Journal",
  description:
    "Furalto journal — craft notes, buying guides, and living well for modern Indian homes. Heritage skill, contemporary comfort.",
  path: "/blog",
  keywords: ["Furalto blog", "furniture design journal", "Indian home design tips"],
});

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    const result = await blogService.list({ limit: "24" });
    posts = result.posts;
  } catch {
    posts = [];
  }

  return <BlogIndexContent posts={posts} />;
}
