/**
 * Seed ~10 realistic Furalto journal posts (2025 → mid-2026).
 * Usage: node scripts/seed-blog-posts.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const BlogPost = require("../src/models/BlogPost.model");

const img = (file, alt) => ({
  src: `/home/${file}`,
  alt,
  width: 1536,
  height: 1024,
});

const posts = [
  {
    title: "How to Choose a Sofa That Actually Fits Indian Living Rooms",
    slug: "choose-sofa-indian-living-rooms",
    excerpt:
      "Apartment layouts, AC vents, and Diwali hosting — a practical guide to sofa scale, depth, and fabric before you buy.",
    category: "Buying Guides",
    author: "Gayatri",
    publishedAt: "2025-02-12T10:00:00.000Z",
    tags: ["sofas", "buying guide", "living room"],
    coverImage: img("furnitures_five.jpeg", "Curved cream sofa in a warm Indian living room"),
    body: `Most sofa regret in Indian homes isn’t about taste — it’s about scale.

A piece that looked perfect in a showroom can overwhelm a 12×14 living room, block a balcony door, or leave no path for the dining chairs you already own. Before you fall for a silhouette, measure the room twice and sketch the walk lines: sofa to TV, sofa to dining, and the corridor your family actually uses every day.

## Depth vs. daily life

Deep lounge sofas feel luxurious in photos, but if your room is compact, a 90–100 cm depth often works harder than a 110+ cm “cloud” seat. You’ll still get comfort — you just keep circulation.

## Fabric for real weather

Delhi dust, Mumbai humidity, and Bengaluru monsoon all punish upholstery differently. Performance weaves and tight bouclés clean more kindly than open linens in high-traffic homes. Ask for a swatch and leave it near a sunny window for a week before you commit.

## The Furalto approach

In our Rohini studio we always start with your floor plan, not a catalogue page. Bring measurements (or book a visit) and we’ll map seating that hosts well without swallowing the room.`,
  },
  {
    title: "Bouclé vs Performance Fabric: What Lasts Longer at Home?",
    slug: "boucle-vs-performance-fabric",
    excerpt:
      "Texture lovers meet practical families. Here’s when bouclé shines — and when a performance weave is the wiser daily choice.",
    category: "Materials",
    author: "Furalto Studio",
    publishedAt: "2025-03-28T09:30:00.000Z",
    tags: ["fabrics", "materials", "care"],
    coverImage: img("decor_showcase.jpeg", "Close-up of premium upholstery and material samples"),
    body: `Bouclé has become the signature of quiet luxury — nubby, soft, camera-ready. Performance fabrics are less Instagrammed, more lived-in. You don’t have to pick a side forever; you do need to match fabric to how the room is used.

## Bouclé: the romance

It’s tactile and forgiving of slight wrinkles. On a low-use lounge or a guest sofa, it ages with character. On a family sectional with pets and snacks, loops can catch and hold crumbs.

## Performance weave: the workhorse

Tight constructions resist staining and clean with less drama. Colour options are calmer, but longevity in a busy home is usually better.

## Our studio tip

Many clients mix: bouclé on an accent chair, performance on the primary sofa. Same palette, smarter durability.`,
  },
  {
    title: "A Quiet Bedroom Formula: Headboard Height, Light, and Calm",
    slug: "quiet-bedroom-formula-headboard-light",
    excerpt:
      "Why tall channel headboards feel restful, how bedside lighting should work, and the small details that make a bedroom feel finished.",
    category: "Design Ideas",
    author: "Ar. Gautam Jha",
    publishedAt: "2025-05-09T11:00:00.000Z",
    tags: ["beds", "bedroom", "lighting"],
    coverImage: img("furnitures_two.jpeg", "Upholstered bed in a calm bedroom with soft light"),
    body: `A bedroom should lower your shoulders when you walk in. That feeling rarely comes from more décor — it comes from proportion and light.

## Headboard height

A tall, soft headboard (think Softline Channel) anchors the wall and frames pillows without needing a gallery of art. In rooms with low ceilings, keep the silhouette soft rather than architectural and sharp.

## Lighting layers

One ceiling light is not a plan. Add a warm bedside lamp on each side, and if possible a dimmable wall wash. Reading should be possible without waking the whole room.

## Textiles that finish the story

One good rug under the bed, bedding in a single tonal family, and curtains that kiss the floor. Restraint reads more expensive than clutter.`,
  },
  {
    title: "White-Glove Delivery: What to Expect on Installation Day",
    slug: "white-glove-delivery-what-to-expect",
    excerpt:
      "From stair measurements to protective wrapping — how Furalto delivery works, and how you can prepare your home for a smooth install.",
    category: "Studio Notes",
    author: "Furalto Studio",
    publishedAt: "2025-06-18T08:45:00.000Z",
    tags: ["delivery", "customer care"],
    coverImage: img("furnitures_one.jpeg", "Finished living room ready after furniture placement"),
    body: `Delivery day anxiety is common — especially in older buildings with narrow stairs. Here’s what our white-glove process looks like in practice.

## Before we arrive

We’ll confirm access: lift size, stair turns, and parking. Clear a path from entrance to room. Roll up rugs that could catch furniture feet.

## On the day

Pieces arrive wrapped for protection. Teams place, level, and remove packaging. We don’t rush past door frames — we measure twice.

## After placement

Walk the room with us. Note any concerns before the team leaves. Care cards travel with many pieces so maintenance isn’t a mystery later.

Good furniture deserves a careful landing. That’s why installation is part of the promise, not an afterthought.`,
  },
  {
    title: "Teak, Oak, or Walnut? Choosing Wood for Indian Homes",
    slug: "teak-oak-walnut-indian-homes",
    excerpt:
      "Climate, colour, and care — a clear comparison of the woods we use most in custom and catalogue pieces.",
    category: "Materials",
    author: "Furalto Studio",
    publishedAt: "2025-08-04T10:15:00.000Z",
    tags: ["wood", "materials", "custom"],
    coverImage: img("furnitures_four.jpeg", "Warm timber furniture detail in natural light"),
    body: `Wood choice changes the mood of a room as much as upholstery does.

## European Oak

Warm, readable grain. Ideal when you want light, contemporary rooms that still feel grounded. Pairs with cream bouclé and champagne metal.

## American Walnut

Deeper and more formal. Beautiful against plaster walls and brass. Needs a little more care with direct harsh sun over years.

## Teak

Naturally resilient in humid climates. A practical favourite for clients who want longevity without fuss — especially near coastal or monsoon cities.

In the Bespoke Studio you can swap woods on many silhouettes and see the estimate update live. Bring a floor sample if you want a stain match.`,
  },
  {
    title: "Modular Sofas for Open-Plan Apartments",
    slug: "modular-sofas-open-plan-apartments",
    excerpt:
      "Open kitchens and living rooms need seating that flexes. Modular blocks let you host tonight and reclaim walk space tomorrow.",
    category: "Design Ideas",
    author: "Gayatri",
    publishedAt: "2025-09-22T12:00:00.000Z",
    tags: ["sofas", "modular", "apartments"],
    coverImage: img("furnitures_five.jpeg", "Modular lounge seating in an open living space"),
    body: `Open-plan living is generous — until furniture freezes the layout.

## Why modular wins

Sections can form an L for movie night, then pull apart when you need a clearer party flow. Chaise modules are optional, not mandatory.

## Anchor with a rug

Define the living zone with a rug large enough for front sofa legs. Without that frame, modular seating can look like it’s floating.

## Scale honesty

Don’t buy for the Instagram flat you wish you had. Buy for the flat you live in — then choose modules that can grow if you move later.`,
  },
  {
    title: "Festive Hosting, Calm Rooms: Dining Layouts That Work",
    slug: "festive-hosting-calm-dining-layouts",
    excerpt:
      "Diwali dinners and weekend gatherings without crowding. Table scale, chair clearance, and lighting that flatters food and faces.",
    category: "Living Well",
    author: "Furalto Studio",
    publishedAt: "2025-10-30T09:00:00.000Z",
    tags: ["dining", "hosting", "festive"],
    coverImage: img("furnitures_one.jpeg", "Dining table set for an intimate evening gathering"),
    body: `Indian festive hosting asks a lot of a dining room: more guests, more dishes, more movement.

## Clearance first

Aim for roughly 90 cm behind chairs where possible. Tight rooms can still host — just choose armless chairs and a table that doesn’t fight the wall.

## Lighting that flatters

A pendant should light the table, not glare into eyes. Dim warm light makes food and conversation better than a bright white flood.

## Extend thoughtfully

If you only host large groups a few times a year, an extendable table beats a permanently oversized one that makes weekday breakfasts feel formal.`,
  },
  {
    title: "From Workshop to Brand: Why 1979 Still Shapes Every Piece",
    slug: "workshop-to-brand-legacy-1979",
    excerpt:
      "A short note on Late Ramchandar’s craft, Gayatri’s founding promise, and how that workshop discipline shows up in today’s furniture.",
    category: "Our Story",
    author: "Gayatri",
    publishedAt: "2026-01-14T10:00:00.000Z",
    tags: ["legacy", "about", "craft"],
    coverImage: img("furnitures_four.jpeg", "Heritage craftsmanship and warm atelier atmosphere"),
    body: `Furalto did not begin as a logo. It began as a workshop in 1979 — Late Ramchandar leading more than a hundred skilled hands with precision and integrity.

When that chapter closed, the craft didn’t. I founded Furalto as a promise to complete what he started: true Indian craftsmanship, finished for modern homes.

## What that means on the floor

Joinery that doesn’t creak after a season. Finishes chosen to age honestly. Design that respects heritage without copying the past.

If you’ve visited our Rohini studio, you’ve felt that standard in person. If you haven’t yet — the journal, the collections, and a design visit are all doors into the same story.`,
  },
  {
    title: "Small Balcony, Big Comfort: Outdoor Pieces That Don’t Overcrowd",
    slug: "small-balcony-outdoor-furniture",
    excerpt:
      "Compact terrace ideas: scale, weather-smart materials, and how to keep a balcony usable after you add seating.",
    category: "Design Ideas",
    author: "Furalto Studio",
    publishedAt: "2026-03-11T08:30:00.000Z",
    tags: ["outdoor", "balcony", "terrace"],
    coverImage: img("furnitures_one.jpeg", "Outdoor seating styled for a compact terrace"),
    body: `Indian balconies are precious square metres. The wrong lounge set turns them into storage.

## Measure the usable rectangle

Ignore the railing curve for a moment — measure the flat zone where feet and furniture sit. Leave a path to the door.

## Choose lighter silhouettes

Low chairs and a compact table beat a deep sofa that permanently blocks the view. Foldable side tables help when you need floor for plants or yoga.

## Materials that forgive weather

Performance fabrics and well-finished woods survive sun and monsoon better than delicate indoor upholstery left outside “just for the weekend.”`,
  },
  {
    title: "How to Brief a Design Consultation (So You Get Better Advice)",
    slug: "how-to-brief-design-consultation",
    excerpt:
      "Photos, measurements, must-haves, and budget honesty — the short prep list that makes a Furalto studio visit genuinely useful.",
    category: "Studio Notes",
    author: "Pinky Jha",
    publishedAt: "2026-06-02T11:20:00.000Z",
    tags: ["consultation", "showroom", "planning"],
    coverImage: img("furnitures_two.jpeg", "Design consultation mood with furniture samples"),
    body: `A consultation goes further when you arrive prepared — not perfectly styled, just clear.

## Bring these five things

1. Room photos in daylight  
2. Rough measurements  
3. A short list of must-haves (e.g. sleepers for guests, pet-friendly fabric)  
4. Pieces you already own that stay  
5. A budget range you’re comfortable saying out loud  

## Leave perfection at home

Moodboards help, but contradictions are fine. “I love curves but need easy cleaning” is a useful brief — we design inside real constraints.

## Book when you’re ready to decide direction

You don’t need to buy the same day. You do need enough clarity that samples and sketches can move you forward.`,
  },
  {
    title: "Monsoon Care for Upholstery and Timber",
    slug: "monsoon-care-upholstery-timber",
    excerpt:
      "Humidity swells wood and invites mildew on soft furnishings. Simple seasonal habits that protect your pieces through the rains.",
    category: "Living Well",
    author: "Furalto Studio",
    publishedAt: "2026-07-21T09:10:00.000Z",
    tags: ["care", "monsoon", "maintenance"],
    coverImage: img("decor_showcase.jpeg", "Furniture care details and soft interior textures"),
    body: `Monsoon is hard on homes — and on furniture that lives close to open windows.

## Airflow beats fragrance sprays

Run a dehumidifier or keep gentle cross-ventilation where you can. Don’t trap damp air behind heavy curtains against a wet wall.

## Soft furnishings

Vacuum upholstery with a soft brush. Spot-clean spills quickly. If cushions feel clammy, rotate them and give them dry air time.

## Timber

Wipe with a barely damp cloth, then dry. Avoid soaking finishes. If a door or drawer swells slightly, wait for humidity to drop before forcing it.

Care is quiet work — but it’s how heirloom pieces stay heirloom.`,
  },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  let upserted = 0;

  for (const post of posts) {
    const result = await BlogPost.updateOne(
      { slug: post.slug },
      {
        $set: {
          ...post,
          publishedAt: new Date(post.publishedAt),
          isPublished: true,
          seoDescription: post.excerpt,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount || result.modifiedCount) upserted += 1;
    console.log(post.slug, result.upsertedCount ? "created" : result.modifiedCount ? "updated" : "unchanged");
  }

  const total = await BlogPost.countDocuments({ isPublished: true });
  console.log("done. upserted/updated:", upserted, "published total:", total);
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
