import Image from "next/image";
import Link from "next/link";
import type { CategoryShowcaseItem } from "@/config/category-showcase";
import { cn } from "@/lib/utils/cn";

type CollectionCategoryGridProps = {
  items: CategoryShowcaseItem[];
  className?: string;
};

export function CollectionCategoryGrid({ items, className }: CollectionCategoryGridProps) {
  return (
    <div className={cn("collections-index-grid", className)}>
      {items.map((item) => (
        <article key={item.id} className="collections-index-card">
          <Link href={item.href} className="collections-index-link">
            <div className="collections-index-media">
              <Image
                src={item.image}
                alt={item.imageAlt}
                width={item.imageWidth}
                height={item.imageHeight}
                loading="eager"
                unoptimized={item.image.startsWith("/")}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="collections-index-image"
              />
            </div>
            <div className="collections-index-body">
              <h2>{item.label}</h2>
              <p>{item.cta}</p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
