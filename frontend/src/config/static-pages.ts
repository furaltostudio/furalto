import type { StaticPageContent } from "@/components/shared/StaticPageLayout";
import { categoryImages, getRoomImage } from "@/config/images";

const img = categoryImages;

const unsplash = (id: string, alt: string, w = 1200, h = 900) => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`,
  alt,
  width: w,
  height: h,
});

export const staticPages: Record<string, StaticPageContent> = {
  about: {
    slug: "about",
    eyebrow: "About Us",
    title: "A Legacy Reborn Through Craftsmanship",
    description:
      "Furalto is more than a furniture brand — a story of legacy, courage, and craftsmanship carried across generations. Crafted with heart. Built on legacy.",
    heroImage: img.dining,
    sections: [
      {
        title: "Our Story",
        body: "Our journey began in 1979, with Late Ramchandar, a highly respected master carpenter who led a team of more than 100 skilled craftsmen. His workshop was known for precision, integrity, and the kind of artistry that could only come from a lifetime of dedication. For decades, he shaped wood into beautiful, functional pieces that became a part of countless homes. But life took an unexpected turn. A sudden paralysis brought everything to a halt, and the dream he built slowly began to collapse. In 2022, we lost him — but his craft, his passion, and his vision remained alive in the hearts of those he inspired.",
        image: {
          src: "https://res.cloudinary.com/m1zm0cpq/image/upload/c_fill,g_center,w_720,h_900,q_auto:good,f_auto/furalto/about/ramchandar-portrait.png",
          alt: "Late Ramchandar — master carpenter and the beginning of the Furalto legacy",
          width: 720,
          height: 900,
        },
      },
      {
        title: "The Birth of Furalto",
        body: "I am Gayatri, his daughter and the founder of Furalto. Furalto was created as a tribute to him — a promise to complete the dream he could not finish. I grew up watching my father create magic with his hands. Today, I carry that same spirit forward by bringing together India’s finest artisans, designers, and craftsmen to build premium, thoughtfully designed furniture that reflects heritage, skill, and modern luxury.",
        image: {
          src: "https://res.cloudinary.com/m1zm0cpq/image/upload/e_upscale/c_fill,g_auto:face,w_720,h_900,q_auto:best,e_sharpen:50,f_auto/furalto/about/team/gayatri.jpg",
          alt: "Gayatri, Founder of Furalto",
          width: 720,
          height: 900,
        },
        cta: { label: "Book a consultation", href: "/appointments" },
      },
    ],
  },
  promotions: {
    slug: "promotions",
    eyebrow: "Current Offers",
    title: "Seasonal Promotions",
    description: "Automatic 20% off at checkout on orders of ₹2,00,000 or more, plus complimentary white-glove delivery.",
    heroImage: img.sale,
    sections: [
      {
        title: "Living & Dining Event",
        body: "Save on sofas, sectionals, dining tables, and lighting through the end of the season. Exclusions apply to clearance and open-box items.",
        image: img["living-room"],
        cta: { label: "Shop Living", href: "/collections/sofas" },
      },
      {
        title: "Outdoor Terrace Edit",
        body: "Complimentary outdoor fabric protection on all Riviera and Arc Outdoor orders placed this month.",
        image: img.outdoor,
        cta: { label: "Shop Outdoor", href: "/inspiration/outdoor" },
      },
    ],
  },
  "trade-program": {
    slug: "trade-program",
    eyebrow: "For Professionals",
    title: "Trade Program",
    description: "Exclusive pricing, dedicated support, and priority access for interior designers and architects.",
    heroImage: img.dining,
    hub: "company",
    relatedLinks: [
      { label: "Contact Trade Team", href: "/contact" },
      { label: "Visit Showrooms", href: "/showrooms" },
      { label: "Book Consultation", href: "/appointments" },
    ],
    sections: [
      {
        title: "Partner Benefits",
        body: "The Furalto Trade Program is built for designers, architects, and hospitality specifiers who need responsive support and preferential access.",
        bullets: [
          "Exclusive trade pricing on collections and custom upholstery",
          "Extended lead-time flexibility for project timelines",
          "Complimentary swatch libraries and finish samples",
          "Dedicated project coordinator from concept to install",
        ],
        image: img.decor,
        cta: { label: "Apply Now", href: "/contact" },
      },
      {
        title: "Project Services",
        body: "From space planning to white-glove installation, our trade specialists support residential and hospitality projects across India.",
        bullets: [
          "Space planning and furniture layout guidance",
          "Custom sizing, finishes, and COM/COL coordination",
          "White-glove delivery and installation scheduling",
        ],
        image: img.inspiration,
        cta: { label: "Make an Appointment", href: "/appointments" },
      },
      {
        title: "Who Qualifies",
        body: "Membership is available to licensed interior designers, architects, builders, and qualified design professionals with active project portfolios.",
      },
    ],
  },
  shipping: {
    slug: "shipping",
    eyebrow: "Customer Care",
    title: "Shipping & Delivery",
    description: "White-glove delivery and professional installation available across India.",
    heroImage: unsplash("1600880292203-757bb62b4baf", "White-glove furniture delivery team"),
    hub: "customer-care",
    relatedLinks: [
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Track Your Order", href: "/track-order" },
      { label: "Contact Us", href: "/contact" },
    ],
    sections: [
      {
        title: "White Glove Service",
        body: "Our delivery team unpacks, assembles, and places each piece in your chosen room. Packaging is removed and recycled.",
        bullets: [
          "Room-of-choice placement for sofas, beds, and case goods",
          "Basic assembly included for applicable collections",
          "Old packaging removal and responsible disposal",
        ],
        image: img["living-room"],
      },
      {
        title: "Lead Times",
        body: "Delivery timelines vary by product type, finish selection, and your location.",
        bullets: [
          "In-stock items typically ship within 2–3 weeks",
          "Made-to-order upholstery and case goods arrive in 10–15 days",
          "You will receive tracking details once your order is dispatched",
        ],
        image: img.dining,
        cta: { label: "Track Order", href: "/track-order" },
      },
      {
        title: "Delivery Coverage",
        body: "We deliver to major metros and select tier-2 cities across India. Remote locations may require additional lead time.",
        bullets: [
          "Metro delivery includes room placement and packaging removal",
          "Stair carry and elevator access confirmed before dispatch",
          "Installation add-ons available for beds, media units, and wall pieces",
        ],
        image: img.decor,
      },
    ],
  },
  returns: {
    slug: "returns",
    eyebrow: "Customer Care",
    title: "Returns & Exchanges",
    description: "We stand behind the quality of every Furalto piece with a considered returns policy.",
    heroImage: img.bedroom,
    hub: "customer-care",
    relatedLinks: [
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Product Care", href: "/care" },
      { label: "Contact Support", href: "/contact" },
    ],
    sections: [
      {
        title: "30-Day Returns",
        body: "Eligible non-custom items may be returned within 30 days of delivery in original condition.",
        bullets: [
          "Items must be unused and in original packaging where possible",
          "A restocking fee may apply depending on product category",
          "White-glove pickup can be arranged in major metro areas",
        ],
        image: img.decor,
      },
      {
        title: "Custom & Made-to-Order",
        body: "Bespoke upholstery, custom finishes, and made-to-order case goods are final sale. Our team confirms all specifications before production.",
        bullets: [
          "Fabric, finish, and dimension selections are verified in writing",
          "Swatch approvals and lead times are shared before deposit",
          "Exchanges are not available once production has begun",
        ],
        image: img["living-room"],
        cta: { label: "Contact Support", href: "/contact" },
      },
    ],
  },
  privacy: {
    slug: "privacy",
    eyebrow: "Legal",
    title: "Privacy Policy",
    description: "How Furalto collects, uses, and protects your personal information.",
    heroImage: img.office,
    variant: "legal",
    lastUpdated: "July 2026",
    relatedLinks: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Sale Terms", href: "/sale-terms" },
      { label: "Contact Us", href: "/contact" },
    ],
    sections: [
      {
        title: "Information We Collect",
        body: "We collect information you provide directly and data generated when you use our website and services.",
        bullets: [
          "Account details such as name, email, phone, and delivery addresses",
          "Order history, payment references, and appointment requests",
          "Newsletter preferences and design consultation notes",
          "Device, browser, and usage data collected through cookies and analytics",
        ],
      },
      {
        title: "How We Use Your Data",
        body: "Your information helps us deliver a seamless luxury shopping and design experience.",
        bullets: [
          "Process orders, deliveries, returns, and showroom appointments",
          "Personalize product recommendations and communications",
          "Improve website performance, security, and customer support",
          "Send promotional updates when you have opted in to receive them",
        ],
      },
      {
        title: "Cookies & Analytics",
        body: "We use cookies and similar technologies to remember preferences, measure traffic, and understand how visitors explore collections.",
        bullets: [
          "Essential cookies are required for cart, checkout, and account features",
          "Analytics cookies help us improve navigation and page performance",
          "You can manage cookie preferences through your browser settings",
        ],
      },
      {
        title: "Sharing Your Information",
        body: "We do not sell your personal information. We share data only with trusted partners who help us operate our business.",
        bullets: [
          "Payment processors and fraud-prevention providers",
          "Delivery, installation, and white-glove logistics partners",
          "Technology vendors that support email, analytics, and hosting",
        ],
      },
      {
        title: "Your Rights",
        body: "Depending on your location, you may have rights to access, correct, delete, or restrict use of your personal data.",
        bullets: [
          "Request a copy of the information we hold about you",
          "Update account details or unsubscribe from marketing emails",
          "Ask us to delete data no longer required for legal or business purposes",
        ],
      },
      {
        title: "Contact Us",
        body: "For privacy questions or data requests, reach out to our customer care team. We respond within 5 business days.",
        cta: { label: "Contact Support", href: "/contact" },
      },
    ],
  },
  terms: {
    slug: "terms",
    eyebrow: "Legal",
    title: "Terms of Use",
    description: "Terms governing your use of the Furalto website and services.",
    heroImage: img.sale,
    variant: "legal",
    lastUpdated: "July 2026",
    relatedLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Sale Terms", href: "/sale-terms" },
      { label: "Shipping & Delivery", href: "/shipping" },
    ],
    sections: [
      {
        title: "Website Use",
        body: "By accessing furalto.com, you agree to these terms. Content on this site is provided for personal, non-commercial use unless otherwise stated.",
        bullets: [
          "Product images, copy, and designs may not be reproduced without written permission",
          "We may update site content, pricing, and availability without prior notice",
          "Unauthorized scraping, automated access, or misuse of the site is prohibited",
        ],
      },
      {
        title: "Orders & Pricing",
        body: "All prices are listed in Indian Rupees unless noted. Taxes, delivery fees, and installation charges may apply at checkout.",
        bullets: [
          "We reserve the right to correct pricing or description errors before order confirmation",
          "An order is confirmed only after payment authorization and confirmation email",
          "Made-to-order, custom upholstery, and clearance items may have separate terms",
        ],
        cta: { label: "Sale Terms", href: "/sale-terms" },
      },
      {
        title: "Intellectual Property",
        body: "Furalto trademarks, photography, product designs, and editorial content remain the property of Furalto or its licensors.",
      },
      {
        title: "Limitation of Liability",
        body: "To the fullest extent permitted by law, Furalto is not liable for indirect, incidental, or consequential damages arising from site use or product delays beyond our reasonable control.",
      },
      {
        title: "Governing Law",
        body: "These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.",
      },
      {
        title: "Questions",
        body: "If you have questions about these terms, our customer care team is available by phone, email, or showroom visit.",
        cta: { label: "Contact Us", href: "/contact" },
      },
    ],
  },
  sustainability: {
    slug: "sustainability",
    eyebrow: "Our Commitment",
    title: "Sustainability",
    description: "Responsible sourcing and enduring design — furniture built to last, in the spirit of a master’s workshop.",
    heroImage: {
      src: "/home/furnitures_one.jpeg",
      alt: "Natural materials and enduring outdoor furniture in soft evening light",
      width: 1536,
      height: 1024,
    },
    hub: "company",
    relatedLinks: [
      { label: "Product Care", href: "/care" },
      { label: "Material Guide", href: "/guides/materials" },
      { label: "Our Story", href: "/about" },
    ],
    sections: [
      {
        title: "Responsible Materials",
        body: "We prioritize materials selected for longevity, traceability, and reduced environmental impact across every collection.",
        bullets: [
          "FSC-certified hardwoods where applicable",
          "Low-VOC finishes and water-based sealants",
          "Performance fabrics engineered for durability",
        ],
        image: img.outdoor,
      },
      {
        title: "Built to Last",
        body: "Furniture designed for decades — not seasons. Repairable construction and timeless silhouettes reduce waste over time.",
        bullets: [
          "Replaceable cushion cores and hardware",
          "Classic proportions that outlast trends",
          "Artisan construction meant for daily use",
        ],
        image: img.dining,
      },
      {
        title: "Mindful Operations",
        body: "From packaging reduction to showroom energy practices, we continually refine how we deliver luxury with less waste.",
      },
    ],
  },
  careers: {
    slug: "careers",
    eyebrow: "Join Us",
    title: "Careers at Furalto",
    description: "Build exceptional experiences with a team passionate about design, craft, and hospitality.",
    heroImage: img["living-room"],
    hub: "company",
    relatedLinks: [
      { label: "Contact HR", href: "/contact" },
      { label: "Our Showrooms", href: "/showrooms" },
      { label: "About Furalto", href: "/about" },
    ],
    sections: [
      {
        title: "Open Roles",
        body: "We are hiring design consultants, client experience specialists, and operations roles for our Delhi atelier and pan-India delivery.",
        bullets: [
          "Senior Design Consultant — New Delhi (Rohini)",
          "Client Experience Specialist — Design Studio",
          "Operations & Logistics Lead — Pan-India",
        ],
        image: img.inspiration,
        cta: { label: "Contact HR", href: "/contact" },
      },
      {
        title: "Our Culture",
        body: "A collaborative environment carrying a father’s craft into a national brand — where heritage skill meets contemporary design. We invest in training and long-term career growth.",
        bullets: [
          "Mentorship from senior designers and artisans",
          "Showroom training in materials and client service",
          "Inclusive team built around hospitality and craft",
        ],
        image: img["living-room"],
      },
      {
        title: "Benefits",
        body: "Competitive compensation, employee product programs, and opportunities to grow within a design-led organization.",
      },
    ],
  },
  "sale-terms": {
    slug: "sale-terms",
    eyebrow: "Sale",
    title: "Sale Terms",
    description: "Terms and conditions for promotional and clearance purchases.",
    heroImage: img.sale,
    variant: "legal",
    lastUpdated: "July 2026",
    relatedLinks: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Current Promotions", href: "/promotions" },
      { label: "Shop Sale", href: "/collections" },
    ],
    sections: [
      {
        title: "Promotional Pricing",
        body: "Sale and promotional offers are valid for a limited time and may change without notice.",
        bullets: [
          "Discounts cannot be combined unless explicitly stated",
          "Trade program pricing excludes public promotions unless noted",
          "Minimum order values may apply to percentage-off events",
        ],
      },
      {
        title: "Clearance & Open Box",
        body: "Clearance, floor sample, and open-box merchandise is sold as-is and is final sale.",
        bullets: [
          "Minor imperfections are disclosed at the point of purchase",
          "Delivery timelines vary by location and item availability",
          "Returns and exchanges are not available on final-sale items",
        ],
        cta: { label: "Shop Sale", href: "/collections" },
      },
      {
        title: "Exclusions",
        body: "Certain collections, custom finishes, and newly introduced products may be excluded from promotional events.",
        bullets: [
          "Gift cards and design consultation fees are not discount eligible",
          "Shipping, installation, and white-glove fees are excluded unless stated",
          "Prior purchases are not eligible for retroactive promotional pricing",
        ],
      },
    ],
  },
  lookbooks: {
    slug: "lookbooks",
    eyebrow: "Design",
    title: "Lookbooks",
    description: "Curated room edits and seasonal styling stories from the Furalto design studio.",
    heroImage: img.bedroom,
    sections: [
      {
        title: "Bedroom Retreat",
        body: "Layered neutrals, channel-tufted headboards, and warm brass accents for restorative spaces.",
        image: img.bedroom,
        cta: { label: "Bedroom Gallery", href: "/inspiration/bedroom" },
      },
      {
        title: "Terrace Living",
        body: "Outdoor sectionals, stone tables, and ambient lighting for elevated open-air entertaining.",
        image: img.outdoor,
        cta: { label: "Outdoor Gallery", href: "/inspiration/outdoor" },
      },
    ],
  },
};

export const carePages: Record<string, StaticPageContent> = {
  index: {
    slug: "care",
    eyebrow: "Product Care",
    title: "Care & Maintenance",
    description: "Preserve the beauty of your Furalto pieces with proper care by material and room type.",
    heroImage: img.decor,
    sections: [
      {
        title: "Fabric & Upholstery",
        body: "Vacuum regularly with an upholstery attachment. Blot spills immediately; professional cleaning recommended annually.",
        image: img["living-room"],
        cta: { label: "Living Care", href: "/care/living" },
      },
      {
        title: "Wood & Stone",
        body: "Use coasters and felt pads. Dust with a soft cloth; avoid harsh chemicals on oiled wood and sealed stone.",
        image: img.dining,
        cta: { label: "Dining Care", href: "/care/dining" },
      },
    ],
  },
  outdoor: {
    slug: "care-outdoor",
    eyebrow: "Outdoor Care",
    title: "Outdoor Furniture Care",
    description: "Protect teak, woven cord, and performance fabrics from weather and UV exposure.",
    heroImage: img.outdoor,
    hub: "customer-care",
    relatedLinks: [
      { label: "All Care Guides", href: "/care" },
      { label: "Outdoor Collections", href: "/inspiration/outdoor" },
      { label: "Contact Support", href: "/contact" },
    ],
    sections: [
      {
        title: "Seasonal Protection",
        body: "Use breathable covers during monsoon months. Store cushions indoors when not in use.",
        bullets: [
          "Cover frames when not in use for extended periods",
          "Store cushions in a dry, ventilated space",
          "Brush off debris before covering to prevent mildew",
        ],
        image: img.outdoor,
      },
      {
        title: "Teak Maintenance",
        body: "Teak develops a natural silver patina. Apply teak oil annually if you prefer the original golden tone.",
        image: unsplash("1600210492486-724fe5c67fb0", "Outdoor teak furniture on terrace"),
      },
    ],
  },
  living: {
    slug: "care-living",
    eyebrow: "Living Care",
    title: "Living Room Care",
    description: "Care instructions for sofas, sectionals, coffee tables, and media consoles.",
    heroImage: img["living-room"],
    hub: "customer-care",
    relatedLinks: [
      { label: "All Care Guides", href: "/care" },
      { label: "Living Collections", href: "/collections/sofas" },
      { label: "Contact Support", href: "/contact" },
    ],
    sections: [
      {
        title: "Upholstery",
        body: "Rotate cushions monthly. Avoid direct sunlight to prevent fading on linen and bouclé fabrics.",
        image: img["living-room"],
      },
      {
        title: "Marble & Wood Tables",
        body: "Wipe spills on marble immediately. Use placemats and trivets to protect wood and stone surfaces.",
        image: img.dining,
      },
    ],
  },
  bedroom: {
    slug: "care-bedroom",
    eyebrow: "Bedroom Care",
    title: "Bedroom Furniture Care",
    description: "Maintain beds, nightstands, and wardrobes for years of daily use.",
    heroImage: img.bedroom,
    hub: "customer-care",
    relatedLinks: [
      { label: "All Care Guides", href: "/care" },
      { label: "Bedroom Collections", href: "/collections/beds" },
      { label: "Contact Support", href: "/contact" },
    ],
    sections: [
      {
        title: "Beds & Bedding",
        body: "Rotate mattresses seasonally. Follow fabric care labels for headboard upholstery.",
        image: img.bedroom,
      },
      {
        title: "Storage Pieces",
        body: "Avoid overloading drawers. Use drawer liners for delicate finishes and brass hardware.",
        image: img.bedroom,
      },
    ],
  },
  dining: {
    slug: "care-dining",
    eyebrow: "Dining Care",
    title: "Dining Furniture Care",
    description: "Care for dining tables, chairs, and sideboards.",
    heroImage: img.dining,
    hub: "customer-care",
    relatedLinks: [
      { label: "All Care Guides", href: "/care" },
      { label: "Dining Collections", href: "/collections/dining" },
      { label: "Contact Support", href: "/contact" },
    ],
    sections: [
      {
        title: "Stone & Wood Tables",
        body: "Use table pads for formal dining. Clean with pH-neutral products only.",
        image: img.dining,
      },
      {
        title: "Chair Upholstery",
        body: "Vacuum dining chair seats weekly. Treat stains promptly with approved fabric cleaner.",
        image: img.dining,
      },
    ],
  },
  bath: {
    slug: "care-bath",
    eyebrow: "Bath Care",
    title: "Bath Furniture Care",
    description: "Protect vanities and storage from humidity and water exposure.",
    heroImage: img.bath,
    hub: "customer-care",
    relatedLinks: [
      { label: "All Care Guides", href: "/care" },
      { label: "Bath Collections", href: "/collections/vanities" },
      { label: "Contact Support", href: "/contact" },
    ],
    sections: [
      {
        title: "Vanity Surfaces",
        body: "Wipe condensation after use. Avoid abrasive cleaners on lacquer and stone tops.",
        image: img.bath,
      },
    ],
  },
  rugs: {
    slug: "care-rugs",
    eyebrow: "Rug Care",
    title: "Rug Care Guide",
    description: "Extend the life of natural fiber and wool rugs with proper maintenance.",
    heroImage: img.rugs,
    hub: "customer-care",
    relatedLinks: [
      { label: "All Care Guides", href: "/care" },
      { label: "Rug Collections", href: "/collections/rugs" },
      { label: "Rug Size Guide", href: "/guides/rug-sizes" },
    ],
    sections: [
      {
        title: "Regular Care",
        body: "Vacuum without a beater bar. Rotate rugs every six months to ensure even wear.",
        image: img.rugs,
      },
      {
        title: "Professional Cleaning",
        body: "Schedule professional cleaning every 12–18 months depending on foot traffic.",
        image: img["living-room"],
      },
    ],
  },
};

export const guidePages: Record<string, StaticPageContent> = {
  bulbs: {
    slug: "guides-bulbs",
    eyebrow: "Lighting Guide",
    title: "Bulb Guide",
    description: "Choose the right bulb temperature and wattage for every Furalto lighting design.",
    heroImage: img.lighting,
    sections: [
      {
        title: "Warm vs Cool Light",
        body: "Living and bedroom spaces benefit from 2700K warm light. Kitchen and task areas may use 3000K.",
        image: img.lighting,
      },
    ],
  },
  materials: {
    slug: "guides-materials",
    eyebrow: "Material Guide",
    title: "Material Guide",
    description: "Understand the fabrics, woods, and stones that define Furalto collections.",
    heroImage: img.decor,
    sections: [
      {
        title: "Fabric Library",
        body: "From performance bouclé to Italian linen — request swatches to compare texture and durability.",
        image: img.bedroom,
        cta: { label: "Order Swatches", href: "/swatches" },
      },
      {
        title: "Wood & Stone Finishes",
        body: "Warm oak, walnut, and honed marble each bring distinct character. Finishes are sealed for daily use.",
        image: img.dining,
      },
    ],
  },
  "rug-sizes": {
    slug: "guides-rug-sizes",
    eyebrow: "Rug Guide",
    title: "Rug Size Guide",
    description: "Select the ideal rug dimensions for living, dining, and bedroom layouts.",
    heroImage: img.rugs,
    sections: [
      {
        title: "Living Room",
        body: "Choose a rug large enough for front legs of all seating to rest on the rug.",
        image: img["living-room"],
      },
      {
        title: "Dining Room",
        body: "Allow 60cm beyond chair backs when pushed out from the table.",
        image: img.dining,
      },
    ],
  },
  gifts: {
    slug: "guides-gifts",
    eyebrow: "Gift Guide",
    title: "Gift Guide",
    description: "Thoughtful luxury gifts for housewarmings, celebrations, and design lovers.",
    heroImage: img.decor,
    sections: [
      {
        title: "Under ₹50,000",
        body: "Table lamps, throws, and sculptural objects make refined gestures of appreciation.",
        image: img.lighting,
        cta: { label: "Shop Decor", href: "/collections/objects" },
      },
      {
        title: "Statement Pieces",
        body: "Accent chairs, side tables, and artful mirrors for memorable celebrations.",
        image: img["living-room"],
      },
    ],
  },
  framing: {
    slug: "guides-framing",
    eyebrow: "Art Guide",
    title: "Framing Guide",
    description: "Presentation guidance for art and mirrors in luxury interiors.",
    heroImage: img["art-mirrors"],
    sections: [
      {
        title: "Gallery Walls",
        body: "Anchor compositions at eye level. Mix frame widths while keeping mat tones consistent.",
        image: img["art-mirrors"],
      },
    ],
  },
  ergonomics: {
    slug: "guides-ergonomics",
    eyebrow: "Office Guide",
    title: "Ergonomic Guide",
    description: "Create a comfortable, productive home office with proper desk and chair positioning.",
    heroImage: img.office,
    sections: [
      {
        title: "Desk Height",
        body: "Elbows should rest at 90 degrees when typing. Monitor top at or slightly below eye level.",
        image: img.office,
      },
      {
        title: "Chair Support",
        body: "Choose chairs with lumbar support and adjustable seat height for extended work sessions.",
        image: img.office,
        cta: { label: "Shop Office", href: "/collections/desks" },
      },
    ],
  },
};

export const swatchPages: Record<string, StaticPageContent> = {
  index: {
    slug: "swatches",
    eyebrow: "Material Library",
    title: "Fabric & Finish Swatches",
    description: "Order complimentary swatches to experience Furalto materials in your space.",
    heroImage: img.bedroom,
    sections: [
      {
        title: "How It Works",
        body: "Select up to six swatches per order. Delivered within 5–7 business days at no charge.",
        image: img.decor,
      },
      {
        title: "By Room",
        body: "Browse curated palettes for living, bedroom, dining, outdoor, and bath collections.",
        image: img["living-room"],
        cta: { label: "Living Swatches", href: "/swatches/living" },
      },
    ],
  },
  outdoor: {
    slug: "swatches-outdoor",
    eyebrow: "Outdoor Swatches",
    title: "Outdoor Fabric Swatches",
    description: "Performance fabrics engineered for sun, rain, and everyday terrace living.",
    heroImage: img.outdoor,
    sections: [
      {
        title: "Performance Weaves",
        body: "UV-resistant, quick-dry fabrics in sand, taupe, and charcoal tones.",
        image: img.outdoor,
        cta: { label: "Shop Outdoor", href: "/inspiration/outdoor" },
      },
    ],
  },
  living: {
    slug: "swatches-living",
    eyebrow: "Living Swatches",
    title: "Living Room Fabric Swatches",
    description: "Bouclé, linen, and velvet options for sofas and lounge chairs.",
    heroImage: img["living-room"],
    sections: [
      {
        title: "Signature Palettes",
        body: "Cream, champagne, espresso, and slate — our most requested living room combinations.",
        image: img["living-room"],
      },
    ],
  },
  bedroom: {
    slug: "swatches-bedroom",
    eyebrow: "Bedroom Swatches",
    title: "Bedroom Fabric Swatches",
    description: "Soft, durable upholstery and bedding fabrics for restful suites.",
    heroImage: img.bedroom,
    sections: [
      {
        title: "Bedroom Tones",
        body: "Layer neutral grounds with taupe and bronze accents for depth without visual noise.",
        image: img.bedroom,
        cta: { label: "Bedroom Gallery", href: "/inspiration/bedroom" },
      },
    ],
  },
  dining: {
    slug: "swatches-dining",
    eyebrow: "Dining Swatches",
    title: "Wood & Finish Swatches",
    description: "Wood stains, stone samples, and metal finishes for dining collections.",
    heroImage: img.dining,
    sections: [
      {
        title: "Table Finishes",
        body: "Honed marble, warm oak, and walnut samples available for Heritage dining pieces.",
        image: img.dining,
      },
    ],
  },
  bath: {
    slug: "swatches-bath",
    eyebrow: "Bath Swatches",
    title: "Bath Finish Swatches",
    description: "Lacquer, stone, and metal finishes for vanities and bath storage.",
    heroImage: img.bath,
    sections: [
      {
        title: "Spa Palette",
        body: "Matte cream lacquers paired with brushed brass and light travertine.",
        image: img.bath,
        cta: { label: "Shop Bath", href: "/collections/vanities" },
      },
    ],
  },
};

export const designConsultationPage: StaticPageContent = {
  slug: "design-consultation",
  eyebrow: "Design Services",
  title: "Design Consultation",
  description: "Work one-on-one with Furalto designers to plan cohesive rooms from concept to installation.",
  heroImage: img.inspiration,
  sections: [
    {
      title: "Full-Service Design",
      body: "Space planning, furniture selection, custom upholstery, and installation coordination for residential projects.",
      image: img["living-room"],
      cta: { label: "Book Appointment", href: "/appointments" },
    },
    {
      title: "Room Edits",
      body: "Focused consultations for single rooms — living, bedroom, dining, or outdoor — starting at ₹15,000.",
      image: img.bedroom,
    },
  ],
};

export function getStaticPage(slug: string): StaticPageContent | undefined {
  return staticPages[slug];
}

export function getAllStaticPageSlugs(): string[] {
  return Object.keys(staticPages);
}

export function getCarePage(room?: string): StaticPageContent {
  if (!room) {
    return carePages.index;
  }

  const page = carePages[room];
  if (page) {
    return page;
  }

  return {
    ...carePages.index,
    title: `${room.replace(/-/g, " ")} Care`,
    heroImage: getRoomImage(room, "Care"),
    hub: "customer-care",
    relatedLinks: [
      { label: "All Care Guides", href: "/care" },
      { label: "Contact Support", href: "/contact" },
    ],
  };
}

export function getGuidePage(topic: string): StaticPageContent | undefined {
  return guidePages[topic];
}

export function getSwatchPage(room?: string): StaticPageContent {
  if (!room) return swatchPages.index;
  return swatchPages[room] ?? {
    ...swatchPages.index,
    title: `${room.replace(/-/g, " ")} Swatches`,
    heroImage: getRoomImage(room, "Swatches"),
  };
}

export const allGuideTopics = Object.keys(guidePages);
export const allCareRooms = ["outdoor", "living", "bedroom", "dining", "bath", "rugs"];
export const allSwatchRooms = ["outdoor", "living", "bedroom", "dining", "bath"];
