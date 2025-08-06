import axios from 'axios';


export async function askFinanceBot(message: string, chatHistory: any[] = []) {
    const normalizedHistory = chatHistory.map((item) => ({
      role:
        item.role === 'user'
          ? 'USER'
          : item.role === 'assistant'
          ? 'CHATBOT'
          : 'SYSTEM', // fallback
      message: item.content,
    }));
  
    const systemPrompt = `
      Actúa como un asesor financiero profesional. 
      Solo responde preguntas relacionadas con finanzas personales, economía, ahorro, inversiones, presupuestos y contabilidad básica.
      Si te preguntan algo fuera de este dominio, responde: "Lo siento, solo puedo ayudarte con temas financieros."
    `;
  
    try {
      const response = await axios.post(
        'https://api.cohere.ai/v1/chat',
        {
          message,
          temperature: 0.3,
          chat_history: normalizedHistory,
          connectors: [],
          model: 'command-r-plus',
          prompt_truncation: 'AUTO',
          system_prompt: systemPrompt,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      return response.data.text;
    } catch (error: any) {
      console.error('❌ Error al llamar a la API de Cohere:', error.response?.data || error.message);
      throw error;
    }
  }
  