const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendPasswordResetEmail } = require("../utils/email");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
}

function signRefreshToken(admin) {
  return jwt.sign(
    { sub: admin.id, v: admin.refreshTokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" },
  );
}

// POST /api/auth/admin/login
// Deliberately generic error message + rate limiting on this route so failed
// attempts don't reveal whether an email exists (matches Supabase Auth's behaviour).
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) throw new ApiError(401, "Invalid email or password");

  const valid = await admin.comparePassword(password);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  const accessToken = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin);

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth/admin/refresh",
    })
    .json({
      success: true,
      data: { accessToken, admin: { id: admin.id, name: admin.name, email: admin.email } },
    });
});

// POST /api/auth/admin/refresh — reads the httpOnly cookie, issues a new access token.
exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "Not authenticated");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Session expired, please log in again");
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || admin.refreshTokenVersion !== payload.v) {
    throw new ApiError(401, "Session expired, please log in again");
  }

  res.json({ success: true, data: { accessToken: signAccessToken(admin) } });
});

// POST /api/auth/admin/logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth/admin/refresh" });
  res.json({ success: true, data: { loggedOut: true } });
});

// GET /api/auth/admin/me — requires requireAdmin middleware
exports.me = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) throw new ApiError(404, "Admin not found");
  res.json({ success: true, data: admin });
});

// POST /api/auth/admin/forgot-password
// Always responds with the same generic message whether or not the email is
// registered — this prevents the endpoint being used to discover valid admin
// emails, and is rate-limited (see routes) against brute-force/spam abuse.
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (admin) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    admin.resetPasswordTokenHash = hashToken(rawToken);
    admin.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await admin.save();

    const frontendUrl = process.env.CLIENT_ORIGIN || "http://localhost:4200";
    const resetUrl = `${frontendUrl}/admin/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(admin.email, resetUrl);
  }

  res.json({
    success: true,
    data: { message: "If that email is registered, a reset link has been sent." },
  });
});

// POST /api/auth/admin/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const tokenHash = hashToken(token);

  const admin = await Admin.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!admin) {
    throw new ApiError(400, "This reset link is invalid or has expired.");
  }

  admin.passwordHash = await Admin.hashPassword(newPassword);
  admin.resetPasswordTokenHash = null;
  admin.resetPasswordExpires = null;
  admin.refreshTokenVersion += 1; // invalidates any refresh tokens issued before the reset
  await admin.save();

  res.json({ success: true, data: { message: "Password updated. You can now log in." } });
});
