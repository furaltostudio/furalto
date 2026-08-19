import { categoryImages, type PageImage } from "@/config/images";
import { siteConfig } from "@/config/site";
import { homeBrandStrip, homeDiscoverItems } from "@/config/home";
import { customServicesSection } from "@/config/custom-services";
import {
  homeCustomStudioDefaults,
  type HomeCustomStudioContent,
} from "@/config/home-custom-studio";
import {
  inspirationSlides as fallbackInspirationSlides,
  parseInspirationSlides,
  type InspirationSlide,
} from "@/config/inspirations";
import {
  craftStoryDefaults,
  type CraftStoryContent,
} from "@/config/craft-story";
import { businessContact, contactReasons } from "@/config/contact";
import { showroomLocations, showroomServices } from "@/config/showrooms";
import {
  testimonials as fallbackTestimonials,
  testimonialsPage,
  testimonialsSection,
  type Testimonial,
} from "@/config/testimonials";
import { fetchContentByKey } from "@/lib/content/fetch";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length ? items : fallback;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function resolveImage(imageKey: unknown, fallback: PageImage): PageImage {
  if (typeof imageKey === "string" && imageKey in categoryImages) {
    return categoryImages[imageKey as keyof typeof categoryImages];
  }
  return fallback;
}

function parseTestimonials(value: unknown, fallback: Testimonial[]): Testimonial[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }

  const items = value
    .map((item, index) => {
      const row = (item || {}) as Record<string, unknown>;
      const base = fallback[index];
      return {
        id: asString(row.id, base?.id || `story-${index}`),
        quote: asString(row.quote, base?.quote || ""),
        name: asString(row.name, base?.name || ""),
        role: asString(row.role, base?.role || ""),
        location: asString(row.location, base?.location || ""),
        purchase: asString(row.purchase, base?.purchase || ""),
        year: asString(row.year, base?.year || ""),
        image: asString(row.image, base?.image || ""),
        imageAlt: asString(row.imageAlt, base?.imageAlt || ""),
      } satisfies Testimonial;
    })
    .filter((item) => item.quote && item.name);

  return items.length ? items : fallback;
}

export type CmsSiteSettings = {
  tagline: string;
  subtagline: string;
  announcementText: string;
  announcementCta: string;
  announcementHref: string;
  footerDescription: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  gstin: string;
  instagram: string;
  pinterest: string;
  facebook: string;
  youtube: string;
};

export async function getSiteSettings(): Promise<CmsSiteSettings> {
  const entry = await fetchContentByKey("site.settings");
  const data = (entry?.data || {}) as Record<string, unknown>;

  return {
    tagline: asString(data.tagline, siteConfig.tagline),
    subtagline: asString(data.subtagline, siteConfig.subtagline),
    announcementText: asString(data.announcementText, siteConfig.announcement.text),
    announcementCta: asString(data.announcementCta, siteConfig.announcement.cta),
    announcementHref: asString(data.announcementHref, siteConfig.announcement.href),
    footerDescription: asString(data.footerDescription, siteConfig.footerDescription),
    email: asString(data.email, businessContact.email),
    phone: asString(data.phone, businessContact.phone),
    whatsapp: asString(data.whatsapp, businessContact.whatsapp),
    address: asString(data.address, businessContact.address),
    hours: asString(data.hours, businessContact.hours),
    gstin: asString(data.gstin, businessContact.gstin),
    instagram: asString(data.instagram, siteConfig.social.instagram),
    pinterest: asString(data.pinterest, siteConfig.social.pinterest),
    facebook: asString(data.facebook, siteConfig.social.facebook),
    youtube: asString(data.youtube, siteConfig.social.youtube),
  };
}

