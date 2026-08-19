import { notFound } from "next/navigation";
import { BlogArticleContent } from "@/components/blog/BlogContent";
import { blogService } from "@/services/blog.service";
import { createMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  try {
    const post = await blogService.getBySlug(slug);
    return createMetadata({
      title: post.title,
      description: post.seoDescription || post.excerpt,
      path: `/blog/${post.slug}`,
      ogImage: post.coverImage?.src || "/home/furnitures_one.jpeg",
    });
  } catch {
    return createMetadata({
      title: "Journal",
      description: "Furalto journal article",
      path: `/blog/${slug}`,
    });
  }
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;

  const result = await Promise.all([
    blogService.getBySlug(slug),
    blogService.list({ limit: "6" }),
  ])
    .then(([post, list]) => ({
      post,
      related: list.posts.filter((item) => item.slug !== post.slug).slice(0, 3),
    }))
    .catch(() => null);

  if (!result) {
    notFound();
  }

  return <BlogArticleContent post={result.post} related={result.related} />;
}
