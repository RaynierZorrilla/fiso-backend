import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Transaction } from "../entities/Transaction";
import { Goal } from "../entities/Goal";
// @ts-ignore
import { Parser } from "json2csv";
// @ts-ignore
import PDFDocument from "pdfkit";

const userRepo = AppDataSource.getRepository(User);
const transactionRepo = AppDataSource.getRepository(Transaction);
const goalRepo = AppDataSource.getRepository(Goal);

export const reportService = {
  async generateReport(userId: string, tipo: string, periodo?: string) {
    let transactions: Transaction[] = [];
    let goals: Goal[] = [];

    // Determinar el tipo de filtro temporal y el tipo de transacción
    let filtroTemporal: "todos" | "mes" | "year" = "todos";
    let tipoTransaccion: "todos" | "ingresos" | "gastos" = "todos";

    if (tipo === "mes" || tipo === "year") {
      filtroTemporal = tipo;
      tipoTransaccion = "todos";
    } else {
      // Es un filtro por tipo de transacción
      if (tipo === "ingresos" || tipo === "gastos") tipoTransaccion = tipo;

      // Inferir filtro temporal por el formato de periodo
      if (periodo) {
        if (/^\d{4}-\d{2}$/.test(periodo)) filtroTemporal = "mes";
        else if (/^\d{4}$/.test(periodo)) filtroTemporal = "year";
      }
    }

    // Obtener transacciones según el filtro temporal (todo en UTC)
    switch (filtroTemporal) {
      case "mes": {
        if (!periodo) throw new Error("Período requerido para filtro mensual (YYYY-MM)");
        const [year, month] = periodo.split("-").map(Number);
        const startMonth = new Date(Date.UTC(year, month - 1, 1)); // inclusive
        const endMonth = new Date(Date.UTC(year, month + 0, 1));   // exclusive (siguiente mes)

        transactions = await transactionRepo
          .createQueryBuilder("transaction")
          .where("transaction.userId = :userId", { userId })
          .andWhere("transaction.date >= :startDate", { startDate: startMonth })
          .andWhere("transaction.date < :endDate", { endDate: endMonth })
          .orderBy("transaction.date", "ASC")
          .getMany();
        break;
      }

      case "year": {
        if (!periodo) throw new Error("Año requerido para filtro anual (YYYY)");
        const yearNum = parseInt(periodo, 10);
        const startYear = new Date(Date.UTC(yearNum, 0, 1));           // inclusive
        const endYear = new Date(Date.UTC(yearNum + 1, 0, 1));         // exclusive

        transactions = await transactionRepo
          .createQueryBuilder("transaction")
          .where("transaction.userId = :userId", { userId })
          .andWhere("transaction.date >= :startDate", { startDate: startYear })
          .andWhere("transaction.date < :endDate", { endDate: endYear })
          .orderBy("transaction.date", "ASC")
          .getMany();
        break;
      }

      case "todos": {
        transactions = await transactionRepo.find({
          where: { userId },
          order: { date: "ASC" },
        });
        break;
      }

      default:
        throw new Error("Tipo de filtro temporal no válido");
    }

    // Filtro por tipo de transacción
    if (tipoTransaccion !== "todos") {
      transactions = transactions.filter((t) =>
        tipoTransaccion === "ingresos" ? t.type === "income" : t.type === "expense"
      );
    }

    // Metas
    goals = await goalRepo.find({ where: { userId } });

    // Cálculos
    const summary = this.calculateSummary(transactions);
    const tendencias = this.calculateTendenciasMensuales(transactions, filtroTemporal, periodo);
    const categoriasGastos = this.calculateCategoriasGastos(transactions);
    const progresoMetas = this.calculateProgresoMetas(goals);

    return {
      summary,
      tendencias,
      categoriasGastos,
      progresoMetas,
      filtros: {
        tipo: tipoTransaccion,
        filtroTemporal,
        periodo,
        totalTransacciones: transactions.length,
      },
    };
  },

  calculateSummary(transactions: Transaction[]) {
    let ingresos = 0;
    let gastos = 0;

    for (const t of transactions) {
      if (t.type === "income") ingresos += Number(t.amount);
      else gastos += Number(t.amount);
    }

    return {
      ingresos,
      gastos,
      balanceNeto: ingresos - gastos,
    };
  },

  calculateTendenciasMensuales(
    transactions: Transaction[],
    filtroTemporal: "todos" | "mes" | "year",
    periodo?: string
  ) {
    const tendencias: Array<{ mes: string; ingresos: number; gastos: number; balance: number }> = [];

    // Etiquetador en UTC
    const fmt = new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    // Si es un mes puntual, sumar y etiquetar directo
    if (filtroTemporal === "mes" && periodo) {
      const [y, m] = periodo.split("-").map(Number);
      let ingresos = 0,
        gastos = 0;
        for (const t of transactions) {
            if (t.type === "income") {
                ingresos += Number(t.amount);
            } else {
                gastos += Number(t.amount);
            }
        }
      tendencias.push({
        mes: fmt.format(new Date(Date.UTC(y, m - 1, 1))),
        ingresos,
        gastos,
        balance: ingresos - gastos,
      });
      return tendencias;
    }

    // Agrupar por mes en UTC
    const mesesMap = new Map<string, { ingresos: number; gastos: number }>();
    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const bucket = mesesMap.get(key) || { ingresos: 0, gastos: 0 };
      if (t.type === "income") bucket.ingresos += Number(t.amount);
      else bucket.gastos += Number(t.amount);
      mesesMap.set(key, bucket);
    }

    // Orden y etiquetas en UTC (evita corrimientos por TZ)
    Array.from(mesesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, data]) => {
        const [y, m] = key.split("-").map(Number);
        tendencias.push({
          mes: fmt.format(new Date(Date.UTC(y, m - 1, 1))),
          ingresos: data.ingresos,
          gastos: data.gastos,
          balance: data.ingresos - data.gastos,
        });
      });

    return tendencias;
  },

  calculateCategoriasGastos(transactions: Transaction[]) {
    const categoriasMap = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const monto = Number(t.amount);
      categoriasMap.set(t.category, (categoriasMap.get(t.category) || 0) + monto);
    }
    return Array.from(categoriasMap.entries())
      .map(([categoria, monto]) => ({ categoria, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10);
  },

  calculateProgresoMetas(goals: Goal[]) {
    return goals.map((g) => {
      const objetivo = Number(g.montoObjetivo);
      const actual = Number(g.montoActual);
      const progreso = (actual / objetivo) * 100;
      return {
        id: g.id,
        titulo: g.titulo,
        montoObjetivo: objetivo,
        montoActual: actual,
        restante: objetivo - actual,
        progreso: Math.min(progreso, 100),
        completada: actual >= objetivo,
        fechaObjetivo: g.fechaObjetivo,
      };
    });
  },

  async generateCSV(userId: string, tipo: string, periodo?: string) {
    const reportData = await this.generateReport(userId, tipo, periodo);
    const csvData = {
      summary: reportData.summary,
      tendencias: reportData.tendencias,
      categoriasGastos: reportData.categoriasGastos,
      progresoMetas: reportData.progresoMetas,
      filtros: reportData.filtros,
    };
    try {
      const parser = new Parser();
      return parser.parse(csvData);
    } catch {
      throw new Error("Error al generar CSV");
    }
  },

  async generatePDF(userId: string, tipo: string, periodo?: string) {
    const reportData = await this.generateReport(userId, tipo, periodo);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        // Header
        doc.rect(0, 0, doc.page.width, 80).fill("#2c3e50");
        doc.fillColor("white").fontSize(24).font("Helvetica-Bold").text("FISO", 50, 20);
        doc.fontSize(14).font("Helvetica").text("Sistema de Finanzas Personales", 50, 45);
        doc.fontSize(12).text(`Reporte Generado: ${new Date().toLocaleDateString("es-ES")}`, 50, 65);

        doc.y = 100;
        doc.fillColor("#2c3e50").fontSize(22).font("Helvetica-Bold").text("REPORTE FINANCIERO", { align: "center" });
        doc.moveDown(0.5);

        const filtroText = `Período: ${tipo.toUpperCase()}${periodo ? ` - ${periodo}` : " - TODOS LOS DATOS"}`;
        doc.fontSize(12).font("Helvetica").text(filtroText, { align: "center" });
        doc.moveDown(1);
        doc.strokeColor("#bdc3c7").lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(1);

        // Summary
        doc.fillColor("#2c3e50").fontSize(18).font("Helvetica-Bold").text("RESUMEN FINANCIERO");
        doc.moveDown(0.5);
        const summaryY = doc.y;
        doc.rect(50, summaryY, doc.page.width - 100, 80).stroke("#3498db").lineWidth(2);

        doc.fillColor("#27ae60").fontSize(14).font("Helvetica-Bold").text("INGRESOS", 70, summaryY + 10);
        doc.fillColor("#2c3e50").fontSize(16).font("Helvetica-Bold").text(
          `$${reportData.summary.ingresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          70,
          summaryY + 30
        );

        doc.fillColor("#e74c3c").fontSize(14).font("Helvetica-Bold").text("GASTOS", 250, summaryY + 10);
        doc.fillColor("#2c3e50").fontSize(16).font("Helvetica-Bold").text(
          `$${reportData.summary.gastos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          250,
          summaryY + 30
        );

        doc.fillColor("#f39c12").fontSize(14).font("Helvetica-Bold").text("BALANCE NETO", 430, summaryY + 10);
        const balanceColor = reportData.summary.balanceNeto >= 0 ? "#27ae60" : "#e74c3c";
        doc.fillColor(balanceColor).fontSize(16).font("Helvetica-Bold").text(
          `$${reportData.summary.balanceNeto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          430,
          summaryY + 30
        );

        doc.y = summaryY + 100;
        doc.moveDown(1);

        // Tendencias
        if (reportData.tendencias.length > 0) {
          doc.fillColor("#2c3e50").fontSize(18).font("Helvetica-Bold").text("TENDENCIAS MENSUALES");
          doc.moveDown(0.5);
          const tableY = doc.y;
          const colWidth = (doc.page.width - 100) / 4;

          doc.fillColor("#34495e").fontSize(12).font("Helvetica-Bold");
          ["MES", "INGRESOS", "GASTOS", "BALANCE"].forEach((h, i) => {
            doc.rect(50 + colWidth * i, tableY, colWidth, 25).fill("#ecf0f1");
            doc.fillColor("#34495e").text(h, 60 + colWidth * i, tableY + 8);
          });

          reportData.tendencias.forEach((t: any, idx: number) => {
            const rowY = tableY + 25 + idx * 20;
            doc.fillColor("#2c3e50").fontSize(10).font("Helvetica").text(t.mes, 60, rowY + 5);
            doc.fillColor("#27ae60").text(
              `$${t.ingresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              60 + colWidth,
              rowY + 5
            );
            doc.fillColor("#e74c3c").text(
              `$${t.gastos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              60 + colWidth * 2,
              rowY + 5
            );
            const balColor = t.balance >= 0 ? "#27ae60" : "#e74c3c";
            doc.fillColor(balColor).text(
              `$${t.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              60 + colWidth * 3,
              rowY + 5
            );
          });

          doc.y = tableY + 25 + reportData.tendencias.length * 20 + 20;
          doc.moveDown(1);
        }

        // Categorías
        if (reportData.categoriasGastos.length > 0) {
          doc.fillColor("#2c3e50").fontSize(18).font("Helvetica-Bold").text("TOP CATEGORÍAS DE GASTOS");
          doc.moveDown(0.5);
          const top = reportData.categoriasGastos.slice(0, 5);
          const max = top.length > 0 ? top[0].monto || 1 : 1;

          if (top.length > 0) {
            top.forEach((c: any, i: number) => {
                const barWidth = (c.monto / max) * 300;
                doc.fillColor("#2c3e50").fontSize(12).font("Helvetica-Bold").text(`${i + 1}. ${c.categoria}`, 70, doc.y);
                doc.fillColor("#e74c3c").fontSize(10).text(
                `$${c.monto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                70,
                doc.y + 15
                );
                doc.rect(70, doc.y + 20, barWidth, 8).fill("#e74c3c");
                doc.y += 35;
            });
          } else {
            doc.fillColor("#7f8c8d").fontSize(10).text("Sin categorías de gastos registradas.", 70, doc.y);
            doc.moveDown(1);
          }
        }

        // Metas
        if (reportData.progresoMetas.length > 0) {
          doc.fillColor("#2c3e50").fontSize(18).font("Helvetica-Bold").text("PROGRESO DE METAS");
          doc.moveDown(0.5);

          reportData.progresoMetas.forEach((m: any) => {
            doc.fillColor("#2c3e50").fontSize(12).font("Helvetica-Bold").text(m.titulo, 70, doc.y);
            doc.fillColor("#7f8c8d").fontSize(10).text(
              `$${m.montoActual.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $${m.montoObjetivo.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              70,
              doc.y + 15
            );

            const progressWidth = (m.progreso / 100) * 300;
            doc.rect(70, doc.y + 25, 300, 10).stroke("#bdc3c7");
            doc.rect(70, doc.y + 25, progressWidth, 10).fill(m.completada ? "#27ae60" : "#f39c12");
            doc.fillColor("#2c3e50").fontSize(10).text(`${m.progreso.toFixed(1)}%`, 380, doc.y + 27);
            doc.y += 45;
          });
        }

        // Footer
        doc.y = doc.page.height - 80;
        doc.strokeColor("#bdc3c7").lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fillColor("#7f8c8d").fontSize(10).font("Helvetica").text(
          "Reporte generado automáticamente por FISO - Sistema de Finanzas Personales",
          { align: "center" }
        );

        doc.end();
      } catch (err) {
        reject(new Error("Error al generar PDF"));
      }
    });
  },
};