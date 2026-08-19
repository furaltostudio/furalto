import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { ServiceHubStrip } from "@/components/shared/ServiceHubStrip";
import { Reveal } from "@/components/ui/Reveal";
import { companyHub } from "@/config/customer-care";
import {
  showroomLocations,
  showroomServices,
  showroomsHeroImage,
  type ShowroomLocation,
} from "@/config/showrooms";

type ShowroomsPageContentProps = {
  title?: string;
  description?: string;
  introEyebrow?: string;
  introCopy?: string;
  locations?: ShowroomLocation[];
  services?: Array<{ title: string; description: string }>;
};

export function ShowroomsPageContent({
  title = "Our Showroom",
  description = "Experience Furalto collections at our Rohini Design Studio — private consultations, full-room vignettes, and materials at true scale.",
  introEyebrow = "Rohini · New Delhi",
  introCopy = "Our Rohini Design Studio is a working design space — not a warehouse floor. Walk through fully composed rooms, compare materials at scale, and work with specialists who understand proportion, light, and the way furniture lives in your home.",
  locations = showroomLocations,
  services = [...showroomServices],
}: ShowroomsPageContentProps) {
  return (
    <>
      <PageHeroWithImage
        eyebrow="Our Company"
        title={title}
        description={description}
        image={showroomsHeroImage}
      />

      <ServiceHubStrip links={companyHub} label="Our Company" />

      <section className="showrooms-intro">
        <div className="container-app showrooms-intro-wrap">
          <Reveal className="showrooms-intro-inner">
            <p className="showrooms-intro-eyebrow">{introEyebrow}</p>
            <span className="showrooms-intro-rule" aria-hidden="true" />
            <p className="showrooms-intro-copy">{introCopy}</p>
          </Reveal>
        </div>
      </section>

      <section className="showrooms-locations">
        <div className="container-app pb-14 sm:pb-20">
          <Reveal className="showrooms-location-grid reveal-stagger">
            {locations.map((location, index) => (
              <article key={location.id} className="showroom-card">
                <div className="showroom-card-media">
                  <Image
                    src={location.image.src}
                    alt={`${location.name} — ${location.image.alt}`}
                    width={location.image.width}
                    height={location.image.height}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="showroom-card-image"
                  />
                  <span className="showroom-card-city">{location.city}</span>
                  <span className="showroom-card-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="showroom-card-body">
                  <h2>{location.name}</h2>

                  <ul className="showroom-card-details">
                    <li>
                      <MapPin aria-hidden="true" />
                      <span>{location.address}</span>
                    </li>
                    <li>
                      <Clock aria-hidden="true" />
                      <span>{location.hours}</span>
                    </li>
                    <li>
                      <Phone aria-hidden="true" />
                      <a href={`tel:${location.phone.replace(/\s/g, "")}`}>{location.phone}</a>
                    </li>
                    <li>
                      <Mail aria-hidden="true" />
                      <a href={`mailto:${location.email}`}>{location.email}</a>
                    </li>
                  </ul>

                  <ul className="showroom-card-highlights">
                    {location.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <Link href="/appointments" className="showroom-card-cta">
                    Book a Visit
                    <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="showrooms-services">
        <div className="container-app pb-14 sm:pb-20">
          <Reveal className="showrooms-services-header">
            <p className="showrooms-services-eyebrow">Your Visit</p>
            <span className="showrooms-services-rule" aria-hidden="true" />
            <h2>What to Expect</h2>
          </Reveal>

          <Reveal className="showrooms-services-grid reveal-stagger">
            {services.map((service, index) => (
              <article key={service.title} className="showroom-service-card">
                <span className="showroom-service-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </Reveal>

          <Reveal className="showrooms-cta-band">
            <div className="showrooms-cta-copy">
              <h2>Plan Your Visit</h2>
              <p>
                Appointments are recommended for private consultations and trade project reviews.
                Walk-ins are welcome during showroom hours.
              </p>
            </div>
            <div className="showrooms-cta-actions">
              <Link href="/appointments" className="showrooms-cta-primary">
                Make an Appointment
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </Link>
              <Link href="/contact" className="showrooms-cta-secondary">
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
