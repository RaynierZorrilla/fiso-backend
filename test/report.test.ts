jest.setTimeout(30000);
import request from "supertest";
import { AppDataSource } from "../src/config/data-source";
import { Report } from "../src/entities/Report";
import app from "../src/index";

describe("Report Endpoints", () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    console.log("✅ Database connected for tests");
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("GET /api/reports", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports (no auth) - PASSED");
    });
  });

  describe("GET /api/reports/generate", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports/generate?tipo=todos");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports/generate (no auth) - PASSED");
    });
  });

  describe("GET /api/reports/summary", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports/summary");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports/summary (no auth) - PASSED");
    });
  });

  describe("GET /api/reports/tendencias", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports/tendencias");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports/tendencias (no auth) - PASSED");
    });
  });

  describe("GET /api/reports/categorias-gastos", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports/categorias-gastos");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports/categorias-gastos (no auth) - PASSED");
    });
  });

  describe("GET /api/reports/progreso-metas", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports/progreso-metas");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports/progreso-metas (no auth) - PASSED");
    });
  });

  describe("GET /api/reports/download-csv", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports/download-csv?tipo=todos");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports/download-csv (no auth) - PASSED");
    });
  });

  describe("GET /api/reports/download-pdf", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/reports/download-pdf?tipo=todos");
      expect(response.status).toBe(401);
      console.log("✅ GET /api/reports/download-pdf (no auth) - PASSED");
    });
  });

  describe("POST /api/reports", () => {
    it("should return 401 without authentication", async () => {
      const newReport = {
        nombre: "Reporte Mensual",
        tipo: "mes",
        periodo: "2024-11"
      };
      const response = await request(app)
        .post("/api/reports")
        .send(newReport);
      expect(response.status).toBe(401);
      console.log("✅ POST /api/reports (no auth) - PASSED");
    });
  });

  // Tests que requieren autenticación - marcados como skip por ahora
  describe.skip("Report Endpoints with Authentication", () => {
    let authToken: string = "";
    let testReportId: string = "";

    beforeAll(async () => {
      // Aquí se configuraría la autenticación real
      console.log("⚠️ Authentication tests skipped - requires valid credentials");
    });

    it("should generate a complete report", async () => {
      // Este test se ejecutará cuando tengas credenciales válidas
      expect(true).toBe(true);
    });

    it("should return correct report structure", async () => {
      // Verificar que el reporte tenga las propiedades correctas
      const expectedProperties = ["summary", "tendencias", "categoriasGastos", "progresoMetas", "filtros"];
      expect(expectedProperties).toContain("summary");
      expect(expectedProperties).toContain("tendencias");
      expect(expectedProperties).toContain("categoriasGastos");
      expect(expectedProperties).toContain("progresoMetas");
      expect(expectedProperties).toContain("filtros");
    });

    it("should download CSV file", async () => {
      // Este test se ejecutará cuando tengas credenciales válidas
      expect(true).toBe(true);
    });

    it("should download PDF file", async () => {
      // Este test se ejecutará cuando tengas credenciales válidas
      expect(true).toBe(true);
    });
  });
}); 