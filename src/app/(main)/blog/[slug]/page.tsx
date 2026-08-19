import { notFound } from "next/navigation";
import { BlogArticleContent } from "@/components/blog/BlogContent";
import { loadJournalPost, loadJournalPosts, staticJournalPosts } from "@/lib/content/journal";
import { createMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await loadJournalPost(slug);
  if (!post) {
    return createMetadata({
      title: "Blog",
      description: "Furalto blog article",
      path: `/blog/${slug}`,
    });
  }

  return createMetadata({
    title: post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    ogImage: post.coverImage?.src || "/home/furnitures_one.jpeg",
  });
}

export function generateStaticParams() {
  return staticJournalPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const [post, list] = await Promise.all([loadJournalPost(slug), loadJournalPosts()]);

  if (!post) {
    notFound();
  }

  return (
    <BlogArticleContent
      post={post}
      related={list.filter((item) => item.slug !== post.slug).slice(0, 3)}
    />
  );
}