export async function getHomepageContent() {
  const [entry, settings, testimonialsPageEntry] = await Promise.all([
    fetchContentByKey("homepage"),
    getSiteSettings(),
    fetchContentByKey("page.testimonials"),
  ]);

  const data = (entry?.data || {}) as Record<string, unknown>;
  const hero = (isPlainObject(data.hero) ? data.hero : {}) as Record<string, unknown>;
  const brand = (isPlainObject(data.brandStrip) ? data.brandStrip : {}) as Record<string, unknown>;
  const discover = (isPlainObject(data.discover) ? data.discover : {}) as Record<string, unknown>;
  const services = (isPlainObject(data.customServices)
    ? data.customServices
    : {}) as Record<string, unknown>;
  const studio = (isPlainObject(data.customStudio)
    ? data.customStudio
    : {}) as Record<string, unknown>;
  const testimonialsRaw = (isPlainObject(data.testimonials)
    ? data.testimonials
    : {}) as Record<string, unknown>;
  const categoryShowcase = (isPlainObject(data.categoryShowcase)
    ? data.categoryShowcase
    : {}) as Record<string, unknown>;
  const inspirations = (isPlainObject(data.inspirations)
    ? data.inspirations
    : {}) as Record<string, unknown>;
  const craftStoryRaw = (isPlainObject(data.craftStory)
    ? data.craftStory
    : {}) as Record<string, unknown>;

  const brandItems = Array.isArray(brand.items)
    ? brand.items
        .map((item, index) => {
          const row = (item || {}) as Record<string, unknown>;
          const fallback = homeBrandStrip[index];
          if (!fallback && !asString(row.label)) return null;
          return {
            id: asString(row.id, fallback?.id || `item-${index}`),
            label: asString(row.label, fallback?.label || ""),
            detail: asString(row.detail, fallback?.detail || ""),
            href: asString(row.href, fallback?.href || "/"),
          };
        })
        .filter(Boolean)
    : [...homeBrandStrip];

  const discoverItems = Array.isArray(discover.items)
    ? discover.items
        .map((item, index) => {
          const row = (item || {}) as Record<string, unknown>;
          const fallback = homeDiscoverItems[index];
          if (!fallback && !asString(row.title)) return null;
          return {
            id: asString(row.id, fallback?.id || `discover-${index}`),
            title: asString(row.title, fallback?.title || ""),
            description: asString(row.description, fallback?.description || ""),
            href: asString(row.href, fallback?.href || "/"),
            cta: asString(row.cta, fallback?.cta || "Explore"),
            image: resolveImage(row.imageKey, fallback?.image || categoryImages.inspiration),
          };
        })
        .filter(Boolean)
    : homeDiscoverItems;

  const showcaseItems = Array.isArray(categoryShowcase.items)
    ? categoryShowcase.items
        .map((item) => {
          const row = (item || {}) as Record<string, unknown>;
          return {
            id: asString(row.id),
            label: asString(row.label),
            cta: asString(row.cta),
          };
        })
        .filter((item) => item.label)
    : [];

  return {
    settings,
    hero: {
      eyebrow: asString(hero.eyebrow, siteConfig.hero.eyebrow),
      subtitle: asString(hero.subtitle, siteConfig.hero.subtitle),
      video: asString(hero.video, siteConfig.hero.video),
      tagline: settings.tagline,
      primaryCta: {
        label: asString(hero.primaryCtaLabel, siteConfig.hero.primaryCta.label),
        href: asString(hero.primaryCtaHref, siteConfig.hero.primaryCta.href),
      },
      secondaryCta: {
        label: asString(hero.secondaryCtaLabel, siteConfig.hero.secondaryCta.label),
        href: asString(hero.secondaryCtaHref, siteConfig.hero.secondaryCta.href),
      },
    },
    brandStrip: brandItems as Array<{ id: string; label: string; detail: string; href: string }>,
    inspirationsTitle: asString(inspirations.title, "Product Inspirations"),
    inspirationSlides: (() => {
      const parsed = parseInspirationSlides(inspirations.slides);
      return parsed.length > 0 ? parsed : fallbackInspirationSlides;
    })() as InspirationSlide[],
    craftStory: (() => {
      const isLegacy = !asString(craftStoryRaw.titleLine1);
      const trustPoints = Array.isArray(craftStoryRaw.trustPoints)
        ? craftStoryRaw.trustPoints
            .map((item, index) => {
              const row = (item || {}) as Record<string, unknown>;
              const fallback = craftStoryDefaults.trustPoints[index];
              return {
                id: asString(row.id, fallback?.id || `trust-${index}`),
                title: asString(row.title, fallback?.title || ""),
                detail: asString(row.detail, fallback?.detail || ""),
              };
            })
            .filter((item) => item.title)
        : [...craftStoryDefaults.trustPoints];

      const steps = Array.isArray(craftStoryRaw.steps)
        ? craftStoryRaw.steps
            .map((item, index) => {
              const row = (item || {}) as Record<string, unknown>;
              const fallback = craftStoryDefaults.steps[index];
              const rawSrc = asString(row.imageSrc, fallback?.imageSrc || "");
              const imageSrc =
                rawSrc.includes("images.unsplash.com") && fallback?.imageSrc
                  ? fallback.imageSrc
                  : rawSrc;
              return {
                id: asString(row.id, fallback?.id || `step-${index}`),
                title: asString(row.title, fallback?.title || ""),
                detail: asString(row.detail, fallback?.detail || ""),
                imageSrc,
                imageAlt: asString(row.imageAlt, fallback?.imageAlt || ""),
              };
            })
            .filter((item) => item.title && item.imageSrc)
        : [...craftStoryDefaults.steps];

      return {
        mastheadLeft: asString(craftStoryRaw.mastheadLeft, craftStoryDefaults.mastheadLeft),
        mastheadCenter: asString(
          craftStoryRaw.mastheadCenter,
          craftStoryDefaults.mastheadCenter
        ),
        mastheadRight: asString(craftStoryRaw.mastheadRight, craftStoryDefaults.mastheadRight),
        brandMark: asString(craftStoryRaw.brandMark, craftStoryDefaults.brandMark),
        brandTagline: asString(craftStoryRaw.brandTagline, craftStoryDefaults.brandTagline),
        titleLine1: asString(craftStoryRaw.titleLine1, craftStoryDefaults.titleLine1),
        titleAccent1: asString(craftStoryRaw.titleAccent1, craftStoryDefaults.titleAccent1),
        titleLine2: asString(craftStoryRaw.titleLine2, craftStoryDefaults.titleLine2),
        titleAccent2: asString(craftStoryRaw.titleAccent2, craftStoryDefaults.titleAccent2),
        subtitle: asString(craftStoryRaw.subtitle, craftStoryDefaults.subtitle),
        body: asString(craftStoryRaw.body, craftStoryDefaults.body),
        heroImageSrc: isLegacy
          ? craftStoryDefaults.heroImageSrc
          : asString(craftStoryRaw.heroImageSrc, craftStoryDefaults.heroImageSrc).includes(
                "images.unsplash.com/photo-1565193566173"
              ) ||
              asString(craftStoryRaw.heroImageSrc, "").includes(
                "images.unsplash.com/photo-1581578731548"
              ) ||
              asString(craftStoryRaw.heroImageSrc, "").includes(
                "images.unsplash.com/photo-1503387762"
              )
            ? craftStoryDefaults.heroImageSrc
            : asString(craftStoryRaw.heroImageSrc, craftStoryDefaults.heroImageSrc),
        heroImageAlt: asString(craftStoryRaw.heroImageAlt, craftStoryDefaults.heroImageAlt),
        trustPoints: trustPoints.length ? trustPoints : [...craftStoryDefaults.trustPoints],
        processEyebrow: asString(
          craftStoryRaw.processEyebrow,
          craftStoryDefaults.processEyebrow
        ),
        steps: steps.length ? steps : [...craftStoryDefaults.steps],
        indiaLabel: asString(craftStoryRaw.indiaLabel, craftStoryDefaults.indiaLabel),
        quote: asString(craftStoryRaw.quote, craftStoryDefaults.quote),
        quoteAccent: asString(craftStoryRaw.quoteAccent, craftStoryDefaults.quoteAccent),
        siteUrl: asString(craftStoryRaw.siteUrl, craftStoryDefaults.siteUrl),
        ctaLabel: asString(craftStoryRaw.ctaLabel, craftStoryDefaults.ctaLabel),
        ctaHref: asString(craftStoryRaw.ctaHref, craftStoryDefaults.ctaHref),
      } satisfies CraftStoryContent;
    })(),
    categoryShowcase: {
      eyebrow: asString(categoryShowcase.eyebrow, "Collections"),
      title: asString(categoryShowcase.title, "Explore by Category"),
      lead: asString(
        categoryShowcase.lead,
        "Browse furniture by type — sofas, beds, chairs, and dining sets."
      ),
      items: showcaseItems,
    },
    discover: {
      eyebrow: asString(discover.eyebrow, "Discover"),
      title: asString(discover.title, "Start Your Next Room"),
      lead: asString(
        discover.lead,
        "Collections, inspiration, showrooms, and design services — everything to shape a home with intention."
      ),
      items: discoverItems as typeof homeDiscoverItems,
    },
    customServices: {
      eyebrow: asString(services.eyebrow, customServicesSection.eyebrow),
      title: asString(services.title, customServicesSection.title),
      description: asString(services.description, customServicesSection.description),
      perks: asStringArray(services.perks, [...customServicesSection.perks]),
      cta: {
        label: asString(services.ctaLabel, customServicesSection.cta.label),
        href: asString(services.ctaHref, customServicesSection.cta.href),
      },
      image: {
        src: asString(services.imageSrc, customServicesSection.image.src),
        alt: asString(services.imageAlt, customServicesSection.image.alt),
        width: customServicesSection.image.width,
        height: customServicesSection.image.height,
      },
    },
    customStudio: {
      eyebrow: asString(studio.eyebrow, homeCustomStudioDefaults.eyebrow),
      title: asString(studio.title, homeCustomStudioDefaults.title),
      lead: asString(studio.lead, homeCustomStudioDefaults.lead),
      ctaLabel: asString(studio.ctaLabel, homeCustomStudioDefaults.ctaLabel),
      ctaHref: asString(studio.ctaHref, homeCustomStudioDefaults.ctaHref),
      imageSrc: asString(studio.imageSrc, homeCustomStudioDefaults.imageSrc),
      imageAlt: asString(studio.imageAlt, homeCustomStudioDefaults.imageAlt),
      materialsLabel: asString(
        studio.materialsLabel,
        homeCustomStudioDefaults.materialsLabel
      ),
      priceFrom: asString(studio.priceFrom, homeCustomStudioDefaults.priceFrom),
      timeNote: asString(studio.timeNote, homeCustomStudioDefaults.timeNote),
      steps: Array.isArray(studio.steps)
        ? studio.steps
            .map((item, index) => {
              const row = (item || {}) as Record<string, unknown>;
              const fallback = homeCustomStudioDefaults.steps[index];
              return {
                index: asString(row.index, fallback?.index || String(index + 1).padStart(2, "0")),
                title: asString(row.title, fallback?.title || ""),
                detail: asString(row.detail, fallback?.detail || ""),
              };
            })
            .filter((item) => item.title)
        : [...homeCustomStudioDefaults.steps],
      materials: Array.isArray(studio.materials)
        ? studio.materials
            .map((item, index) => {
              const row = (item || {}) as Record<string, unknown>;
              const fallback = homeCustomStudioDefaults.materials[index];
              return {
                id: asString(row.id, fallback?.id || `material-${index}`),
                label: asString(row.label, fallback?.label || ""),
                tone: asString(row.tone, fallback?.tone || ""),
              };
            })
            .filter((item) => item.label && item.tone)
        : [...homeCustomStudioDefaults.materials],
    } satisfies HomeCustomStudioContent,
    testimonials: (() => {
      const pageData = (testimonialsPageEntry?.data || {}) as Record<string, unknown>;
      // Stories live only on page.testimonials (Admin → Website → Client Stories).
      // Homepage holds section chrome + how many stories to feature.
      const allStories = parseTestimonials(pageData.items, [...fallbackTestimonials]);
      const featuredCount = Math.max(
        1,
        Number.parseInt(asString(testimonialsRaw.featuredCount, "5"), 10) || 5
      );

      return {
        eyebrow: asString(testimonialsRaw.eyebrow, testimonialsSection.eyebrow),
        title: asString(testimonialsRaw.title, testimonialsSection.title),
        lead: asString(testimonialsRaw.lead, testimonialsSection.lead),
        ctaLabel: asString(testimonialsRaw.ctaLabel, testimonialsSection.ctaLabel),
        ctaHref: asString(testimonialsRaw.ctaHref, testimonialsSection.ctaHref),
        items: allStories.slice(0, featuredCount),
      };
    })(),
  };
}

