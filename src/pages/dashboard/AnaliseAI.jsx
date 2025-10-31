import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { SendOutlined } from '@ant-design/icons';
import { useTickets } from 'contexts/TicketsContext';
import { generateChatResponse } from 'services/gemini';

const AnaliseAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Olá! Sou sua assistente de análise de dados. Posso ajudar você a entender melhor os dados do seu dashboard, identificar tendências e dar sugestões de melhoria. Como posso ajudar?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { tickets } = useTickets();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getDashboardContext = () => {
    // Preparar contexto dos dados do dashboard para a IA
    const ticketStats = {
      total: tickets.length,
      abertos: tickets.filter(t => t.status === 'Aberto').length,
      emAndamento: tickets.filter(t => t.status === 'Em andamento').length,
      fechados: tickets.filter(t => t.status === 'Fechado').length,
      prioridadeAlta: tickets.filter(t => t.priority === 'Alta').length,
      prioridadeMedia: tickets.filter(t => t.priority === 'Média').length,
      prioridadeBaixa: tickets.filter(t => t.priority === 'Baixa').length
    };

    return `Contexto do Dashboard:
- Total de chamados: ${ticketStats.total}
- Chamados abertos: ${ticketStats.abertos}
- Chamados em andamento: ${ticketStats.emAndamento}
- Chamados fechados: ${ticketStats.fechados}
- Prioridade alta: ${ticketStats.prioridadeAlta}
- Prioridade média: ${ticketStats.prioridadeMedia}
- Prioridade baixa: ${ticketStats.prioridadeBaixa}

Você é uma assistente especializada em análise de dados de suporte técnico. Responda com base nesses dados e forneça insights úteis e sugestões práticas.`;
  };

  // Fallback local inteligente: tenta responder perguntas comuns diretamente dos dados
  const generateLocalAnswer = (question) => {
    const q = String(question || '').toLowerCase();
    const has = (s) => q.includes(s);
    const byText = (t, s) => String(t || '').toLowerCase().includes(s);

    // Utilitários de data simples
    const parseDateSafe = (v) => {
      if (!v) return null;
      const s = String(v).trim();
      // tenta dd/mm/aaaa
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const d = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const y = Number(m[3]);
        const dt = new Date(y, mo, d);
        return isNaN(dt.getTime()) ? null : dt;
      }
      // ISO ou outros formatos
      const dt = new Date(s);
      return isNaN(dt.getTime()) ? null : dt;
    };

    const detectPeriod = () => {
      const now = new Date();
      if (has('última semana') || has('ultima semana')) {
        const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from, to: now };
      }
      const dias = q.match(/últimos\s+(\d{1,3})\s+dias|ultimos\s+(\d{1,3})\s+dias/);
      if (dias) {
        const n = Number(dias[1] || dias[2]);
        const from = new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
        return { from, to: now };
      }
      if (has('este mês') || has('este mes')) {
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from, to: now };
      }
      if (has('mês passado') || has('mes passado')) {
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0);
        return { from, to };
      }
      const entre = q.match(/entre\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+e\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (entre) {
        const from = parseDateSafe(entre[1]);
        const to = parseDateSafe(entre[2]);
        if (from && to) return { from, to };
      }
      return null; // sem filtro
    };

    const period = detectPeriod();
    const inPeriod = (t) => {
      if (!period) return true;
      const dt = parseDateSafe(t.created_at) || parseDateSafe(t.updated_at);
      if (!dt) return false;
      return dt >= period.from && dt <= period.to;
    };

    const base = tickets.filter(inPeriod);
    const estado = {
      abertos: base.filter((t) => t.status === 'Aberto'),
      andamento: base.filter((t) => t.status === 'Em andamento'),
      fechados: base.filter((t) => t.status === 'Fechado')
    };
    const prio = {
      alta: base.filter((t) => t.priority === 'Alta'),
      media: base.filter((t) => t.priority === 'Média'),
      baixa: base.filter((t) => t.priority === 'Baixa')
    };

    // Heurística simples para "Marketing": procura em assignee, requester, title e description
    const deptKeywords = ['marketing', 'vendas', 'financeiro', 'rh', 'suporte', 'ti', 'comercial'];
    const mentionedDept = deptKeywords.find((kw) => has(kw));
    const isDeptTicket = (t, kw) =>
      byText(t.department, kw) ||
      byText(t.assignee, kw) ||
      byText(t.requester, kw) ||
      byText(t.title, kw) ||
      byText(t.description, kw);
    const deptTickets = mentionedDept ? base.filter((t) => isDeptTicket(t, mentionedDept)) : [];

    if (mentionedDept) {
      const total = deptTickets.length;
      const abertos = deptTickets.filter((t) => t.status === 'Aberto').length;
      const andamento = deptTickets.filter((t) => t.status === 'Em andamento').length;
      const fechados = deptTickets.filter((t) => t.status === 'Fechado').length;
      const periodText = period ? ` no período selecionado` : '';
      return `${mentionedDept.charAt(0).toUpperCase() + mentionedDept.slice(1)}: ${total} chamados (Abertos: ${abertos}, Em andamento: ${andamento}, Fechados: ${fechados})${periodText}.`;
    }

    if (has('abert') || has('aberto')) {
      return `Chamados abertos: ${estado.abertos.length}.`;
    }
    if (has('andamento') || has('em andamento')) {
      return `Chamados em andamento: ${estado.andamento.length}.`;
    }
    if (has('fechad') || has('fechado')) {
      return `Chamados fechados: ${estado.fechados.length}.`;
    }
    if (has('prioridade alta')) {
      return `Prioridade alta: ${prio.alta.length}.`;
    }
    if (has('prioridade média') || has('prioridade media')) {
      return `Prioridade média: ${prio.media.length}.`;
    }
    if (has('prioridade baixa')) {
      return `Prioridade baixa: ${prio.baixa.length}.`;
    }

    // Resumo padrão
    const periodText = period ? ' (no período selecionado)' : '';
    return `Resumo rápido${periodText}:\n- Total: ${base.length}\n- Abertos: ${estado.abertos.length}\n- Em andamento: ${estado.andamento.length}\n- Fechados: ${estado.fechados.length}\n- Alta: ${prio.alta.length}\n- Média: ${prio.media.length}\n- Baixa: ${prio.baixa.length}`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await generateChatResponse(getDashboardContext(), inputMessage);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      // Loga o erro, mas responde silenciosamente com dados locais
      console.error('Erro Gemini:', err);

      const fallbackText = generateLocalAnswer(userMessage.text);
      const aiMessage = {
        id: Date.now() + 2,
        text: fallbackText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Não exibe banner de erro se houve resposta local
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Análise AI
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Área de mensagens */}
        <Box 
          sx={{ 
            flex: 1, 
            p: 2, 
            overflowY: 'auto',
            backgroundColor: '#fafafa'
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                mb: 2,
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  maxWidth: '70%',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 1, 
                      opacity: 0.7,
                      color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ display: 'inline' }}>
                  Pensando...
                </Typography>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Área de input */}
        <Box sx={{ p: 2, backgroundColor: 'white' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Digite sua pergunta sobre os dados do dashboard..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendOutlined />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AnaliseAI;
