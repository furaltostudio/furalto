/**
 * Seed 20–30 verified-buyer reviews PER sofa and bed product.
 * Target average rating: 4.8–5.0 (mostly 5★ with a few 4★).
 * Format matches post-delivery /feedback submissions.
 *
 * Run: npm run seed:reviews
 * Idempotent: removes prior SEED-REV-* reviews first.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const Review = require("../src/models/Review.model");
const { refreshProductRating } = require("../src/services/review.service");

const ORDER_PREFIX = "SEED-REV";
const MIN_REVIEWS = 22;
const MAX_REVIEWS = 28;

const FIRST_NAMES = [
  "Ananya", "Rohan", "Priya", "Arjun", "Sneha", "Vikram", "Meera", "Aditya",
  "Kavya", "Nikhil", "Ishita", "Rahul", "Divya", "Siddharth", "Neha", "Karan",
  "Aisha", "Manish", "Pooja", "Varun", "Shreya", "Amit", "Rhea", "Harshita",
  "Devansh", "Tanvi", "Yash", "Lakshmi", "Isha", "Kabir", "Anvi", "Reyansh",
  "Sara", "Vivaan", "Diya", "Aarav", "Myra", "Kabir", "Anika", "Shaurya",
  "Nisha", "Harsh", "Riya", "Kunal", "Sana", "Parth", "Tanya", "Rishi",
];

const LAST_NAMES = [
  "Sharma", "Mehta", "Nair", "Patel", "Iyer", "Singh", "Kapoor", "Rao",
  "Reddy", "Joshi", "Banerjee", "Verma", "Menon", "Malhotra", "Gupta", "Desai",
  "Khan", "Pillai", "Agarwal", "Krishnan", "Bhatt", "Kulkarni", "Fernandes", "Jain",
  "Thakur", "Shah", "Chopra", "Narayanan", "Bansal", "Saxena", "Mishra", "Ghosh",
];

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Gurugram",
  "Noida", "Ahmedabad", "Jaipur", "Kolkata", "Chandigarh", "Indore", "Kochi",
  "Surat", "Lucknow", "Coimbatore", "Goa", "Bhopal", "Nagpur",
];

const SOFA_TITLES = [
  "Worth the wait",
  "Quiet luxury, not flashy",
  "Solid build",
  "Family sofa that holds up",
  "Exactly what we hoped",
  "Good comfort, clear timeline",
  "Guest favourite already",
  "Calm living room upgrade",
  "Reliable delivery experience",
  "Comfortable for long evenings",
  "Showroom quality at home",
  "Looks premium in a compact flat",
  "Depth is perfect",
  "Cushions still look new",
  "Happy we ordered this",
  "Clean finish, no fuss",
  "Feels intentional",
  "White-glove was careful",
  "Better than photos",
  "Daily use approved",
  "Soft sit without sinking",
  "True to the description",
  "Living room finally done",
  "Would buy again",
  "Neat stitching throughout",
  "Timelines matched",
  "Premium without being loud",
  "Fits our apartment scale",
];

const BED_TITLES = [
  "Sleeps better already",
  "Quiet statement piece",
  "Solid frame, neat install",
  "Worth upgrading",
  "Calm bedroom finally",
  "Good height and support",
  "Weekend assembly done right",
  "No squeaks, no regrets",
  "Clean lines, reliable delivery",
  "Showroom visit paid off",
  "Feels intentional every morning",
  "Headboard presence is right",
  "Steady and silent",
  "Primary bedroom upgrade",
  "Dispatch as promised",
  "Soft edges, strong build",
  "Looks sharp with linen",
  "Careful white-glove team",
  "Comfort we wanted",
  "Glad we chose Furalto",
  "Frame feels dense",
  "Perfect with our mattress",
  "Bedroom feels finished",
  "Quality you can see",
  "No rush job on install",
  "Still happy after weeks",
  "Proportions are spot on",
  "Quiet luxury bed",
];

const SOFA_COMMENTS = [
  (name, city) =>
    `Ordered the ${name} for our living room in ${city}. White-glove team was careful with the stairs and it looks even better in person. Cushions still hold shape after weeks of daily use.`,
  (name, city) =>
    `We wanted something calm for our flat in ${city}. The ${name} fabric feels premium, depth is right for evenings, and neighbours noticed. Delivery slot was confirmed properly.`,
  (name, city) =>
    `Frame feels sturdy and stitching is neat on the ${name}. Dispatch matched the working days they mentioned for ${city}. Colour is slightly warmer under our LEDs, still happy.`,
  (name, city) =>
    `Kids climb on the ${name} every day and cushions have not gone flat. Installation in ${city} was quick. Glad we skipped cheaper online options.`,
  (name, city) =>
    `Proportions of the ${name} fit our ${city} living room without crowding. Soft sit without sinking. Packaging was thorough — no marks on arrival.`,
  (name, city) =>
    `Studio shared a clear delivery window for ${city} and placed the ${name} where we wanted. Seat is supportive for long TV nights. Recommend for mid-size homes.`,
  (name, city) =>
    `Every guest asks where we got the ${name}. Finish is clean, arms are comfortable, does not look bulky. Happy we ordered from Furalto for our ${city} home.`,
  (name, city) =>
    `Replaced an old sagging sofa with the ${name}. Quiet colour, good depth, no squeaks. After several weeks in ${city} we are still glad we spent the money.`,
  (name, city) =>
    `From order to home for the ${name} took the working days they mentioned. Team wrapped corners well for our narrow lift in ${city}. Looks sharp against oak flooring.`,
  (name, city) =>
    `We work from home in ${city} and use the ${name} every evening. Lumbar support is better than our previous couch. Would buy again.`,
  (name, city) =>
    `Visited the showroom first, then ordered the ${name} online for ${city}. Same finish quality. Packaging and install were careful — no rush job.`,
  (name, city) =>
    `Scale of the ${name} works for our 2BHK in ${city}. Soft edges, dense fabric. Minor traffic delay on delivery day, but the team messaged us.`,
  (name, city) =>
    `The ${name} feels intentional in our ${city} apartment — calm fabric, solid base, neat seams. Comfortable for guests who stay late.`,
  (name, city) =>
    `Modular layout of the ${name} let us rearrange once after delivery in ${city}. Fabric wiped clean after a tea spill. Placement was professional.`,
  (name, city) =>
    `Honest review of the ${name}: premium without being flashy. Sit is balanced, back is supportive. Delivery to ${city} was organised end to end.`,
  (name, city) =>
    `Took our time choosing and the ${name} was the right call for ${city}. Cushions recover overnight, arms do not sag. Very pleased.`,
  (name, city) =>
    `Photos of the ${name} were accurate enough; in our ${city} light it looks quietly rich. Team handled install without damaging walls.`,
  (name, city) =>
    `We host often in ${city}. The ${name} still looks composed after weekends of guests. Depth and height feel considered, not generic.`,
  (name, city) =>
    `Clear timeline, careful packaging, and the ${name} sits level on our floor in ${city}. Stitching is even. Happy customers here.`,
  (name, city) =>
    `The ${name} upgraded our living room without shouting for attention. Soft hand-feel on the fabric, firm enough for posture. Delivered cleanly to ${city}.`,
];

const BED_COMMENTS = [
  (name, city) =>
    `Headboard presence on the ${name} is strong without being heavy. Mattress sits flush. Delivery team assembled it carefully in our bedroom in ${city}.`,
  (name, city) =>
    `Wanted a clean modern bed for our ${city} flat. The ${name} finish is even, legs are sturdy, and it does not creak. Very happy after a month.`,
  (name, city) =>
    `White-glove team took about 40 minutes for the ${name} in ${city}. Frame feels dense. Headboard fabric is soft. Minor wish for extra pillows, still excellent.`,
  (name, city) =>
    `Came from a basic metal bed. The ${name} feels like a proper piece — proportions, upholstery, wall presence. Guests in ${city} noticed immediately.`,
  (name, city) =>
    `Soft edges and low profile of the ${name} helped our small ${city} bedroom feel larger. Dispatch timeline matched the site. No damage on arrival.`,
  (name, city) =>
    `Easy to get in and out of the ${name}. Frame is quiet. Colour matches our nightstands better than expected from photos in ${city} lighting.`,
  (name, city) =>
    `Build quality of the ${name} is excellent and delivery in ${city} was polite. With our thick mattress overall height feels tall for us — still keeping it.`,
  (name, city) =>
    `Team handled everything for the ${name} — we did not lift a thing. Looks intentional under our pendant in ${city}. Softline feel is why we chose Furalto.`,
  (name, city) =>
    `Previous bed squeaked. The ${name} is silent. Upholstery is even across the headboard. Recommend for anyone upgrading a primary bedroom in ${city}.`,
  (name, city) =>
    `Ordered the ${name} during renovation. Arrived in the window they shared for ${city}. Multi-layer packaging. Looks sharp with linen bedding.`,
  (name, city) =>
    `Sat on similar pieces in the showroom, then ordered the ${name} for ${city}. Same comfort. Installation careful around freshly painted walls.`,
  (name, city) =>
    `Simple praise for the ${name} — we look forward to the room now. Frame is steady, fabric easy to wipe, scale suits our mattress in ${city}.`,
  (name, city) =>
    `The ${name} made our ${city} bedroom feel finished. No wobble, clean channels on the headboard, and delivery was organised.`,
  (name, city) =>
    `Quiet luxury from the ${name}. Not flashy, just well made. Team placed it exactly where we marked on the floor plan in ${city}.`,
  (name, city) =>
    `We compared a few options and the ${name} won on comfort and finish. Still happy weeks later in ${city}. Would order again.`,
  (name, city) =>
    `Dispatch note was accurate for the ${name}. Arrived protected, assembled neatly, and sleeps solid. Good experience overall in ${city}.`,
  (name, city) =>
    `Headboard of the ${name} softens the wall without eating space. Perfect for our compact ${city} master room. Installers were patient.`,
  (name, city) =>
    `The ${name} feels dense and quiet. Edges are rounded where they should be. Delivery to ${city} was on the day they confirmed.`,
  (name, city) =>
    `After living with the ${name}, the upgrade was worth it. Supportive, calm look, no creaks. Recommend Furalto beds for ${city} homes.`,
  (name, city) =>
    `Honest note: the ${name} looks as refined as the product page. White-glove care in ${city} was proper. We are settled and satisfied.`,
];

const hashSlug = (slug) => {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
};

const daysAgo = (n, salt = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + (salt % 10), (salt * 11) % 60, (salt * 3) % 60, 0);
  return d;
};

/** Build integer ratings so average lands in [4.8, 5.0]. */
const buildRatings = (count, seed) => {
  // Prefer ~4.85–4.95: mostly 5s, handful of 4s (no 3s to keep average high).
  const fourShare = 0.12 + (seed % 7) * 0.01; // 12%–18% fours
  let fours = Math.max(1, Math.round(count * fourShare));
  let fives = count - fours;
  let avg = (fives * 5 + fours * 4) / count;

  while (avg < 4.8 && fours > 0) {
    fours -= 1;
    fives += 1;
    avg = (fives * 5 + fours * 4) / count;
  }
  while (avg > 4.98 && fives > count - 1) {
    // keep at least one 4 for realism unless count is tiny
    break;
  }

  const ratings = [
    ...Array(fives).fill(5),
    ...Array(fours).fill(4),
  ];

  // Deterministic shuffle
  for (let i = ratings.length - 1; i > 0; i -= 1) {
    const j = (seed * 17 + i * 13) % (i + 1);
    [ratings[i], ratings[j]] = [ratings[j], ratings[i]];
  }
  return ratings;
};