export async function getTestimonialsPageContent() {
  const entry = await fetchContentByKey("page.testimonials");
  const data = (entry?.data || {}) as Record<string, unknown>;

  return {
    title: asString(data.title, testimonialsPage.title),
    description: asString(data.description, testimonialsPage.description),
    introEyebrow: asString(data.introEyebrow, testimonialsPage.introEyebrow),
    introLead: asString(data.introLead, testimonialsPage.introLead),
    heroImage: {
      src: asString(data.heroImageSrc, testimonialsPage.heroImage.src),
      alt: asString(data.heroImageAlt, testimonialsPage.heroImage.alt),
      width: testimonialsPage.heroImage.width,
      height: testimonialsPage.heroImage.height,
    },
    closeEyebrow: asString(data.closeEyebrow, "Visit us"),
    closeTitle: asString(
      data.closeTitle,
      "Sit with the pieces before you decide"
    ),
    closeLead: asString(
      data.closeLead,
      "Book a quiet hour in a showroom, or start a custom piece with our design team."
    ),
    items: parseTestimonials(data.items, [...fallbackTestimonials]),
  };
}

export async function getContactPageContent() {
  const [entry, settings] = await Promise.all([
    fetchContentByKey("page.contact"),
    getSiteSettings(),
  ]);
  const data = (entry?.data || {}) as Record<string, unknown>;

  const reasons = Array.isArray(data.reasons)
    ? data.reasons
        .map((item, index) => {
          const row = (item || {}) as Record<string, unknown>;
          const fallback = contactReasons[index];
          return {
            title: asString(row.title, fallback?.title || ""),
            description: asString(row.description, fallback?.description || ""),
          };
        })
        .filter((item) => item.title)
    : [...contactReasons];

  return {
    settings,
    eyebrow: asString(data.eyebrow, "Contact"),
    title: asString(data.title, "We're here to help"),
    lead: asString(
      data.lead,
      "Questions about products, orders, or a design project — reach the Furalto studio."
    ),
    reasons,
  };
}

