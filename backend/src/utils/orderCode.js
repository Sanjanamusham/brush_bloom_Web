const Order = require("../models/Order");

/**
 * Generates a short, human-friendly order code: LP-YYYYMMDD-#### (IST date).
 * Mirrors the original Postgres `generate_order_code()` function using a
 * per-day counter derived from today's order count (fine at small/medium volume;
 * swap for a Mongo counters collection with findOneAndUpdate($inc) if you need
 * strict atomicity under heavy concurrent load).
 */
async function generateOrderCode() {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  const datePart = ist.toISOString().slice(0, 10).replace(/-/g, "");

  const startOfDayUTC = new Date(
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - istOffsetMs,
  );
  const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);

  const countToday = await Order.countDocuments({
    createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC },
  });

  const sequence = String((countToday + 1) % 10000).padStart(4, "0");
  const code = `LP-${datePart}-${sequence}`;

  // Extremely rare race-condition guard: if the code is somehow taken, bump once more.
  const exists = await Order.exists({ orderCode: code });
  if (exists) {
    return `LP-${datePart}-${String((countToday + 2) % 10000).padStart(4, "0")}`;
  }
  return code;
}

module.exports = generateOrderCode;
