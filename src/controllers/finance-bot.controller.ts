import { Request, Response } from 'express';
import { askFinanceBot } from '../services/finance-bot.service';

export const handleFinanceBot = async (req: Request, res: Response): Promise<void> => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Mensaje requerido.' });
    return;
  }

  try {
    const botResponse = await askFinanceBot(message, history || []);
    res.json({ response: botResponse });
  } catch (err: any) {
    const errorMessage = err.response?.data || err.message || err.toString();
  
    console.error('❌ Error en FinanceBot:', errorMessage);
  
    res.status(500).json({
      error: 'Error interno del asistente financiero.',
      details: errorMessage,
    });
  }
};