export async function getShowroomsPageContent() {
  const entry = await fetchContentByKey("page.showrooms");
  const data = (entry?.data || {}) as Record<string, unknown>;

  const cmsLocations = Array.isArray(data.locations) ? data.locations : [];
  const locations = showroomLocations.map((fallback) => {
    const row = (cmsLocations.find((item) => {
      const candidate = (item || {}) as Record<string, unknown>;
      return asString(candidate.id) === fallback.id;
    }) || {}) as Record<string, unknown>;
    return {
      id: fallback.id,
      city: asString(row.city, fallback.city),
      name: asString(row.name, fallback.name),
      address: asString(row.address, fallback.address),
      hours: asString(row.hours, fallback.hours),
      phone: asString(row.phone, fallback.phone),
      email: asString(row.email, fallback.email),
      highlights: asStringArray(row.highlights, [...fallback.highlights]),
      image: resolveImage(row.imageKey, fallback.image),
    };
  });

  const services = Array.isArray(data.services)
    ? data.services
        .map((item, index) => {
          const row = (item || {}) as Record<string, unknown>;
          const fallback = showroomServices[index];
          return {
            title: asString(row.title, fallback?.title || ""),
            description: asString(row.description, fallback?.description || ""),
          };
        })
        .filter((item) => item.title)
    : [...showroomServices];

  return {
    eyebrow: asString(data.eyebrow, "Visit"),
    title: asString(data.title, "Our Showrooms"),
    lead: asString(
      data.lead,
      "Experience materials, silhouettes, and finishes in person across India."
    ),
    locations: locations as typeof showroomLocations,
    services,
  };
}

