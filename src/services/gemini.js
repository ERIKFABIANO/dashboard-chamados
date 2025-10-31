import { GoogleGenerativeAI } from '@google/generative-ai';

// Prioriza o modelo gratuito e estável
const DEFAULT_MODELS = ['gemini-1.5-flash-latest'];

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY não configurada.');
  return new GoogleGenerativeAI(apiKey);
}

async function listAvailableModels() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`ListModels falhou: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return Array.isArray(data.models) ? data.models : [];
}

async function pickAvailableModel() {
  try {
    const models = await listAvailableModels();
    const preferred = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];
    for (const name of preferred) {
      const m = models.find((x) => x.name?.endsWith(name));
      const supports = m?.supportedGenerationMethods || [];
      if (m && supports.includes('generateContent')) return name;
    }
  } catch (_) {
    // se a listagem falhar, usa default
  }
  return DEFAULT_MODELS[0];
}

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

    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODELS[0] });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro na análise do Gemini:', error);
    return 'Não foi possível gerar a análise neste momento.';
  }
}

export async function generateChatResponse(contextText, userQuestion) {
  const genAI = getClient();
  const modelName = await pickAvailableModel();
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = `${contextText}\n\nPergunta do usuário: ${userQuestion}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    if (text) return text;
    throw new Error('Resposta vazia do modelo.');
  } catch (err) {
    // Mensagem amigável para 404/not found ou método não suportado
    const msg = String(err && err.message ? err.message : err);
    if (/not found|NOT_FOUND|is not supported/i.test(msg)) {
      throw new Error('Modelo indisponível para sua cota gratuita. Tente novamente mais tarde.');
    }
    throw err;
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
