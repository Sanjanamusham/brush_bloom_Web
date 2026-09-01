const request = require("supertest");
const app = require("../src/app");
const Product = require("../src/models/Product");

async function makeProduct(overrides = {}) {
  return Product.create({
    slug: "test-panel",
    name: "Test Panel",
    price: 1500,
    category: "Wall Décor",
    images: [],
    inStock: true,
    ...overrides,
  });
}

describe("POST /api/orders", () => {
  it("rejects an order with no items", async () => {
    const res = await request(app).post("/api/orders").send({
      customerName: "Jane Doe",
      phone: "9876543210",
      address: "123 Long Enough Address Street",
      items: [],
    });
    expect(res.status).toBe(400);
  });

  it("rejects an order with an invalid phone number", async () => {
    const product = await makeProduct();
    const res = await request(app)
      .post("/api/orders")
      .send({
        customerName: "Jane Doe",
        phone: "abc",
        address: "123 Long Enough Address Street",
        items: [{ productId: product.id, quantity: 1 }],
      });
    expect(res.status).toBe(400);
  });

  it("creates an order and returns a generated order code", async () => {
   const product = await makeProduct();
  const res = await request(app)
    .post("/api/orders")
    .send({
      customerName: "Jane Doe",
      phone: "9876543210",
      addressLine1: "123 Long Enough Address Street", city: "Hyderabad", state: "Telangana", pincode: "500081",
      items: [{ productId: product.id, quantity: 2 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.data.orderCode).toMatch(/^LP-\d{8}-\d{4}$/);
    expect(res.body.data.estimatedTotal).toBe(3000); // 1500 x 2
  });
});

describe("POST /api/orders/track — security-critical: never leaks orders by code alone", () => {
async function createOrder(phone = "9876543210") {
  const product = await makeProduct();
  const createRes = await request(app)
    .post("/api/orders")
    .send({
      customerName: "Jane Doe",
      phone,
      addressLine1: "123 Long Enough Address Street",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      items: [{ productId: product.id, quantity: 1 }],
    });

  if (createRes.status !== 201) {
    throw new Error(
      `createOrder() helper expected 201 but got ${createRes.status}: ${JSON.stringify(createRes.body)}`,
    );
  }

  return createRes.body.data.orderCode;
}

  it("finds the order when both order code AND phone match", async () => {
    const orderCode = await createOrder("9876543210");
    const res = await request(app)
      .post("/api/orders/track")
      .send({ orderCode, phone: "9876543210" });
    expect(res.status).toBe(200);
    expect(res.body.data.found).toBe(true);
    expect(res.body.data.order.orderCode).toBe(orderCode);
  });

  it("does NOT find the order with the right code but wrong phone", async () => {
    const orderCode = await createOrder("9876543210");
    const res = await request(app)
      .post("/api/orders/track")
      .send({ orderCode, phone: "1111111111" });
    expect(res.status).toBe(200);
    expect(res.body.data.found).toBe(false);
    expect(res.body.data.order).toBeUndefined();
  });

  it("does NOT find a non-existent order code", async () => {
    const res = await request(app)
      .post("/api/orders/track")
      .send({ orderCode: "LP-99999999-9999", phone: "9876543210" });
    expect(res.body.data.found).toBe(false);
  });
});
