const express = require("express");
const ctrl = require("../controllers/analytics.controller");
const validate = require("../middleware/validate");
const { pageViewSchema, pageViewDurationSchema } = require("../validators/schemas");
const { generalLimiter } = require("../middleware/security");

const router = express.Router();

router.post("/pageview", generalLimiter, validate(pageViewSchema), ctrl.recordPageView);
router.post("/duration", generalLimiter, validate(pageViewDurationSchema), ctrl.recordDuration);

module.exports = router;