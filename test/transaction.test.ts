jest.setTimeout(30000);
import request from "supertest";
import { AppDataSource } from "../src/config/data-source";
import { Transaction } from "../src/entities/Transaction";
import { getTestToken } from "./utils/auth";
import app from "../src/index";

describe("Transaction Endpoints", () => {
  let authToken: string = "";
  let testTransactionId: string = "";
  let testEmail: string = "";
  let testPassword: string = "";

  beforeAll(async () => {
    await AppDataSource.initialize();
    try {
      const result = await getTestToken();
      authToken = result.token;
      testEmail = result.email;
      testPassword = result.password;
      console.log("✅ Test token obtained successfully");
    } catch (error) {
      console.error("❌ Error obtaining test token:", error);
    }
  });

  afterAll(async () => {
    if (testTransactionId) {
      await AppDataSource.getRepository(Transaction).delete(testTransactionId);
    }
    await AppDataSource.destroy();
  });

  describe("GET /api/transactions", () => {
    it("should return all transactions for authenticated user", async () => {
      const response = await request(app)
        .get("/api/transactions")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      console.log("✅ GET /api/transactions - PASSED");
    });
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/transactions");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/transactions (no auth) - PASSED");
    });
  });

  describe("POST /api/transactions", () => {
    it("should create a new transaction", async () => {
      const newTransaction = {
        amount: 100,
        description: "Test transaction",
        category: "Food",
        type: "expense",
        date: new Date().toISOString()
      };
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newTransaction);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.amount).toBe(newTransaction.amount);
      testTransactionId = response.body.id;
      console.log("✅ POST /api/transactions - PASSED");
    });
    it("should return 401 without authentication", async () => {
      const newTransaction = {
        amount: 100,
        description: "Test transaction"
      };
      const response = await request(app)
        .post("/api/transactions")
        .send(newTransaction);
      expect(response.status).toBe(401);
      console.log("✅ POST /api/transactions (no auth) - PASSED");
    });
  });

  describe("GET /api/transactions/:id", () => {
    it("should return a specific transaction", async () => {
      const response = await request(app)
        .get(`/api/transactions/${testTransactionId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      console.log("✅ GET /api/transactions/:id - PASSED");
    });
    it("should return 404 for non-existent transaction", async () => {
      const response = await request(app)
        .get("/api/transactions/999999")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(404);
      console.log("✅ GET /api/transactions/:id (not found) - PASSED");
    });
  });

  describe("PUT /api/transactions/:id", () => {
    it("should update an existing transaction", async () => {
      const updatedTransaction = {
        amount: 150,
        description: "Updated transaction"
      };
      const response = await request(app)
        .put(`/api/transactions/${testTransactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedTransaction);
      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(updatedTransaction.amount);
      console.log("✅ PUT /api/transactions/:id - PASSED");
    });
    it("should return 404 for non-existent transaction", async () => {
      const response = await request(app)
        .put("/api/transactions/999999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ amount: 100 });
      expect(response.status).toBe(404);
      console.log("✅ PUT /api/transactions/:id (not found) - PASSED");
    });
  });

  describe("DELETE /api/transactions/:id", () => {
    it("should delete an existing transaction", async () => {
      const response = await request(app)
        .delete(`/api/transactions/${testTransactionId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect([200, 204]).toContain(response.status);
      console.log("✅ DELETE /api/transactions/:id - PASSED");
    });
    it("should return 404 for non-existent transaction", async () => {
      const response = await request(app)
        .delete("/api/transactions/999999")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(404);
      console.log("✅ DELETE /api/transactions/:id (not found) - PASSED");
    });
  });

  describe("GET /api/transactions/summary", () => {
    it("should return transaction summary", async () => {
      const response = await request(app)
        .get("/api/transactions/summary")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("total");
      console.log("✅ GET /api/transactions/summary - PASSED");
    });
  });
});