const makeCustomer = (index) => {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  const city = CITIES[(index * 5) % CITIES.length];
  const email = `${first}.${last}${index % 97}@gmail.com`.toLowerCase();
  return { name: `${first} ${last}`, email, city };
};

const buildReviewsForProduct = (product, category, globalSeqStart) => {
  const seed = hashSlug(product.slug);
  const count = MIN_REVIEWS + (seed % (MAX_REVIEWS - MIN_REVIEWS + 1));
  const ratings = buildRatings(count, seed);
  const titles = category === "sofas" ? SOFA_TITLES : BED_TITLES;
  const comments = category === "sofas" ? SOFA_COMMENTS : BED_COMMENTS;
  const docs = [];

  for (let i = 0; i < count; i += 1) {
    const customer = makeCustomer(seed + i * 17 + globalSeqStart);
    const rating = ratings[i];
    const title = titles[(seed + i * 5) % titles.length];
    const commentFn = comments[(seed + i * 7) % comments.length];
    const comment = commentFn(product.name, customer.city);
    const orderNumber = `${ORDER_PREFIX}-${product.slug}-${String(i + 1).padStart(2, "0")}`;
    const createdAt = daysAgo(8 + i * 4 + (seed % 11), seed + i);

    docs.push({
      productSlug: product.slug,
      productName: product.name,
      orderNumber,
      authorName: customer.name,
      authorEmail: customer.email,
      rating,
      title: rating === 4 && i % 5 === 0 ? "" : title,
      comment,
      isPublished: true,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return docs;
};

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");

  const sofas = await Product.find({ category: "sofas", isActive: true })
    .select("name slug")
    .lean();
  const beds = await Product.find({ category: "beds", isActive: true })
    .select("name slug")
    .lean();

  console.log(`Products: ${sofas.length} sofas, ${beds.length} beds`);

  const deleted = await Review.deleteMany({ orderNumber: new RegExp(`^${ORDER_PREFIX}-`) });
  console.log(`Removed ${deleted.deletedCount} prior seed reviews`);

  const allDocs = [];
  let seq = 0;
  for (const product of sofas) {
    const docs = buildReviewsForProduct(product, "sofas", seq);
    allDocs.push(...docs);
    seq += docs.length;
  }
  for (const product of beds) {
    const docs = buildReviewsForProduct(product, "beds", seq);
    allDocs.push(...docs);
    seq += docs.length;
  }

  // Insert in chunks
  const CHUNK = 200;
  for (let i = 0; i < allDocs.length; i += CHUNK) {
    await Review.insertMany(allDocs.slice(i, i + CHUNK), { ordered: true });
  }
  console.log(`Inserted ${allDocs.length} reviews`);

  const slugs = [...new Set(allDocs.map((d) => d.productSlug))];
  for (const slug of slugs) {
    await refreshProductRating(slug);
  }

  const stats = await Product.find({
    slug: { $in: slugs },
  })
    .select("slug name averageRating reviewCount category")
    .lean();

  const avgs = stats.map((p) => p.averageRating);
  const counts = stats.map((p) => p.reviewCount);
  console.log({
    productsUpdated: stats.length,
    reviewCountMin: Math.min(...counts),
    reviewCountMax: Math.max(...counts),
    avgMin: Math.min(...avgs),
    avgMax: Math.max(...avgs),
    sample: stats.slice(0, 4).map((p) => ({
      slug: p.slug,
      reviews: p.reviewCount,
      avg: p.averageRating,
    })),
  });

  const bad = stats.filter((p) => p.averageRating < 4.8 || p.reviewCount < 20);
  if (bad.length) {
    console.warn(
      "Below target:",
      bad.map((p) => `${p.slug} avg=${p.averageRating} n=${p.reviewCount}`)
    );
  } else {
    console.log("All products meet 20–30 reviews and 4.8–5.0 average.");
  }

  await mongoose.disconnect();
  console.log("Done");
};

run().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
