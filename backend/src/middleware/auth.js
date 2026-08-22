const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

/**
 * Requires a valid short-lived access token (sent as "Authorization: Bearer <token>").
 * This is the equivalent of Supabase Auth + the has_role('admin') RLS check, but
 * since there is only ever one role ("admin"), any authenticated principal here IS an admin —
 * there is no public/customer login in this app by design (order tracking is code+phone based).
 */
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

module.exports = { requireAdmin };
