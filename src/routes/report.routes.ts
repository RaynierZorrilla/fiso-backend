import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

// Rutas de reportes dinámicos
router.get("/generate", reportController.generateReport);
router.get("/summary", reportController.getSummary);
router.get("/tendencias", reportController.getTendencias);
router.get("/categorias-gastos", reportController.getCategoriasGastos);
router.get("/progreso-metas", reportController.getProgresoMetas);
router.get("/download-csv", reportController.downloadCSV);
router.get("/download-pdf", reportController.downloadPDF);

export default router;