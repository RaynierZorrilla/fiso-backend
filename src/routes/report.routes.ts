import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

// Rutas específicas primero
// @ts-ignore
router.get("/generate", reportController.generateReport);
// @ts-ignore
router.get("/summary", reportController.getSummary);
// @ts-ignore
router.get("/tendencias", reportController.getTendencias);
// @ts-ignore
router.get("/categorias-gastos", reportController.getCategoriasGastos);
// @ts-ignore
router.get("/progreso-metas", reportController.getProgresoMetas);
// @ts-ignore
router.get("/download-csv", reportController.downloadCSV);
// @ts-ignore
router.get("/download-pdf", reportController.downloadPDF);

// Rutas principales después
router.get("/", reportController.getAll);
router.post("/", reportController.create);
router.put("/:id", reportController.update);
router.delete("/:id", reportController.remove);

export default router; 