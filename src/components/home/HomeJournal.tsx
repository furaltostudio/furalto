import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import type { BlogPost } from "@/services/blog.service";
import styles from "./HomeJournal.module.css";

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function HomeJournal({ posts }: { posts: BlogPost[] }) {
  const stories = posts.slice(0, 3);
  if (!stories.length) return null;

  return (
    <section className={styles.section} aria-labelledby="home-blog-title">
      <div className={`container-app ${styles.inner}`}>
        <Reveal className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Blog</p>
            <h2 id="home-blog-title" className={styles.title}>
              Stories that help you live with the furniture
            </h2>
            <p className={styles.lead}>
              Buying guides, materials, and studio notes — written so you stay, learn, and return.
            </p>
          </div>
          <Link href="/blog" className={styles.allLink}>
            All posts
            <ArrowRight strokeWidth={1.25} aria-hidden="true" />
          </Link>
        </Reveal>

        <ul className={styles.grid}>
          {stories.map((post, index) => (
            <li key={post.id}>
              <Reveal delay={index * 70}>
                <Link href={`/blog/${post.slug}`} className={styles.card}>
                  <span className={styles.media}>
                    {post.coverImage?.src ? (
                      <Image
                        src={post.coverImage.src}
                        alt=""
                        fill
                        sizes="(max-width: 860px) 100vw, 33vw"
                        className={styles.image}
                      />
                    ) : null}
                  </span>
                  <span className={styles.copy}>
                    <span className={styles.meta}>
                      {post.category}
                      <span aria-hidden="true"> · </span>
                      <time dateTime={post.publishedAt}>{formatShortDate(post.publishedAt)}</time>
                    </span>
                    <strong className={styles.cardTitle}>{post.title}</strong>
                    <span className={styles.excerpt}>{post.excerpt}</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
