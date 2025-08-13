// src/controllers/report.controller.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { reportService } from "../services/report.service";
import { getUserIdFromRequest } from "../utils/getUserIdFromRequest";

const generateReport: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { tipo, periodo } = req.query;

    if (!tipo || typeof tipo !== 'string') {
      res.status(400).json({ error: "Tipo de filtro requerido" });
      return;
    }

    const reportData = await reportService.generateReport(userId, tipo, periodo as string);
    res.json(reportData);
  } catch (err) {
    if (err && typeof err === "object" && "message" in (err as any)) {
      res.status(400).json({ error: (err as any).message });
    } else {
      next(err);
    }
  }
};

const getSummary: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { tipo, periodo } = req.query;
    const tipoFiltro = (tipo as string) || 'todos';

    const reportData = await reportService.generateReport(userId, tipoFiltro, periodo as string);
    res.json({ summary: reportData.summary, filtros: reportData.filtros });
  } catch (err) {
    next(err);
  }
};

const getTendencias: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { tipo, periodo } = req.query;
    const tipoFiltro = (tipo as string) || 'todos';

    const reportData = await reportService.generateReport(userId, tipoFiltro, periodo as string);
    res.json({ tendencias: reportData.tendencias, filtros: reportData.filtros });
  } catch (err) {
    next(err);
  }
};

const getCategoriasGastos: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { tipo, periodo } = req.query;
    const tipoFiltro = (tipo as string) || 'todos';

    const reportData = await reportService.generateReport(userId, tipoFiltro, periodo as string);
    res.json({ categoriasGastos: reportData.categoriasGastos, filtros: reportData.filtros });
  } catch (err) {
    next(err);
  }
};

const getProgresoMetas: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { tipo, periodo } = req.query;
    const tipoFiltro = (tipo as string) || 'todos';

    const reportData = await reportService.generateReport(userId, tipoFiltro, periodo as string);
    res.json({ progresoMetas: reportData.progresoMetas, filtros: reportData.filtros });
  } catch (err) {
    next(err);
  }
};

const downloadCSV: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { tipo, periodo } = req.query;

    if (!tipo || typeof tipo !== 'string') {
      res.status(400).json({ error: "Tipo de filtro requerido" });
      return;
    }

    const csvData = await reportService.generateCSV(userId, tipo, periodo as string);
    const filename = `reporte_${tipo}_${periodo || 'todos'}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (err) {
    if (err && typeof err === "object" && "message" in (err as any)) {
      res.status(400).json({ error: (err as any).message });
    } else {
      next(err);
    }
  }
};

const downloadPDF: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { tipo, periodo } = req.query;

    if (!tipo || typeof tipo !== 'string') {
      res.status(400).json({ error: "Tipo de filtro requerido" });
      return;
    }

    const pdfBuffer = await reportService.generatePDF(userId, tipo, periodo as string);
    const filename = `reporte_${tipo}_${periodo || 'todos'}_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    if (err && typeof err === "object" && "message" in (err as any)) {
      res.status(400).json({ error: (err as any).message });
    } else {
      next(err);
    }
  }
};

export const reportController = {
  generateReport,
  getSummary,
  getTendencias,
  getCategoriasGastos,
  getProgresoMetas,
  downloadCSV,
  downloadPDF,
};
