import { Reveal } from "@/components/ui/Reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container-app py-12 sm:py-16 lg:py-20">
        <Reveal className="page-hero-content mx-auto max-w-4xl text-center">
          <p className="page-hero-eyebrow">{eyebrow}</p>
          <h1 className="page-hero-title mt-4">{title}</h1>
          {description ? (
            <p className="page-hero-description mx-auto mt-5">{description}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
