const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

function corsMiddleware() {
  const origin = process.env.CLIENT_ORIGIN || "http://localhost:4200";
  return cors({
    origin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  });
}

// Generous limiter for the whole API.
const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MIN || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Tighter limiter for sensitive/abuse-prone endpoints: admin login, order creation, order tracking.
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please slow down and try again shortly." },
});

module.exports = {
  // Default Cross-Origin-Resource-Policy ("same-origin") would silently block <img> tags
  // on the Angular app (a different origin/port) from loading files served from /uploads.
  // The JSON API itself stays locked down separately via corsMiddleware() below.
  helmetMiddleware: helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }),
  corsMiddleware,
  generalLimiter,
  sensitiveLimiter,
  mongoSanitizeMiddleware: mongoSanitize(),
  hppMiddleware: hpp(),
};
