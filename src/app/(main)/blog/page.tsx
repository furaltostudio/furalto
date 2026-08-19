import { BlogIndexContent } from "@/components/blog/BlogContent";
import { loadJournalPosts } from "@/lib/content/journal";
import { createMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Furalto blog — craft notes, buying guides, and living well for modern Indian homes. Heritage skill, contemporary comfort.",
  path: "/blog",
  keywords: [
    "Furalto blog",
    "luxury furniture India blog",
    "sofa buying guide India",
    "furniture design Delhi",
    "Indian home design tips",
  ],
});

export default async function BlogPage() {
  const posts = await loadJournalPosts();
  return <BlogIndexContent posts={posts} />;
}
