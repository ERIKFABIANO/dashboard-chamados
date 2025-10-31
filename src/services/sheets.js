// Service utilitário para ler dados de tickets de uma planilha pública do Google Sheets (API v4)
// Este arquivo expõe getTicketsFromSheet(spreadsheetId, range, apiKey)
// - spreadsheetId: id da planilha (parte da URL)
// - range: intervalo A1 (ex: 'Sheet1!A1:Z1000')
// - apiKey: chave de API pública (se a planilha for pública, apenas a API key é suficiente)
// Retorna: Promise<Array<Object>> onde cada objeto representa um chamado, com chaves derivadas do cabeçalho.

export async function getTicketsFromSheet(spreadsheetId, range, apiKey) {
  if (!spreadsheetId || !range || !apiKey) {
    throw new Error('spreadsheetId, range e apiKey são obrigatórios');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar planilha: ${res.status} ${text}`);
  }

  const data = await res.json();

  // data.values é uma matriz de linhas; a primeira linha deve ser o cabeçalho
  const rows = data.values || [];
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => String(h).trim());
  const tickets = rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? row[i] : '';
    });
    return obj;
  });

  // Normalização mínima: mapear campos conhecidos para nomes canônicos
  return tickets.map((t) => ({
    id: t.ID || t.Id || t.id || t['Ticket ID'] || t['ticket_id'] || '',
    title: t.Title || t.Título || t.title || t.titulo || '',
    description: t.Description || t.Descrição || t.description || '',
    status: String(t.Status || t.status || '').trim(),
    priority: String(t.Priority || t.Priority || t.priority || '').trim(),
    assignee: t.Assignee || t.Responsavel || t.Responsável || t.assignee || '',
    requester: t.Requester || t.Solicitante || t.requester || '',
    created_at: t['Created At'] || t['Data de abertura'] || t.created_at || '',
    updated_at: t['Updated At'] || t['Data de atualização'] || t.updated_at || '',
    department: t.Department || t.Departamento || t.Setor || t.setor || t.departamento || '',
    raw: t // manter a linha original caso haja campos extras
  }));
}
