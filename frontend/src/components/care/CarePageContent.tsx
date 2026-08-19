import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { ServiceHubStrip } from "@/components/shared/ServiceHubStrip";
import { Reveal } from "@/components/ui/Reveal";
import {
  careEssentials,
  careRoomItems,
  customerCareHub,
} from "@/config/customer-care";
import { categoryImages } from "@/config/images";

export function CarePageContent({
  title = "Care & Maintenance",
  description = "Preserve the beauty of your Furalto pieces with room-by-room guidance and material-specific care.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <>
      <PageHeroWithImage
        eyebrow="Product Care"
        title={title}
        description={description}
        image={categoryImages.decor}
      />

      <ServiceHubStrip links={customerCareHub} label="Customer Care" />

      <section className="care-index">
        <div className="container-app care-index-inner">
          <Reveal className="care-index-header">
            <p className="care-index-eyebrow">By Room</p>
            <span className="care-index-rule" aria-hidden="true" />
            <h2>Care Guides by Collection</h2>
            <p className="care-index-lead">
              Select your room to view tailored instructions for fabrics, woods, stone, and
              finishes.
            </p>
          </Reveal>

          <Reveal className="care-index-grid reveal-stagger">
            {careRoomItems.map((room, index) => (
              <article key={room.id} className="care-index-card">
                <Link href={room.href} className="care-index-link">
                  <div className="care-index-media">
                    <Image
                      src={room.image.src}
                      alt={room.image.alt}
                      width={room.image.width}
                      height={room.image.height}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="care-index-image"
                    />
                    <span className="care-index-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="care-index-body">
                    <h3>{room.title}</h3>
                    <p>{room.description}</p>
                    <span className="care-index-cta">
                      View Guide
                      <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </Reveal>

          <Reveal className="care-essentials">
            <div className="care-essentials-header">
              <p className="care-essentials-eyebrow">Essentials</p>
              <h2>Everyday Care Principles</h2>
            </div>
            <div className="care-essentials-grid">
              {careEssentials.map((item, index) => (
                <article key={item.title} className="care-essential-card">
                  <span className="care-essential-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
