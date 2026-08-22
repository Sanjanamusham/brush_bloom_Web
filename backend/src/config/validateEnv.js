/**
 * Fails fast on server startup if critical .env values are missing, too short,
 * or still the placeholder text from .env.example — catches the #1 real-world
 * deploy mistake (shipping with default secrets) before it ever goes live.
 */
function validateEnv() {
  const problems = [];

  const PLACEHOLDER_VALUES = new Set([
    "replace_with_a_long_random_string",
    "replace_with_a_different_long_random_string",
  ]);

  const secrets = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
  for (const key of secrets) {
    const value = process.env[key];
    if (!value) {
      problems.push(`${key} is not set.`);
    } else if (PLACEHOLDER_VALUES.has(value)) {
      problems.push(`${key} is still the placeholder value from .env.example.`);
    } else if (value.length < 32) {
      problems.push(`${key} is too short (${value.length} chars) — use at least 32.`);
    }
  }

  if (secrets.length === 2 && process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    problems.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.");
  }

  if (!process.env.MONGO_URI) {
    problems.push("MONGO_URI is not set.");
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.CLIENT_ORIGIN || process.env.CLIENT_ORIGIN.includes("localhost")) {
      problems.push("CLIENT_ORIGIN looks like a local dev URL but NODE_ENV=production.");
    }
  }

  if (problems.length > 0) {
    console.error("\n❌ Refusing to start — fix these .env problems first:\n");
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error(
      "\nGenerate a strong secret with:\n  node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"\n",
    );
    process.exit(1);
  }
}

module.exports = validateEnv;
