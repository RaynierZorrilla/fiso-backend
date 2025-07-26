jest.setTimeout(30000);
import request from "supertest";
import { AppDataSource } from "../src/config/data-source";
import { User } from "../src/entities/User";
import { getTestToken } from "./utils/auth";
import app from "../src/index";

describe("Profile Endpoints", () => {
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

  describe("GET /api/profile", () => {
    it("should return user profile", async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("email");
      expect(response.body).not.toHaveProperty("password");
      console.log("✅ GET /api/profile - PASSED");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/profile");

      expect(response.status).toBe(401);
      console.log("✅ GET /api/profile (no auth) - PASSED");
    });
  });

  describe("PUT /api/profile", () => {
    it("should update user profile", async () => {
      const updateData = {
        name: "Updated Name",
        email: `updated+${Date.now()}@gmail.com`
      };

      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body).not.toHaveProperty("password");
      console.log("✅ PUT /api/profile - PASSED");
    });

    it("should return 401 without authentication", async () => {
      const updateData = {
        name: "Test Name",
        email: "test@example.com"
      };

      const response = await request(app)
        .put("/api/profile")
        .send(updateData);

      expect(response.status).toBe(401);
      console.log("✅ PUT /api/profile (no auth) - PASSED");
    });

    it("should return 400 for duplicate email", async () => {
      // Primero crear un usuario con un email específico
      const existingUser = {
        name: "Existing User",
        email: `existing+${Date.now()}@gmail.com`,
        password: "Aadmin1234."
      };

      const createResponse = await request(app)
        .post("/api/users")
        .send(existingUser);

      expect(createResponse.status).toBe(201);
      testUserId = createResponse.body.id;

      // Intentar actualizar el perfil con el mismo email
      const updateData = {
        name: "Test Name",
        email: existingUser.email
      };

      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      console.log("✅ PUT /api/profile (duplicate email) - PASSED");
    });

    it("should update only name when only name is provided", async () => {
      const originalEmail = `original+${Date.now()}@gmail.com`;
      
      // Primero actualizar con email específico
      await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ email: originalEmail });

      // Luego actualizar solo el nombre
      const updateData = {
        name: "Name Only Update"
      };

      const response = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(originalEmail);
      console.log("✅ PUT /api/profile (name only) - PASSED");
    });
  });

  describe("PUT /api/profile/password", () => {
    it("should change password successfully", async () => {
      const passwordData = {
        currentPassword: testPassword,
        newPassword: "NewPassword123."
      };

      const response = await request(app)
        .put("/api/profile/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Contraseña actualizada exitosamente");
      console.log("✅ PUT /api/profile/password - PASSED");
    });

    it("should return 401 without authentication", async () => {
      const passwordData = {
        currentPassword: "oldPassword",
        newPassword: "newPassword"
      };

      const response = await request(app)
        .put("/api/profile/password")
        .send(passwordData);

      expect(response.status).toBe(401);
      console.log("✅ PUT /api/profile/password (no auth) - PASSED");
    });



    it("should return 400 for missing password data", async () => {
      const passwordData = {
        currentPassword: "OldPassword123."
        // newPassword missing
      };

      const response = await request(app)
        .put("/api/profile/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      console.log("✅ PUT /api/profile/password (missing data) - PASSED");
    });
  });
}); 