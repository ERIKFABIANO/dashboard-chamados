import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBSjRQcvmgqA78rS9-V7LMaab3BXuHpZ2g');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function analyzeTicketsData(tickets) {
  try {
    const prompt = `
    Analise os seguintes dados de chamados de suporte e forneça insights relevantes:
    
    Total de chamados: ${tickets.length}
    Status dos chamados: ${JSON.stringify(getStatusCount(tickets))}
    Prioridades: ${JSON.stringify(getPriorityCount(tickets))}
    
    Por favor, forneça:
    1. Principais tendências observadas
    2. Áreas que precisam de atenção
    3. Recomendações para melhorar o atendimento
    4. Insights sobre prioridades e distribuição de carga
    5. Previsões e tendências futuras baseadas nos dados atuais
    
    Responda em português, em formato bullet points, de forma concisa e objetiva.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro na análise do Gemini:', error);
    return 'Não foi possível gerar a análise neste momento.';
  }
}

function getStatusCount(tickets) {
  return tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {});
}

function getPriorityCount(tickets) {
  return tickets.reduce((acc, ticket) => {
    acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
    return acc;
  }, {});
}