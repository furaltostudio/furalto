import Image from "next/image";
import type { PageImage } from "@/config/images";
import { cn } from "@/lib/utils/cn";

type PageHeroWithImageProps = {
  eyebrow: string;
  title: string;
  description?: string;
  image: PageImage;
  className?: string;
};

export function PageHeroWithImage({
  eyebrow,
  title,
  description,
  image,
  className,
}: PageHeroWithImageProps) {
  return (
    <section className={cn("page-hero-image", className)}>
      <div className="page-hero-image-media" aria-hidden="true">
        <Image
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          priority
          loading="eager"
          sizes="100vw"
          className="page-hero-image-bg"
        />
        <div className="page-hero-image-overlay" />
        <div className="page-hero-image-vignette" />
      </div>

      <div className="container-app page-hero-image-content">
        <div className="page-hero-copy">
          <p className="page-hero-eyebrow page-hero-eyebrow-light">{eyebrow}</p>
          <span className="page-hero-rule" aria-hidden="true" />
          <h1 className="page-hero-title page-hero-title-light">{title}</h1>
          {description ? (
            <p className="page-hero-description page-hero-description-light">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
