jest.setTimeout(30000);
import request from "supertest";
import { AppDataSource } from "../src/config/data-source";
import { Goal } from "../src/entities/Goal";
import app from "../src/index";

describe("Goal Endpoints", () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    console.log("✅ Database connected for tests");
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("GET /api/goals", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/goals");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/goals (no auth) - PASSED");
    });
  });

  describe("POST /api/goals", () => {
    it("should return 401 without authentication", async () => {
      const newGoal = {
        category: "Test Goal",
        limit: 1000,
        date: "2025-01-15"
      };
      const response = await request(app)
        .post("/api/goals")
        .send(newGoal);
      expect(response.status).toBe(401);
      console.log("✅ POST /api/goals (no auth) - PASSED");
    });
  });

  describe("PUT /api/goals/:id", () => {
    it("should return 401 without authentication", async () => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
      const response = await request(app)
        .put(`/api/goals/${nonExistentId}`)
        .send({ category: "Test" });
      expect(response.status).toBe(401);
      console.log("✅ PUT /api/goals/:id (no auth) - PASSED");
    });
  });

  describe("DELETE /api/goals/:id", () => {
    it("should return 401 without authentication", async () => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
      const response = await request(app)
        .delete(`/api/goals/${nonExistentId}`);
      expect(response.status).toBe(401);
      console.log("✅ DELETE /api/goals/:id (no auth) - PASSED");
    });
  });

  describe("GET /api/goals/summary", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/goals/summary");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/goals/summary (no auth) - PASSED");
    });
  });

  // Tests que requieren autenticación - marcados como skip por ahora
  describe.skip("Goal Endpoints with Authentication", () => {
    let authToken: string = "";
    let testGoalId: string = "";

    beforeAll(async () => {
      // Aquí se configuraría la autenticación real
      console.log("⚠️ Authentication tests skipped - requires valid credentials");
    });

    it("should create a new goal with valid auth", async () => {
      // Este test se ejecutará cuando tengas credenciales válidas
      expect(true).toBe(true);
    });
  });
}); 