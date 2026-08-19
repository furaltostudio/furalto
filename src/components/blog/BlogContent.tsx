import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/services/blog.service";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Blog.module.css";

function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function BlogIndexContent({ posts }: { posts: BlogPost[] }) {
  const [featured, ...rest] = posts;

  return (
    <div className={styles.page}>
      {featured ? (
        <section className={styles.featured}>
          <div className={styles.featuredMedia} aria-hidden={!featured.coverImage?.src}>
            {featured.coverImage?.src ? (
              <Image
                src={featured.coverImage.src}
                alt=""
                fill
                priority
                sizes="100vw"
                className={styles.featuredImage}
              />
            ) : null}
            <div className={styles.featuredShade} />
            <div className={styles.featuredGrain} />
          </div>

          <div className={`container-app ${styles.featuredFrame}`}>
            <Reveal className={styles.featuredCopy}>
              <p className={styles.eyebrowOnDark}>Journal · Featured</p>
              <p className={styles.featuredMeta}>
                <span>{featured.category}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={featured.publishedAt}>{formatBlogDate(featured.publishedAt)}</time>
              </p>
              <h1 className={styles.featuredTitle}>
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h1>
              <p className={styles.featuredLead}>{featured.excerpt}</p>
              <Link href={`/blog/${featured.slug}`} className={styles.featuredCta}>
                Read the story
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </section>
      ) : (
        <header className={styles.emptyHero}>
          <div className="container-app">
            <p className={styles.eyebrow}>Journal</p>
            <h1>Stories from the atelier</h1>
            <p className={styles.empty}>New journal entries are on the way.</p>
          </div>
        </header>
      )}

      {rest.length ? (
        <section className={styles.indexBody}>
          <div className="container-app">
            <Reveal className={styles.indexHead}>
              <p className={styles.eyebrow}>More stories</p>
              <h2>From the journal</h2>
              <span className={styles.rule} aria-hidden="true" />
            </Reveal>

            <ul className={styles.archive}>
              {rest.map((post, index) => (
                <li key={post.id}>
                  <Reveal delay={Math.min(index * 40, 240)}>
                    <Link href={`/blog/${post.slug}`} className={styles.archiveItem}>
                      <span className={styles.archiveMedia}>
                        {post.coverImage?.src ? (
                          <Image
                            src={post.coverImage.src}
                            alt={post.coverImage.alt || post.title}
                            fill
                            sizes="(max-width: 720px) 100vw, 200px"
                            className={styles.archiveImage}
                          />
                        ) : (
                          <span className={styles.cardFallback} />
                        )}
                      </span>
                      <span className={styles.archiveCopy}>
                        <span className={styles.meta}>
                          <span>{post.category}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={post.publishedAt}>{formatShortDate(post.publishedAt)}</time>
                        </span>
                        <strong className={styles.archiveTitle}>{post.title}</strong>
                        <span className={styles.archiveExcerpt}>{post.excerpt}</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderBody(body: string) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const nodes: ReactNode[] = [];
  let paragraphCount = 0;

  blocks.forEach((block, index) => {
    if (block.startsWith("## ")) {
      nodes.push(
        <h2 key={index} className={styles.articleSubhead}>
          {block.replace(/^##\s+/, "")}
        </h2>
      );
      return;
    }

    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").filter(Boolean);
      nodes.push(
        <ol key={index} className={styles.articleList}>
          {items.map((item) => (
            <li key={item}>{item.replace(/^\d+\.\s+/, "")}</li>
          ))}
        </ol>
      );
      return;
    }

    paragraphCount += 1;

    if (paragraphCount === 1) {
      nodes.push(
        <p key={index} className={`${styles.articleParagraph} ${styles.articleLead}`}>
          {block}
        </p>
      );
      return;
    }

    // Mid-essay pull quote: short reflective sentences after a few paragraphs
    if (paragraphCount === 4 && block.length < 160 && !block.includes("\n")) {
      nodes.push(
        <blockquote key={index} className={styles.pullQuote}>
          <p>{block}</p>
        </blockquote>
      );
      return;
    }

    nodes.push(
      <p key={index} className={styles.articleParagraph}>
        {block}
      </p>
    );
  });

  return nodes;
}

export function BlogArticleContent({
  post,
  related = [],
}: {
  post: BlogPost;
  related?: BlogPost[];
}) {
  return (
    <article className={styles.page}>
      <header className={styles.storyHero}>
        <div className={styles.storyMedia}>
          {post.coverImage?.src ? (
            <Image
              src={post.coverImage.src}
              alt={post.coverImage.alt || post.title}
              fill
              priority
              sizes="100vw"
              className={styles.storyImage}
            />
          ) : null}
          <div className={styles.storyShade} />
          <div className={styles.featuredGrain} />
        </div>

        <div className={`container-app ${styles.storyFrame}`}>
          <Reveal className={styles.storyCopy}>
            <Link href="/blog" className={styles.backLink}>
              <ArrowLeft strokeWidth={1.25} aria-hidden="true" />
              Journal
            </Link>
            <p className={styles.eyebrowOnDark}>{post.category}</p>
            <h1 className={styles.storyTitle}>{post.title}</h1>
            <p className={styles.storyByline}>
              <span>{post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
            </p>
            <p className={styles.storyDek}>{post.excerpt}</p>
          </Reveal>
        </div>
      </header>

      <div className={styles.storyBodyWrap}>
        <div className={styles.storyBody}>{renderBody(post.body)}</div>

        <footer className={styles.storyEnd}>
          <span className={styles.endMark} aria-hidden="true">
            ◆
          </span>
          <p className={styles.endNote}>
            Written for the Furalto journal — notes on craft, rooms, and the quiet work of making
            furniture that lasts.
          </p>
          <div className={styles.endLinks}>
            <Link href="/blog" className={styles.endLink}>
              All essays
            </Link>
            <Link href="/about" className={styles.endLink}>
              Our story
            </Link>
            <Link href="/collections" className={styles.endLink}>
              Shop collection
            </Link>
          </div>
        </footer>
      </div>

      {related.length ? (
        <section className={styles.related}>
          <div className="container-app">
            <Reveal className={styles.relatedHead}>
              <p className={styles.eyebrow}>Continue reading</p>
              <h2>Next from the journal</h2>
              <span className={styles.rule} aria-hidden="true" />
            </Reveal>

            <ul className={styles.relatedGrid}>
              {related.map((item, index) => (
                <li key={item.id}>
                  <Reveal delay={index * 60}>
                    <Link href={`/blog/${item.slug}`} className={styles.relatedCard}>
                      <span className={styles.relatedMedia}>
                        {item.coverImage?.src ? (
                          <Image
                            src={item.coverImage.src}
                            alt=""
                            fill
                            sizes="(max-width: 860px) 100vw, 33vw"
                            className={styles.relatedImage}
                          />
                        ) : (
                          <span className={styles.cardFallback} />
                        )}
                      </span>
                      <span className={styles.relatedCopy}>
                        <span className={styles.meta}>
                          {item.category}
                          <span aria-hidden="true"> · </span>
                          <time dateTime={item.publishedAt}>{formatShortDate(item.publishedAt)}</time>
                        </span>
                        <strong>{item.title}</strong>
                        <span className={styles.relatedArrow}>
                          Read
                          <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
