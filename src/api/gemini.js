// Gemini AI integration for ticket analysis

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

export const analyzeTickets = async (tickets) => {
  try {
    const prompt = generateAnalysisPrompt(tickets);
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI analysis');
    }

    const data = await response.json();
    return parseGeminiResponse(data);
  } catch (error) {
    console.error('Error analyzing tickets:', error);
    return {
      summary: 'Failed to generate analysis',
      insights: [],
      recommendations: []
    };
  }
};

const generateAnalysisPrompt = (tickets) => {
  const ticketSummary = generateTicketSummary(tickets);
  
  return `
    Analyze the following help desk ticket data and provide insights:
    
    ${ticketSummary}
    
    Please provide:
    1. A brief summary of the current ticket state
    2. Key insights about patterns and trends
    3. Actionable recommendations for improvement
    
    Focus on identifying:
    - Workload distribution
    - Priority patterns
    - Response times
    - Common issue categories
    - Potential bottlenecks
  `;
};

const generateTicketSummary = (tickets) => {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status.toLowerCase() === 'open').length;
  const highPriority = tickets.filter(t => t.priority.toLowerCase() === 'high').length;
  
  return `
    Total Tickets: ${totalTickets}
    Open Tickets: ${openTickets}
    High Priority: ${highPriority}
    
    Status Distribution:
    ${JSON.stringify(getStatusCount(tickets))}
    
    Priority Distribution:
    ${JSON.stringify(getPriorityCount(tickets))}
    
    Category Distribution:
    ${JSON.stringify(getCategoryCount(tickets))}
  `;
};

const getStatusCount = (tickets) => {
  return countByField(tickets, 'status');
};

const getPriorityCount = (tickets) => {
  return countByField(tickets, 'priority');
};

const getCategoryCount = (tickets) => {
  return countByField(tickets, 'category');
};

const countByField = (tickets, field) => {
  return tickets.reduce((acc, ticket) => {
    const value = ticket[field] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
};

const parseGeminiResponse = (response) => {
  try {
    const text = response.candidates[0].content.parts[0].text;
    
    // Split the response into sections
    const sections = text.split('\n\n');
    
    return {
      summary: sections[0] || 'No summary available',
      insights: extractBulletPoints(sections[1] || ''),
      recommendations: extractBulletPoints(sections[2] || '')
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return {
      summary: 'Failed to parse analysis',
      insights: [],
      recommendations: []
    };
  }
};

const extractBulletPoints = (text) => {
  return text
    .split('\n')
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(line => line.length > 0);
};