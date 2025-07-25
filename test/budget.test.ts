jest.setTimeout(30000);
import request from "supertest";
import { AppDataSource } from "../src/config/data-source";
import { Budget } from "../src/entities/Budget";
import { getTestToken } from "./utils/auth";
import app from "../src/index";

describe("Budget Endpoints", () => {
  let authToken: string = "";
  let testBudgetId: string = "";
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
    if (testBudgetId) {
      await AppDataSource.getRepository(Budget).delete(testBudgetId);
    }
    await AppDataSource.destroy();
  });

  describe("GET /api/budgets", () => {
    it("should return all budgets for authenticated user", async () => {
      const response = await request(app)
        .get("/api/budgets")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      console.log("✅ GET /api/budgets - PASSED");
    });
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/budgets");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/budgets (no auth) - PASSED");
    });
  });

  describe("POST /api/budgets", () => {
    it("should create a new budget", async () => {
      const newBudget = {
        category: "General",
        limit: 1000,
        month: "2025-01"
      };

      const response = await request(app)
        .post("/api/budgets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newBudget);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.category).toBe(newBudget.category);
      testBudgetId = response.body.id;
      console.log("✅ POST /api/budgets - PASSED");
    });
    it("should return 401 without authentication", async () => {
      const newBudget = {
        name: "Test Budget",
        amount: 1000
      };
      const response = await request(app)
        .post("/api/budgets")
        .send(newBudget);
      expect(response.status).toBe(401);
      console.log("✅ POST /api/budgets (no auth) - PASSED");
    });
  });

  describe("PUT /api/budgets/:id", () => {
    it("should update an existing budget", async () => {
      const updatedBudget = {
        name: "Updated Budget",
        amount: 1500
      };
      const response = await request(app)
        .put(`/api/budgets/${testBudgetId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedBudget);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedBudget.name);
      console.log("✅ PUT /api/budgets/:id - PASSED");
    });
    it("should return 404 for non-existent budget", async () => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
      const response = await request(app)
        .put(`/api/budgets/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test" });
      expect([400, 404]).toContain(response.status);
      console.log("✅ PUT /api/budgets/:id (not found) - PASSED");
    });
  });

  describe("DELETE /api/budgets/:id", () => {
    it("should delete an existing budget", async () => {
      const response = await request(app)
        .delete(`/api/budgets/${testBudgetId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      console.log("✅ DELETE /api/budgets/:id - PASSED");
    });
    it("should return 404 for non-existent budget", async () => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
      const response = await request(app)
        .delete(`/api/budgets/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect([400, 404]).toContain(response.status);
      console.log("✅ DELETE /api/budgets/:id (not found) - PASSED");
    });
  });

  describe("GET /api/budgets/summary", () => {
    it("should return budget summary", async () => {
      const response = await request(app)
        .get("/api/budgets/summary")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalBudgeted");
      expect(response.body).toHaveProperty("totalSpent");
      expect(response.body).toHaveProperty("available");
      console.log("✅ GET /api/budgets/summary - PASSED");
    });
  });
});
