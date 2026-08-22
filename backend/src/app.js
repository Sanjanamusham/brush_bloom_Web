const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const {
  helmetMiddleware,
  corsMiddleware,
  generalLimiter,
  mongoSanitizeMiddleware,
  hppMiddleware,
} = require("./middleware/security");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const productsRoutes = require("./routes/products.routes");
const ordersRoutes = require("./routes/orders.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Security headers first.
app.use(helmetMiddleware);
app.use(corsMiddleware());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitizeMiddleware); // strips $ and . operators from req.body/query/params
app.use(hppMiddleware); // guards against HTTP parameter pollution
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

app.get("/api/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));

// Serves files written by multer (backend/src/middleware/upload.js). Filenames are
// server-generated random hex, so there's no path-traversal or executable-upload risk here.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"), {
    maxAge: "7d",
    index: false,
    dotfiles: "deny",
  }),
);

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
