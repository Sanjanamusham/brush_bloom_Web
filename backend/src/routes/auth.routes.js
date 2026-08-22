const express = require("express");
const ctrl = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const { sensitiveLimiter } = require("../middleware/security");
const { adminLoginSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validators/schemas");

const router = express.Router();

router.post("/admin/login", sensitiveLimiter, validate(adminLoginSchema), ctrl.login);
router.post("/admin/refresh", ctrl.refresh);
router.post("/admin/logout", ctrl.logout);
router.get("/admin/me", requireAdmin, ctrl.me);
router.post(
  "/admin/forgot-password",
  sensitiveLimiter,
  validate(forgotPasswordSchema),
  ctrl.forgotPassword,
);
router.post(
  "/admin/reset-password",
  sensitiveLimiter,
  validate(resetPasswordSchema),
  ctrl.resetPassword,
);

module.exports = router;
