const ApiError = require("../utils/ApiError");

/**
 * Validates req.body against a Zod schema and replaces req.body with the
 * parsed/sanitised result. Every write endpoint (orders, products, auth) uses
 * this so nothing unvalidated ever reaches Mongoose or business logic.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return next(new ApiError(400, "Validation failed", details));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
