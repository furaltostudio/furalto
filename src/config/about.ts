import type { PageImage } from "@/config/images";
import { categoryImages } from "@/config/images";

export type AboutPillar = {
  id: "traditional" | "contemporary" | "artisans";
  title: string;
  body: string;
};


export type AboutTeamMember = {
  id: string;
  name: string;
  role: string;
  featured?: boolean;
  imageSrc: string;
  imageAlt: string;
};

export type AboutTimelineItem = {
  year: string;
  label: string;
};

export type AboutPageExtras = {
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroLead: string;
  heroTagline: string;
  heroBannerSrc: string;
  heroBannerAlt: string;
  heroImage: PageImage;
  timeline: AboutTimelineItem[];
  introEyebrow: string;
  introTitle: string;
  introLead: string;
  purposeEyebrow: string;
  purposeStatement: string;
  purposeCommitment: string;
  pillarsEyebrow: string;
  pillarsTitle: string;
  pillars: AboutPillar[];
  teamEyebrow: string;
  teamTitle: string;
  teamLead: string;
  team: AboutTeamMember[];
  closeEyebrow: string;
  closeTitle: string;
  closeBody: string;
  closeAccent: string;
};

const teamImage = (id: string) =>
  `https://res.cloudinary.com/m1zm0cpq/image/upload/e_upscale/c_fill,g_auto:face,w_800,h_1000,q_auto:best,e_sharpen:60,f_auto/furalto/about/team/${id}.jpg`;

export const aboutPageExtras: AboutPageExtras = {
  heroEyebrow: "About Us",
  heroTitle: "A Legacy Reborn Through Craftsmanship",
  heroAccent: "",
  heroLead:
    "Furalto is more than a furniture brand — it is a story of legacy, courage, and craftsmanship carried across generations.",
  heroTagline: "Crafted with heart. Built on legacy.",
  heroBannerSrc:
    "https://res.cloudinary.com/m1zm0cpq/image/upload/f_auto,q_auto:good/furalto/about/about-hero-banner.png",
  heroBannerAlt:
    "About Us — A Legacy Reborn Through Craftsmanship. Furalto is more than a furniture brand; it is a story of legacy, courage, and craftsmanship carried across generations. Crafted with heart. Built on legacy.",
  heroImage: categoryImages["living-room"],
  timeline: [
    { year: "1979", label: "Workshop begins" },
    { year: "100+", label: "Craftsmen led" },
    { year: "2022", label: "Legacy carried forward" },
    { year: "Today", label: "Furalto atelier" },
  ],
  introEyebrow: "About Us",
  introTitle: "From a master’s workshop to a modern Indian brand",
  introLead:
    "Furalto was born as a promise — to complete a dream begun with skilled hands, and to bring true Indian craftsmanship into homes that value beauty and integrity.",
  purposeEyebrow: "Our Purpose",
  purposeStatement:
    "To transform true Indian craftsmanship into designer furniture that elevates modern living.",
  purposeCommitment:
    "We are committed to taking Indian artistry to the next level, ensuring it receives the global recognition it deserves.",
  pillarsEyebrow: "How we work",
  pillarsTitle: "Heritage skill. Modern living.",
  pillars: [
    {
      id: "traditional",
      title: "Traditional Techniques",
      body: "Joinery, carving, and finishing methods refined over decades — the same discipline that defined Late Ramchandar’s workshop.",
    },
    {
      id: "contemporary",
      title: "Contemporary Design",
      body: "Clean proportions and modern silhouettes that honour heritage while fitting today’s Indian homes.",
    },
    {
      id: "artisans",
      title: "Artisan Partnership",
      body: "We bring together India’s finest artisans, designers, and craftsmen under one atelier standard of care.",
    },
  ],
  teamEyebrow: "Our Team",
  teamTitle: "The people shaping Furalto",
  teamLead: "A dedicated team carrying a father’s craft into a national brand.",
  team: [
    {
      id: "gayatri",
      name: "Gayatri",
      role: "Founder",
      featured: true,
      imageSrc: teamImage("gayatri"),
      imageAlt: "Gayatri, Founder of Furalto",
    },
    {
      id: "gautam",
      name: "Ar. Gautam Jha",
      role: "Co-Founder",
      featured: true,
      imageSrc: teamImage("gautam"),
      imageAlt: "Ar. Gautam Jha, Co-Founder of Furalto",
    },
    {
      id: "pinky",
      name: "Pinky Jha",
      role: "Logistics Manager",
      imageSrc: teamImage("pinky"),
      imageAlt: "Pinky Jha, Logistics Manager",
    },
    {
      id: "akshay",
      name: "Akshay Sharma",
      role: "Architect",
      imageSrc: teamImage("akshay"),
      imageAlt: "Akshay Sharma, Architect",
    },
    {
      id: "maheep",
      name: "Maheep",
      role: "Designer",
      imageSrc: teamImage("maheep"),
      imageAlt: "Maheep, Designer",
    },
    {
      id: "govind",
      name: "Govind Jha",
      role: "Production Manager",
      imageSrc: teamImage("govind"),
      imageAlt: "Govind Jha, Production Manager",
    },
    {
      id: "ritam",
      name: "Ritam Mazinder Baruah",
      role: "Senior Architect",
      imageSrc: teamImage("ritam"),
      imageAlt: "Ritam Mazinder Baruah, Senior Architect",
    },
  ],
  closeEyebrow: "Our promise",
  closeTitle: "Crafted with heart. Designed with vision.",
  closeBody:
    "Every piece we make is a continuation of a life spent shaping wood into homes people love — built with integrity, finished with care, and delivered with pride across India.",
  closeAccent: "A brand built with heart.",
};

export const aboutSectionMeta = [
  {
    year: "1979",
    image: {
      src: "https://res.cloudinary.com/m1zm0cpq/image/upload/c_fill,g_center,w_720,h_900,q_auto:good,f_auto/furalto/about/ramchandar-portrait.png",
      alt: "Late Ramchandar — master carpenter and the beginning of the Furalto legacy",
      width: 720,
      height: 900,
    },
  },
  {
    year: "Founding",
    image: {
      src: "https://res.cloudinary.com/m1zm0cpq/image/upload/e_upscale/c_fill,g_auto:face,w_720,h_900,q_auto:best,e_sharpen:50,f_auto/furalto/about/team/gayatri.jpg",
      alt: "Gayatri, Founder of Furalto",
      width: 720,
      height: 900,
    },
  },
] as const;
