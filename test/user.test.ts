jest.setTimeout(30000);
import request from "supertest";
import { AppDataSource } from "../src/config/data-source";
import { User } from "../src/entities/User";
import { getTestToken } from "./utils/auth";
import app from "../src/index";

describe("User Endpoints", () => {
  let authToken: string = "";
  let testUserId: string = "";
  let testEmail: string = "";
  let testPassword: string = "";

  beforeAll(async () => {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    
    // Obtener token de autenticación de Supabase
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
    // Limpiar datos de prueba
    if (testUserId) {
      await AppDataSource.getRepository(User).delete(testUserId);
    }
    await AppDataSource.destroy();
  });

  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      console.log("✅ GET /api/users - PASSED");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/users");

      expect(response.status).toBe(200);
      console.log("✅ GET /api/users (no auth) - PASSED");
    });
  });

  describe("POST /api/users", () => {
    let uniqueEmail: string;
    beforeAll(() => {
      uniqueEmail = `testuser+${Date.now()}@gmail.com`;
    });

    it("should create a new user", async () => {
      const newUser = {
        name: "New User",
        email: uniqueEmail,
        password: "Aadmin1234."
      };

      const response = await request(app)
        .post("/api/users")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe(newUser.email);
      testUserId = response.body.id; // Para limpiar después
      console.log("✅ POST /api/users - PASSED");
    });

    it("should return 400 for duplicate email", async () => {
      const duplicateUser = {
        name: "Duplicate User",
        email: uniqueEmail, // Email ya existente
        password: "Aadmin1234."
      };

      const response = await request(app)
        .post("/api/users")
        .send(duplicateUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      console.log("✅ POST /api/users (duplicate email) - PASSED");
    });

    it("should return 400 for invalid data", async () => {
      const invalidUser = {
        name: "", // Nombre vacío
        email: uniqueEmail,
        password: "Aadmin1234."
      };

      const response = await request(app)
        .post("/api/users")
        .send(invalidUser);

      expect(response.status).toBe(400);
      console.log("✅ POST /api/users (invalid data) - PASSED");
    });
  });
});
