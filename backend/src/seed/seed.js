/**
 * Seeds the local MongoDB with the same sample Lippan art catalogue as the
 * original app, plus one admin account.
 *
 * Usage:
 *   npm run seed
 *   npm run seed -- --admin-email=you@example.com --admin-password=ChangeMe123!
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Admin = require("../models/Admin");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);

const products = [
  {
    slug: "peacock-mandala-wall-panel",
    name: "Peacock Mandala Wall Panel",
    description:
      "A hand-sculpted Lippan mandala with a peacock motif at its centre, finished with hundreds of hand-set glass mirrors that catch the light through the day.",
    price: 3200,
    dimensions: "18 x 18 inches",
    category: "Wall Décor",
    images: ["/assets/products/peacock-mandala.jpg"],
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "bhunga-village-round-panel",
    name: "Bhunga Village Round Panel",
    description:
      "A scene of round Kutchi bhunga huts under a mirrored sky, raised in clay relief on a seasoned MDF base.",
    price: 2800,
    dimensions: "16 inches diameter",
    category: "Wall Décor",
    images: ["/assets/products/bhunga-village.jpg"],
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "kutch-bloom-mirror-frame",
    name: "Kutch Bloom Mirror Frame",
    description:
      "A full-length mirror framed in traditional Lippan floral vines, with mustard and white clay detailing.",
    price: 4500,
    dimensions: "24 x 18 inches",
    category: "Mirror Frames",
    images: ["/assets/products/kutch-bloom-mirror.jpg"],
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "camel-caravan-wall-clock",
    name: "Camel Caravan Wall Clock",
    description:
      "A working wall clock with a camel caravan crossing a mirrored desert. Silent sweep movement, battery operated.",
    price: 3600,
    dimensions: "12 inches diameter",
    category: "Wall Clocks",
    images: ["/assets/products/camel-clock.jpg"],
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "toran-arch-wall-hanging",
    name: "Toran Arch Wall Hanging",
    description:
      "An arched toran panel inspired by Gujarati doorway blessings, ideal above an entryway or puja space.",
    price: 2400,
    dimensions: "20 x 12 inches",
    category: "Wall Décor",
    images: ["/assets/products/toran-arch.jpg"],
    featured: false,
    sortOrder: 5,
  },
  {
    slug: "lotus-pond-mirror-frame",
    name: "Lotus Pond Mirror Frame",
    description:
      "Lotus blooms and leaves in raised mud relief around a round mirror, with concentric mirror-chip borders.",
    price: 5200,
    dimensions: "22 inches diameter",
    category: "Mirror Frames",
    images: ["/assets/products/lotus-mirror.jpg"],
    featured: false,
    sortOrder: 6,
  },
  {
    slug: "rann-sunrise-wall-clock",
    name: "Rann Sunrise Wall Clock",
    description:
      "A sunrise over the white Rann rendered in clay and mirror, built around a quiet quartz clock movement.",
    price: 3900,
    dimensions: "14 inches diameter",
    category: "Wall Clocks",
    images: ["/assets/products/rann-clock.jpg"],
    featured: false,
    sortOrder: 7,
  },
  {
    slug: "custom-name-plate",
    name: "Custom Family Name Plate",
    description:
      "A made-to-order Lippan name plate with your family name, hand-lettered and mirrored. Share your name and preferred colours on WhatsApp after ordering.",
    price: 1800,
    dimensions: "14 x 6 inches",
    category: "Custom Orders",
    images: ["/assets/products/name-plate.jpg"],
    featured: false,
    sortOrder: 8,
  },
];

async function run() {
  await connectDB();

  const force = args["force"] === "true" || args["force"] === "";
  const existingProductCount = await Product.countDocuments();

  if (existingProductCount > 0 && !force) {
    console.log(
      `Skipping product seeding — ${existingProductCount} product(s) already exist. ` +
        `Run with --force to wipe and reseed anyway: npm run seed -- --force`,
    );
  } else {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);
  }

  const adminEmail = (args["admin-email"] || "admin@brushbloom.local").toLowerCase();
  const adminPassword = args["admin-password"] || "ChangeMe123!";

  const existing = await Admin.findOne({ email: adminEmail });
  if (existing) {
    console.log(`Admin ${adminEmail} already exists, skipping.`);
  } else {
    const passwordHash = await Admin.hashPassword(adminPassword);
    await Admin.create({ name: "Store Owner", email: adminEmail, passwordHash });
    console.log(`Created admin ${adminEmail} with password: ${adminPassword}`);
    console.log("Log in at /admin and change this password immediately.");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
