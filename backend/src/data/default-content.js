/**
 * Default website content for the CMS (editable in Admin → Website).
 * Seeded with $setOnInsert so existing admin edits are preserved.
 */
const cmsStaticPages = require("./cms-static-pages.json");
const cmsExtraPages = require("./cms-extra-pages.json");
const cmsRemaining = require("./cms-remaining");
const cmsTestimonials = require("./cms-testimonials.json");

const coreContent = [
  {
    key: "site.settings",
    title: "Site Settings",
    type: "settings",
    description: "Announcement bar, brand tagline, contact details, and social links site-wide.",
    data: {
      pagePath: "/",
      tagline: "Elevate Every Detail",
      subtagline: "Luxury Furniture",
      announcementText: "₹2,000 off on prepaid orders · Pan India",
      announcementCta: "Shop now",
      announcementHref: "/collections",
      footerDescription:
        "Furalto — designer furniture from true Indian craftsmanship. A legacy begun in 1979, carried forward with heart.",
      email: "furaltostudio@gmail.com",
      phone: "+91 93114 87655",
      whatsapp: "+91 93114 87655",
      address:
        "Office No. 103–104, First Floor, Pocket 5, Sector 24, Rohini, New Delhi 110085",
      hours: "Monday – Saturday · 9am – 7pm IST",
      gstin: "07AAICG5542Q1Z0",
      instagram: "https://instagram.com/furalto",
      facebook: "https://facebook.com/furalto",
      pinterest: "",
      youtube: "",
    },
  },
  {
    key: "homepage",
    title: "Homepage",
    type: "homepage",
    description: "All homepage sections — hero, highlights, inspirations, categories, custom studio, and services.",
    data: {
      pagePath: "/",
      hero: {
        eyebrow: "Luxury Furniture · Est. 1979",
        subtitle: "Handcrafted pieces of quiet distinction.",
        video: "/home/hero_video.mp4",
        primaryCtaLabel: "View Collections",
        primaryCtaHref: "/collections",
        secondaryCtaLabel: "Our Showrooms",
        secondaryCtaHref: "/showrooms",
      },
      brandStrip: {
        items: [
          { id: "craft", label: "Made in India", detail: "Skilled artisan craft", href: "/about" },
          {
            id: "showrooms",
            label: "Rohini Design Studio",
            detail: "Sector 24 · New Delhi",
            href: "/showrooms",
          },
          {
            id: "delivery",
            label: "White-Glove Delivery",
            detail: "In-room placement",
            href: "/track-order",
          },
          {
            id: "consult",
            label: "Design Consultation",
            detail: "In-store or virtual",
            href: "/appointments",
          },
        ],
      },
      inspirations: {
        title: "Product Inspirations",
        // slides managed via Admin → Shop the Look (/admin/inspirations)
        // defaults live in frontend/src/config/inspirations.ts (sofas + beds)
      },
      craftStory: {
        mastheadLeft: "Est. 1979",
        mastheadCenter: "Furalto India",
        mastheadRight: "Legacy",
        brandMark: "Furalto",
        brandTagline: "Crafted with heart. Built on legacy.",
        titleLine1: "Heritage",
        titleAccent1: "skill.",
        titleLine2: "Modern",
        titleAccent2: "living.",
        subtitle: "From a master’s workshop to homes across India",
        body:
          "Furalto continues a craft begun in 1979 by Late Ramchandar — a master carpenter who led more than 100 skilled hands. Today his daughter Gayatri carries that promise forward, uniting India’s finest artisans to create designer furniture with integrity, heritage, and modern luxury.",
        heroImageSrc: "/home/furnitures_four.jpeg",
        heroImageAlt: "Artisan-crafted furniture in a warm Furalto interior",
        processEyebrow: "From workshop to home",
        indiaLabel: "Made in India. Built on legacy.",
        quote: "Every piece is a continuation of a life spent shaping wood into homes people love.",
        quoteAccent: "Crafted with heart. Choose Furalto.",
        siteUrl: "www.furalto.com",
        ctaLabel: "Our story",
        ctaHref: "/about",
        trustPoints: [
          {
            id: "legacy",
            title: "Workshop since 1979",
            detail: "A lifetime of joinery, carving, and finishing discipline.",
          },
          {
            id: "artisans",
            title: "Artisan partnership",
            detail: "India’s finest makers under one atelier standard.",
          },
        ],
        steps: [
          {
            id: "makers",
            title: "Expert makers",
            detail: "Seasoned hands shape timber, joinery, and silhouette.",
            imageSrc: "/home/furnitures_one.jpeg",
            imageAlt: "Crafted outdoor furniture shaped with care",
          },
          {
            id: "materials",
            title: "Premium materials",
            detail: "Hardwoods, fabrics, and finishes chosen to age with grace.",
            imageSrc: "/home/decor_showcase.jpeg",
            imageAlt: "Premium materials and finishes",
          },
          {
            id: "precision",
            title: "Precision work",
            detail: "Stitching, sanding, and fitting — measured to the millimetre.",
            imageSrc: "/home/furnitures_two.jpeg",
            imageAlt: "Refined upholstery and detailing",
          },
          {
            id: "delivered",
            title: "Masterpiece delivered",
            detail: "Finished pieces, white-glove placed in your room.",
            imageSrc: "/home/furnitures_five.jpeg",
            imageAlt: "Finished luxury seating in a living room",
          },
        ],
      },
      categoryShowcase: {
        eyebrow: "Collections",
        title: "Explore by Category",
        lead: "Heritage craftsmanship shaped into modern pieces — sofas, beds, chairs, and dining.",
        items: [
          { id: "sofas", label: "Sofas", cta: "Discover Sofas" },
          { id: "beds", label: "Beds", cta: "Discover Beds" },
          { id: "chairs", label: "Chairs", cta: "Discover Chairs" },
          { id: "dining", label: "Dining Sets", cta: "Discover Dining Sets" },
        ],
      },
      discover: {
        eyebrow: "Discover",
        title: "Start Your Next Room",
        lead: "Collections, inspiration, showrooms, and design services — everything to shape a home with intention.",
        items: [
          {
            id: "collections",
            title: "All Collections",
            description: "Explore sofas, beds, dining, and more in one curated index.",
            href: "/collections",
            cta: "View Collections",
            imageKey: "living-room",
          },
          {
            id: "inspiration",
            title: "Inspiration",
            description: "Shop the look with sofa and bedroom lifestyle edits.",
            href: "/inspiration",
            cta: "Browse Galleries",
            imageKey: "bedroom",
          },
          {
            id: "bespoke",
            title: "Bespoke",
            description: "Design a made-for-you piece — materials, scale, and finish.",
            href: "/custom",
            cta: "Start designing",
            imageKey: "living-room",
          },
          {
            id: "showrooms",
            title: "Showrooms",
            description: "Experience materials, silhouettes, and finishes in person.",
            href: "/showrooms",
            cta: "Find a Showroom",
            imageKey: "dining",
          },
        ],
      },
      customStudio: {
        eyebrow: "Made for you",
        title: "Build it your way",
        lead:
          "Continue the workshop tradition — pick a piece, choose wood and fabric you love, and see a clear price in minutes.",
        ctaLabel: "Start designing",
        ctaHref: "/custom",
        imageSrc: "/home/furnitures_five.jpeg",
        imageAlt: "Bespoke sofa materials and finishes in the Furalto custom studio",
        materialsLabel: "Sample materials",
        priceFrom: "₹65,000",
        timeNote: "About 2 minutes",
        steps: [
          { index: "01", title: "Pick a piece", detail: "Sofa, table, bed, chair" },
          { index: "02", title: "Choose materials", detail: "Wood, fabric, finish" },
          { index: "03", title: "See your price", detail: "Clear estimate, free" },
        ],
        materials: [
          {
            id: "oak",
            label: "Oak",
            tone: "linear-gradient(160deg, #f0d7b0, #c9a06a 45%, #8f6a3d)",
          },
          {
            id: "walnut",
            label: "Walnut",
            tone: "linear-gradient(160deg, #a56b42, #6b3d24 50%, #2d1810)",
          },
          {
            id: "linen",
            label: "Linen",
            tone: "linear-gradient(160deg, #f7f1e8, #e4d8c8 45%, #cbbba6)",
          },
          {
            id: "velvet",
            label: "Velvet",
            tone: "linear-gradient(160deg, #8a7a96, #4f425c 50%, #241c2a)",
          },
          {
            id: "brass",
            label: "Brass",
            tone: "linear-gradient(160deg, #f0d9a0, #c9a35a 45%, #8a6828)",
          },
        ],
      },
      customServices: {
        eyebrow: "Bespoke",
        title: "Explore Our Custom Furniture Services",
        description:
          "Commission pieces shaped by Indian craftsmanship — or book a private consultation at our Rohini atelier.",
        perks: ["Custom sizing", "Material sourcing", "White-glove install"],
        ctaLabel: "Design Your Piece",
        ctaHref: "/custom",
        imageSrc:
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&h=820&q=85&ixlib=rb-4.1.0",
        imageAlt: "Bespoke furniture materials and finishes in the Furalto studio",
      },
      testimonials: {
        eyebrow: "From our clients",
        title: "What living with Furalto feels like",
        lead: "Real homes. Real rooms. Notes from people who bought, waited, and now live with the work.",
        ctaLabel: "Read all stories",
        ctaHref: "/testimonials",
        featuredCount: "5",
      },
    },
  },
  {
    key: "page.contact",
    title: "Contact",
    type: "page",
    description: "Contact page intro copy and reason cards.",
    data: {
      pagePath: "/contact",
      eyebrow: "Contact",
      title: "We're here to help",
      lead: "Questions about products, orders, or a design project — reach the Furalto studio.",
      reasons: [
        {
          title: "Design Guidance",
          description: "Fabric, scale, and finish recommendations for your project.",
        },
        {
          title: "Order Assistance",
          description: "Tracking, modifications, and delivery scheduling support.",
        },
        {
          title: "Trade & Projects",
          description: "Dedicated support for interior designers and architects.",
        },
      ],
    },
  },
  {
    key: "page.showrooms",
    title: "Showrooms",
    type: "showroom",
    description: "Showroom locations and in-store services.",
    data: {
      pagePath: "/showrooms",
      eyebrow: "Visit",
      title: "Our Showroom",
      lead: "Visit our Rohini Design Studio in New Delhi — materials, silhouettes, and finishes in person.",
      locations: [
        {
          id: "delhi",
          city: "New Delhi",
          name: "Rohini Design Studio",
          address:
            "Office No. 103–104, First Floor, Pocket 5, Sector 24, Rohini, New Delhi 110085",
          hours: "Monday – Saturday · 9am – 7pm IST",
          phone: "+91 93114 87655",
          email: "furaltostudio@gmail.com",
          highlights: [
            "Complete bedroom galleries",
            "In-house styling team",
            "Trade & project consultations",
          ],
          imageKey: "bedroom",
        },
      ],
      services: [
        {
          title: "Private Consultations",
          description:
            "One-on-one sessions with design specialists to review floor plans, fabrics, and finish selections.",
        },
        {
          title: "Material Libraries",
          description:
            "Explore hundreds of upholstery fabrics, wood stains, stone samples, and metal finishes in person.",
        },
        {
          title: "White-Glove Planning",
          description:
            "Coordinate delivery routes, room placement, and installation timelines before you purchase.",
        },
      ],
    },
  },
  {
    key: "page.appointments",
    title: "Appointments",
    type: "page",
    description: "Appointments page headline and benefit cards.",
    data: {
      pagePath: "/appointments",
      eyebrow: "Design Services",
      title: "Book an Appointment",
      lead: "Meet with a Furalto specialist in-showroom or virtually to plan your next room.",
      benefits: [
        {
          title: "Personalized Guidance",
          description: "Work with a specialist on layout, scale, and material pairings.",
        },
        {
          title: "Material Libraries",
          description: "Compare fabrics, woods, and finishes in person or via video.",
        },
        {
          title: "Project Planning",
          description: "Receive a curated edit and timeline within 48 hours of your visit.",
        },
      ],
    },
  },
];

function withPagePath(entry) {
  const pagePath = entry.path || entry.data?.pagePath || "/";
  const { path: _path, ...rest } = entry;
  return {
    ...rest,
    data: {
      ...(rest.data || {}),
      pagePath,
    },
  };
}

const byKey = new Map();

for (const entry of [
  ...coreContent,
  ...cmsStaticPages.map(withPagePath),
  ...cmsExtraPages.map(withPagePath),
  ...cmsRemaining,
  ...cmsTestimonials.map(withPagePath),
]) {
  byKey.set(entry.key, entry);
}

module.exports = Array.from(byKey.values());
