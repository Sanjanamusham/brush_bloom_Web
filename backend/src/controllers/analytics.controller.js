const PageView = require("../models/PageView");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/analytics/pageview — public, fired on every route change
exports.recordPageView = asyncHandler(async (req, res) => {
  const { path, sessionId } = req.body;
  await PageView.create({ path, sessionId });
  res.status(201).json({ success: true });
});

// POST /api/analytics/duration — public, sent via navigator.sendBeacon when a visitor leaves a page
exports.recordDuration = asyncHandler(async (req, res) => {
  const { sessionId, path, durationMs } = req.body;
  await PageView.findOneAndUpdate({ sessionId, path }, { durationMs }, { sort: { createdAt: -1 } });
  res.status(200).json({ success: true });
});

// GET /api/admin/analytics/summary — admin only
exports.getSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const [viewsToday, viewsThisWeek, activeNowSessions, topPages, avgDurationAgg, uniqueThisWeek] =
    await Promise.all([
      PageView.countDocuments({ createdAt: { $gte: startOfToday } }),
      PageView.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      PageView.distinct("sessionId", { createdAt: { $gte: fiveMinutesAgo } }),
      PageView.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, durationMs: { $gt: 0 } } },
        { $group: { _id: null, avgMs: { $avg: "$durationMs" } } },
      ]),
      PageView.distinct("sessionId", { createdAt: { $gte: sevenDaysAgo } }),
    ]);

  res.json({
    success: true,
    data: {
      viewsToday,
      viewsThisWeek,
      uniqueVisitorsThisWeek: uniqueThisWeek.length,
      activeNow: activeNowSessions.length,
      avgSessionSeconds: avgDurationAgg[0] ? Math.round(avgDurationAgg[0].avgMs / 1000) : 0,
      topPages: topPages.map((p) => ({ path: p._id, views: p.count })),
    },
  });
});