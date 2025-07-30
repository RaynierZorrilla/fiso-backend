import { Request, Response } from "express";
import { reportService } from "../services/report.service";
import { getUserIdFromRequest } from "../utils/getUserIdFromRequest";

export const reportController = {
    async create(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const report = await reportService.create(userId, req.body);
            res.status(201).json(report);
        } catch (err) {
            res.status(400).json({ error: "Error al crear reporte" });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const reports = await reportService.getAll(userId);
            res.json(reports);
        } catch (err) {
            console.error("❌ Error en GET /api/reports:", err);
            res.status(400).json({ error: "Error al obtener reportes" });
        }
    },

    async generateReport(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { tipo, periodo } = req.query;

            if (!tipo || typeof tipo !== 'string') {
                return res.status(400).json({ error: "Tipo de filtro requerido" });
            }

            const reportData = await reportService.generateReport(
                userId, 
                tipo, 
                periodo as string
            );
            
            res.json(reportData);
        } catch (err) {
            if (err && typeof err === "object" && "message" in err) {
                res.status(400).json({ error: (err as any).message });
            } else {
                res.status(500).json({ error: "Error al generar reporte" });
            }
        }
    },

    async getSummary(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { tipo, periodo } = req.query;

            const tipoFiltro = tipo as string || 'todos';
            const reportData = await reportService.generateReport(
                userId, 
                tipoFiltro, 
                periodo as string
            );
            
            res.json({
                summary: reportData.summary,
                filtros: reportData.filtros
            });
        } catch (err) {
            res.status(500).json({ error: "Error al obtener resumen" });
        }
    },

    async getTendencias(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { tipo, periodo } = req.query;

            const tipoFiltro = tipo as string || 'todos';
            const reportData = await reportService.generateReport(
                userId, 
                tipoFiltro, 
                periodo as string
            );
            
            res.json({
                tendencias: reportData.tendencias,
                filtros: reportData.filtros
            });
        } catch (err) {
            res.status(500).json({ error: "Error al obtener tendencias" });
        }
    },

    async getCategoriasGastos(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { tipo, periodo } = req.query;

            const tipoFiltro = tipo as string || 'todos';
            const reportData = await reportService.generateReport(
                userId, 
                tipoFiltro, 
                periodo as string
            );
            
            res.json({
                categoriasGastos: reportData.categoriasGastos,
                filtros: reportData.filtros
            });
        } catch (err) {
            res.status(500).json({ error: "Error al obtener categorías de gastos" });
        }
    },

    async getProgresoMetas(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { tipo, periodo } = req.query;

            const tipoFiltro = tipo as string || 'todos';
            const reportData = await reportService.generateReport(
                userId, 
                tipoFiltro, 
                periodo as string
            );
            
            res.json({
                progresoMetas: reportData.progresoMetas,
                filtros: reportData.filtros
            });
        } catch (err) {
            res.status(500).json({ error: "Error al obtener progreso de metas" });
        }
    },

    async downloadCSV(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { tipo, periodo } = req.query;

            if (!tipo || typeof tipo !== 'string') {
                return res.status(400).json({ error: "Tipo de filtro requerido" });
            }

            const csvData = await reportService.generateCSV(
                userId, 
                tipo, 
                periodo as string
            );
            
            const filename = `reporte_${tipo}_${periodo || 'todos'}_${new Date().toISOString().split('T')[0]}.csv`;
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvData);
        } catch (err) {
            if (err && typeof err === "object" && "message" in err) {
                res.status(400).json({ error: (err as any).message });
            } else {
                res.status(500).json({ error: "Error al generar CSV" });
            }
        }
    },

    async downloadPDF(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { tipo, periodo } = req.query;

            if (!tipo || typeof tipo !== 'string') {
                return res.status(400).json({ error: "Tipo de filtro requerido" });
            }

            const pdfBuffer = await reportService.generatePDF(
                userId, 
                tipo, 
                periodo as string
            );
            
            const filename = `reporte_${tipo}_${periodo || 'todos'}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(pdfBuffer);
        } catch (err) {
            if (err && typeof err === "object" && "message" in err) {
                res.status(400).json({ error: (err as any).message });
            } else {
                res.status(500).json({ error: "Error al generar PDF" });
            }
        }
    },

    async update(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            const updated = await reportService.update(userId, id, req.body);
            res.json(updated);
        } catch (err) {
            if (err && typeof err === "object" && "message" in err && (err as any).message === "Reporte no encontrado") {
                res.status(404).json({ error: (err as any).message });
            } else {
                res.status(400).json({ error: "Error al actualizar reporte" });
            }
        }
    },

    async remove(req: Request, res: Response) {
        try {
            const userId = getUserIdFromRequest(req);
            const { id } = req.params;
            await reportService.delete(userId, id);
            res.json({ message: "Reporte eliminado" });
        } catch (err) {
            if (err && typeof err === "object" && "message" in err && (err as any).message === "Reporte no encontrado") {
                res.status(404).json({ error: (err as any).message });
            } else {
                res.status(400).json({ error: "Error al eliminar reporte" });
            }
        }
    },
}; 