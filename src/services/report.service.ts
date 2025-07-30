import { AppDataSource } from "../config/data-source";
import { Report } from "../entities/Report";
import { User } from "../entities/User";
import { Transaction } from "../entities/Transaction";
import { Goal } from "../entities/Goal";
// @ts-ignore
import { Parser } from "json2csv";
// @ts-ignore
import PDFDocument from "pdfkit";

const reportRepo = AppDataSource.getRepository(Report);
const userRepo = AppDataSource.getRepository(User);
const transactionRepo = AppDataSource.getRepository(Transaction);
const goalRepo = AppDataSource.getRepository(Goal);

export const reportService = {
    async create(userId: string, data: Partial<Report>) {
        const user = await userRepo.findOneByOrFail({ id: userId });

        const report = reportRepo.create({
            ...data,
            user,
        });

        return await reportRepo.save(report);
    },

    async getAll(userId: string) {
        return await reportRepo.find({
            where: { userId },
            order: { created_at: "DESC" },
        });
    },

    async generateReport(userId: string, tipo: string, periodo?: string) {
        let transactions: Transaction[] = [];
        let goals: Goal[] = [];

        // Obtener transacciones según el filtro
        switch (tipo) {
            case 'mes':
                if (!periodo) throw new Error("Período requerido para filtro mensual");
                const startMonth = new Date(periodo + '-01');
                const endMonth = new Date(startMonth);
                endMonth.setMonth(endMonth.getMonth() + 1);
                
                transactions = await transactionRepo
                    .createQueryBuilder("transaction")
                    .where("transaction.userId = :userId", { userId })
                    .andWhere("transaction.date >= :startDate", { startDate: startMonth })
                    .andWhere("transaction.date < :endDate", { endDate: endMonth })
                    .orderBy("transaction.date", "ASC")
                    .getMany();
                break;

            case 'year':
                if (!periodo) throw new Error("Año requerido para filtro anual");
                const startYear = new Date(periodo + '-01-01');
                const endYear = new Date(periodo + '-12-31');
                
                transactions = await transactionRepo
                    .createQueryBuilder("transaction")
                    .where("transaction.userId = :userId", { userId })
                    .andWhere("transaction.date >= :startDate", { startDate: startYear })
                    .andWhere("transaction.date <= :endDate", { endDate: endYear })
                    .orderBy("transaction.date", "ASC")
                    .getMany();
                break;

            case 'todos':
                transactions = await transactionRepo.find({
                    where: { user: { id: userId } },
                    order: { date: "ASC" }
                });
                break;

            default:
                throw new Error("Tipo de filtro no válido");
        }

        // Obtener metas
        goals = await goalRepo.find({
            where: { userId }
        });

        // Calcular summary
        const summary = this.calculateSummary(transactions);

        // Calcular tendencias mensuales
        const tendencias = this.calculateTendenciasMensuales(transactions);

        // Calcular categorías con más gastos
        const categoriasGastos = this.calculateCategoriasGastos(transactions);

        // Calcular progreso de metas
        const progresoMetas = this.calculateProgresoMetas(goals);

        const reportData = {
            summary,
            tendencias,
            categoriasGastos,
            progresoMetas,
            filtros: {
                tipo,
                periodo,
                totalTransacciones: transactions.length
            }
        };

        return reportData;
    },

    calculateSummary(transactions: Transaction[]) {
        let ingresos = 0;
        let gastos = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                ingresos += Number(transaction.amount);
            } else {
                gastos += Number(transaction.amount);
            }
        });

        return {
            ingresos,
            gastos,
            balanceNeto: ingresos - gastos
        };
    },

    calculateTendenciasMensuales(transactions: Transaction[]) {
        const tendencias: any[] = [];
        const mesesMap = new Map<string, { ingresos: number, gastos: number }>();

        // Agrupar transacciones por mes
        transactions.forEach(transaction => {
            const fecha = new Date(transaction.date);
            const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

            if (!mesesMap.has(mesKey)) {
                mesesMap.set(mesKey, { ingresos: 0, gastos: 0 });
            }

            const mesData = mesesMap.get(mesKey)!;
            if (transaction.type === 'income') {
                mesData.ingresos += Number(transaction.amount);
            } else {
                mesData.gastos += Number(transaction.amount);
            }
        });

        // Convertir a array ordenado
        Array.from(mesesMap.entries()).sort().forEach(([mesKey, data]) => {
            const fecha = new Date(mesKey + '-01');
            const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            
            tendencias.push({
                mes: mesNombre,
                ingresos: data.ingresos,
                gastos: data.gastos,
                balance: data.ingresos - data.gastos
            });
        });

        return tendencias;
    },

    calculateCategoriasGastos(transactions: Transaction[]) {
        const categoriasMap = new Map<string, number>();

        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                const categoria = transaction.category;
                const monto = Number(transaction.amount);
                
                if (categoriasMap.has(categoria)) {
                    categoriasMap.set(categoria, categoriasMap.get(categoria)! + monto);
                } else {
                    categoriasMap.set(categoria, monto);
                }
            }
        });

        // Convertir a array y ordenar por monto descendente
        return Array.from(categoriasMap.entries())
            .map(([categoria, monto]) => ({ categoria, monto }))
            .sort((a, b) => b.monto - a.monto)
            .slice(0, 10); // Top 10 categorías
    },

    calculateProgresoMetas(goals: Goal[]) {
        return goals.map(goal => {
            const progreso = (Number(goal.montoActual) / Number(goal.montoObjetivo)) * 100;
            const restante = Number(goal.montoObjetivo) - Number(goal.montoActual);
            
            return {
                id: goal.id,
                titulo: goal.titulo,
                montoObjetivo: Number(goal.montoObjetivo),
                montoActual: Number(goal.montoActual),
                restante,
                progreso: Math.min(progreso, 100),
                completada: Number(goal.montoActual) >= Number(goal.montoObjetivo),
                fechaObjetivo: goal.fechaObjetivo
            };
        });
    },

    async update(userId: string, reportId: string, data: Partial<Report>) {
        const report = await reportRepo.findOne({
            where: { id: reportId, userId },
        });

        if (!report) throw new Error("Reporte no encontrado");

        Object.assign(report, data);
        return await reportRepo.save(report);
    },

    async delete(userId: string, reportId: string) {
        const report = await reportRepo.findOne({
            where: { id: reportId, userId },
        });

        if (!report) throw new Error("Reporte no encontrado");

        return await reportRepo.remove(report);
    },

    async generateCSV(userId: string, tipo: string, periodo?: string) {
        const reportData = await this.generateReport(userId, tipo, periodo);
        
        // Preparar datos para CSV
        const csvData = {
            summary: reportData.summary,
            tendencias: reportData.tendencias,
            categoriasGastos: reportData.categoriasGastos,
            progresoMetas: reportData.progresoMetas,
            filtros: reportData.filtros
        };

        try {
            const parser = new Parser();
            
            return parser.parse(csvData);
        } catch (err) {
            throw new Error("Error al generar CSV");
        }
    },

    async generatePDF(userId: string, tipo: string, periodo?: string) {
        const reportData = await this.generateReport(userId, tipo, periodo);
        
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header con logo y título
                doc.rect(0, 0, doc.page.width, 80).fill('#2c3e50');
                doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('FISO', 50, 20);
                doc.fontSize(14).font('Helvetica').text('Sistema de Finanzas Personales', 50, 45);
                doc.fontSize(12).text(`Reporte Generado: ${new Date().toLocaleDateString('es-ES')}`, 50, 65);

                // Resetear posición
                doc.y = 100;

                // Título del reporte
                doc.fillColor('#2c3e50').fontSize(22).font('Helvetica-Bold').text('REPORTE FINANCIERO', { align: 'center' });
                doc.moveDown(0.5);

                // Información del filtro
                const filtroText = `Período: ${tipo.toUpperCase()}${periodo ? ` - ${periodo}` : ' - TODOS LOS DATOS'}`;
                doc.fontSize(12).font('Helvetica').text(filtroText, { align: 'center' });
                doc.moveDown(1);

                // Línea separadora
                doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
                doc.moveDown(1);

                // Summary con diseño mejorado
                doc.fillColor('#2c3e50').fontSize(18).font('Helvetica-Bold').text('RESUMEN FINANCIERO');
                doc.moveDown(0.5);

                // Box para el resumen
                const summaryY = doc.y;
                doc.rect(50, summaryY, doc.page.width - 100, 80).stroke('#3498db').lineWidth(2);
                
                doc.fillColor('#27ae60').fontSize(14).font('Helvetica-Bold').text('INGRESOS', 70, summaryY + 10);
                doc.fillColor('#2c3e50').fontSize(16).font('Helvetica-Bold').text(`$${reportData.summary.ingresos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 70, summaryY + 30);
                
                doc.fillColor('#e74c3c').fontSize(14).font('Helvetica-Bold').text('GASTOS', 250, summaryY + 10);
                doc.fillColor('#2c3e50').fontSize(16).font('Helvetica-Bold').text(`$${reportData.summary.gastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 250, summaryY + 30);
                
                doc.fillColor('#f39c12').fontSize(14).font('Helvetica-Bold').text('BALANCE NETO', 430, summaryY + 10);
                const balanceColor = reportData.summary.balanceNeto >= 0 ? '#27ae60' : '#e74c3c';
                doc.fillColor(balanceColor).fontSize(16).font('Helvetica-Bold').text(`$${reportData.summary.balanceNeto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 430, summaryY + 30);

                doc.y = summaryY + 100;
                doc.moveDown(1);

                // Tendencias mensuales
                if (reportData.tendencias.length > 0) {
                    doc.fillColor('#2c3e50').fontSize(18).font('Helvetica-Bold').text('TENDENCIAS MENSUALES');
                    doc.moveDown(0.5);

                    // Tabla de tendencias
                    const tableY = doc.y;
                    const colWidth = (doc.page.width - 100) / 4;
                    
                    // Headers de la tabla
                    doc.fillColor('#34495e').fontSize(12).font('Helvetica-Bold');
                    doc.rect(50, tableY, colWidth, 25).fill('#ecf0f1');
                    doc.text('MES', 60, tableY + 8);
                    doc.rect(50 + colWidth, tableY, colWidth, 25).fill('#ecf0f1');
                    doc.text('INGRESOS', 60 + colWidth, tableY + 8);
                    doc.rect(50 + colWidth * 2, tableY, colWidth, 25).fill('#ecf0f1');
                    doc.text('GASTOS', 60 + colWidth * 2, tableY + 8);
                    doc.rect(50 + colWidth * 3, tableY, colWidth, 25).fill('#ecf0f1');
                    doc.text('BALANCE', 60 + colWidth * 3, tableY + 8);

                    // Datos de la tabla
                    reportData.tendencias.forEach((tendencia: any, index: number) => {
                        const rowY = tableY + 25 + (index * 20);
                        doc.fillColor('#2c3e50').fontSize(10).font('Helvetica');
                        doc.text(tendencia.mes, 60, rowY + 5);
                        doc.fillColor('#27ae60').text(`$${tendencia.ingresos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 60 + colWidth, rowY + 5);
                        doc.fillColor('#e74c3c').text(`$${tendencia.gastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 60 + colWidth * 2, rowY + 5);
                        const balanceColor = tendencia.balance >= 0 ? '#27ae60' : '#e74c3c';
                        doc.fillColor(balanceColor).text(`$${tendencia.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 60 + colWidth * 3, rowY + 5);
                    });

                    doc.y = tableY + 25 + (reportData.tendencias.length * 20) + 20;
                    doc.moveDown(1);
                }

                // Categorías de gastos
                if (reportData.categoriasGastos.length > 0) {
                    doc.fillColor('#2c3e50').fontSize(18).font('Helvetica-Bold').text('TOP CATEGORÍAS DE GASTOS');
                    doc.moveDown(0.5);

                    reportData.categoriasGastos.slice(0, 5).forEach((categoria: any, index: number) => {
                        const barWidth = (categoria.monto / reportData.categoriasGastos[0].monto) * 300;
                        doc.fillColor('#2c3e50').fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${categoria.categoria}`, 70, doc.y);
                        doc.fillColor('#e74c3c').fontSize(10).text(`$${categoria.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 70, doc.y + 15);
                        doc.rect(70, doc.y + 20, barWidth, 8).fill('#e74c3c');
                        doc.y += 35;
                    });
                    doc.moveDown(1);
                }

                // Progreso de metas
                if (reportData.progresoMetas.length > 0) {
                    doc.fillColor('#2c3e50').fontSize(18).font('Helvetica-Bold').text('PROGRESO DE METAS');
                    doc.moveDown(0.5);

                    reportData.progresoMetas.forEach((meta: any) => {
                        doc.fillColor('#2c3e50').fontSize(12).font('Helvetica-Bold').text(meta.titulo, 70, doc.y);
                        doc.fillColor('#7f8c8d').fontSize(10).text(`$${meta.montoActual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $${meta.montoObjetivo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 70, doc.y + 15);
                        
                        // Barra de progreso
                        const progressWidth = (meta.progreso / 100) * 300;
                        doc.rect(70, doc.y + 25, 300, 10).stroke('#bdc3c7');
                        doc.rect(70, doc.y + 25, progressWidth, 10).fill(meta.completada ? '#27ae60' : '#f39c12');
                        
                        doc.fillColor('#2c3e50').fontSize(10).text(`${meta.progreso.toFixed(1)}%`, 380, doc.y + 27);
                        doc.y += 45;
                    });
                }

                // Footer
                doc.y = doc.page.height - 80;
                doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
                doc.moveDown(0.5);
                doc.fillColor('#7f8c8d').fontSize(10).font('Helvetica').text('Reporte generado automáticamente por FISO - Sistema de Finanzas Personales', { align: 'center' });

                doc.end();
            } catch (err) {
                reject(new Error("Error al generar PDF"));
            }
        });
    },
}; 