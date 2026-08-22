require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");

validateEnv();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Brush & Bloom API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
