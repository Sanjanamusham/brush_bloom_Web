const request = require("supertest");
const app = require("../src/app");
const Product = require("../src/models/Product");

async function makeProduct(overrides = {}) {
  return Product.create({
    slug: "test-panel",
    name: "Test Panel",
    description: "A test product",
    price: 1000,
    category: "Wall Décor",
    images: [],
    inStock: true,
    ...overrides,
  });
}

describe("GET /api/products", () => {
  it("returns an empty list when there are no products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("returns seeded products", async () => {
    await makeProduct();
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Test Panel");
  });

  it("filters by category", async () => {
    await makeProduct({ slug: "a", category: "Wall Décor" });
    await makeProduct({ slug: "b", category: "Mirror Frames" });
    const res = await request(app).get("/api/products?category=Mirror Frames");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].slug).toBe("b");
  });
});

describe("GET /api/products/:slug", () => {
  it("returns 404 for an unknown slug", async () => {
    const res = await request(app).get("/api/products/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns the product for a known slug", async () => {
    await makeProduct();
    const res = await request(app).get("/api/products/test-panel");
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Test Panel");
  });
});

describe("Admin product routes require auth", () => {
  it("rejects listing admin products with no token", async () => {
    const res = await request(app).get("/api/admin/products");
    expect(res.status).toBe(401);
  });

  it("rejects creating a product with no token", async () => {
    const res = await request(app).post("/api/admin/products").send({ name: "x" });
    expect(res.status).toBe(401);
  });

  it("rejects an obviously forged token", async () => {
    const res = await request(app)
      .get("/api/admin/products")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});
