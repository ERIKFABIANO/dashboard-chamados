// Google Sheets API integration

export const fetchSheetData = async (spreadsheetId, range, apiKey) => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
};

export const transformSheetData = (rawData) => {
  // If no data, return empty array
  if (!rawData || rawData.length === 0) return [];

  // Mapear colunas do Sheets para os campos exibidos na página de "Chamados"
  // Ordem esperada na planilha (A2:M), conforme cabeçalho enviado:
  // A: ID do Chamado
  // B: Data de Abertura
  // C: Data de Fechamento
  // D: Status
  // E: Prioridade
  // F: Motivo
  // G: Solução
  // H: Solicitante
  // I: Agente Responsável
  // J: Departamento
  // K: TMA (minutos)
  // L: FRT (minutos)
  // M: Satisfação do Cliente
  return rawData.map((row) => ({
    id: row[0] || '',
    created_at: row[1] || '',
    updated_at: row[2] || '',
    status: row[3] || '',
    priority: row[4] || '',
    title: row[5] || '', // Motivo como "Título"
    description: row[6] || '', // Solução como "Descrição"
    requester: row[7] || '',
    assignee: row[8] || '',
    department: row[9] || '',
    tma: row[10] || '',
    frt: row[11] || '',
    satisfaction: row[12] || ''
  }));
};

// Helper function to group tickets by a field
export const groupTickets = (tickets, field) => {
  return tickets.reduce((acc, ticket) => {
    const value = ticket[field] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
};

// Helper functions for specific analytics
export const getStatusCounts = (tickets) => {
  return groupTickets(tickets, 'status');
};

export const getPriorityCounts = (tickets) => {
  return groupTickets(tickets, 'priority');
};

export const getCategoryCounts = (tickets) => {
  return groupTickets(tickets, 'category');
};

export const getAssignmentCounts = (tickets) => {
  return groupTickets(tickets, 'assignedTo');
};

export const getRecentActivity = (tickets, limit = 5) => {
  return [...tickets]
    .sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
    .slice(0, limit);
};
