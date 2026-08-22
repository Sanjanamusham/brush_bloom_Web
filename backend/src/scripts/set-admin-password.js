/**
 * Force-creates or force-updates an admin account with a known password,
 * regardless of whether that email already exists. Use this whenever a login
 * is stuck on "invalid password" and you just want a guaranteed-working account.
 *
 * Usage:
 *   node src/scripts/set-admin-password.js you@example.com "NewPassword123!"
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const [, , emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error('Usage: node src/scripts/set-admin-password.js <email> "<password>"');
  process.exit(1);
}

if (passwordArg.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

async function run() {
  await connectDB();

  const email = emailArg.toLowerCase();
  const passwordHash = await Admin.hashPassword(passwordArg);

  const admin = await Admin.findOneAndUpdate(
    { email },
    {
      $set: { email, passwordHash, name: "Store Owner" },
      $inc: { refreshTokenVersion: 1 }, // invalidates any old sessions tied to this account
      $setOnInsert: { role: "admin" },
    },
    { upsert: true, new: true },
  );

  console.log(`\nDone. Admin account ready:`);
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${passwordArg}`);
  console.log(`\nLog in at /admin with these exact credentials.\n`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Failed to set admin password:", err);
  process.exit(1);
});
