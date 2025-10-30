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

  // Transform each row into an object with proper keys
  return rawData.map(row => ({
    id: row[0] || '',
    status: row[1] || '',
    priority: row[2] || '',
    category: row[3] || '',
    subject: row[4] || '',
    assignedTo: row[5] || '',
    requestedBy: row[6] || '',
    createdDate: row[7] || '',
    updatedDate: row[8] || ''
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