export async function getCollectionsHubContent() {
  const entry = await fetchContentByKey("page.collections");
  const data = (entry?.data || {}) as Record<string, unknown>;
  return {
    eyebrow: asString(data.eyebrow, "Shop"),
    title: asString(data.title, "All Collections"),
    description: asString(
      data.description,
      "Discover furniture for every room — from outdoor terraces to serene bedrooms."
    ),
  };
}

export async function getCollectionCategoryMeta(category: string) {
  const entry = await fetchContentByKey("page.collections.meta");
  const data = (entry?.data || {}) as Record<string, unknown>;
  const list = Array.isArray(data.categories) ? data.categories : [];
  const match = list.find((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return asString(row.id) === category;
  }) as Record<string, unknown> | undefined;

  if (!match) return null;

  return {
    eyebrow: asString(match.eyebrow),
    title: asString(match.title),
    description: asString(match.description),
  };
}

export async function getInspirationHubContent() {
  const entry = await fetchContentByKey("page.inspiration");
  const data = (entry?.data || {}) as Record<string, unknown>;
  return {
    eyebrow: asString(data.eyebrow, "Design"),
    title: asString(data.title, "Inspirational Galleries"),
    description: asString(
      data.description,
      "Browse room galleries and shop the look with immersive, shoppable edits."
    ),
  };
}

export async function getInspirationRoomMeta(room: string) {
  const entry = await fetchContentByKey("page.inspiration.rooms");
  const data = (entry?.data || {}) as Record<string, unknown>;
  const list = Array.isArray(data.rooms) ? data.rooms : [];
  const match = list.find((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return asString(row.id) === room;
  }) as Record<string, unknown> | undefined;

  if (!match) return null;

  return {
    eyebrow: asString(match.eyebrow),
    title: asString(match.title),
    description: asString(match.description),
  };
}

export async function getNavigationLabels() {
  const entry = await fetchContentByKey("site.navigation");
  const data = (entry?.data || {}) as Record<string, unknown>;
  if (!Array.isArray(data.items)) return [];
  return data.items
    .map((item) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        label: asString(row.label),
        href: asString(row.href),
      };
    })
    .filter((item) => item.label && item.href);
}

export async function getCategoryShowcaseContent() {
  const content = await getHomepageContent();
  return content.categoryShowcase;
}

export async function getHomepageInspirationsTitle() {
  const content = await getHomepageContent();
  return content.inspirationsTitle;
}
