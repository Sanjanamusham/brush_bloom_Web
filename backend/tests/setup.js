const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

// Set required env vars BEFORE any app module is imported anywhere in the test run.
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-please-ignore-1234567890";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-please-ignore-0987654321";
process.env.JWT_ACCESS_EXPIRES = "15m";
process.env.JWT_REFRESH_EXPIRES = "7d";
process.env.CLIENT_ORIGIN = "http://localhost:4200";
process.env.WHATSAPP_NUMBER = "919999999999";

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
