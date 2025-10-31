import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTickets } from 'contexts/TicketsContext';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { LineChart, PieChart } from '@mui/x-charts';

function StatCard({ title, value, color }) {
  return (
    <Card sx={{ borderLeft: `6px solid ${color}`, width: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const { tickets } = useTickets();

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => String(t.status).toLowerCase().includes('aberto') || String(t.status).toLowerCase().includes('open')).length;
    const progress = tickets.filter((t) => String(t.status).toLowerCase().includes('andamento') || String(t.status).toLowerCase().includes('in progress') || String(t.status).toLowerCase().includes('progress')).length;
    const closed = tickets.filter((t) => String(t.status).toLowerCase().includes('fechado') || String(t.status).toLowerCase().includes('closed')).length;
    return { total, open, progress, closed };
  }, [tickets]);

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const parseDate = (d) => {
    if (!d) return null;
    const iso = new Date(d);
    if (!Number.isNaN(iso.getTime())) return iso;
    // tentar dd/mm/aaaa
    const parts = String(d).split(/[\/\-]/);
    if (parts.length >= 3) {
      const [dd, mm, yyyy] = parts;
      const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

  const toNumber = (v) => {
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
  };

  const monthlyAverages = useMemo(() => {
    const buckets = Array.from({ length: 12 }, () => ({ tmaSum: 0, tmaCount: 0, frtSum: 0, frtCount: 0 }));
    tickets.forEach((t) => {
      const dt = parseDate(t.created_at);
      const m = dt ? dt.getMonth() : null;
      const tma = toNumber(t.tma);
      const frt = toNumber(t.frt);
      if (m !== null) {
        if (tma !== null) {
          buckets[m].tmaSum += tma;
          buckets[m].tmaCount += 1;
        }
        if (frt !== null) {
          buckets[m].frtSum += frt;
          buckets[m].frtCount += 1;
        }
      }
    });
    const tmaAvg = buckets.map((b) => (b.tmaCount ? Number((b.tmaSum / b.tmaCount).toFixed(1)) : 0));
    const frtAvg = buckets.map((b) => (b.frtCount ? Number((b.frtSum / b.frtCount).toFixed(1)) : 0));
    return { tmaAvg, frtAvg };
  }, [tickets]);

  const openTickets = useMemo(() => {
    const isOpen = (s) => {
      const val = String(s).toLowerCase();
      return val.includes('abert') || val.includes('open');
    };
    const parsed = tickets
      .filter((t) => isOpen(t.status))
      .map((t) => ({
        ...t,
        _date: parseDate(t.created_at)
      }))
      .sort((a, b) => (b._date?.getTime() || 0) - (a._date?.getTime() || 0))
      .slice(0, 10);
    return parsed;
  }, [tickets]);

  const departmentChart = useMemo(() => {
    const counts = {};
    tickets.forEach((t) => {
      const d = t.department || 'Não informado';
      counts[d] = (counts[d] || 0) + 1;
    });
    const data = Object.entries(counts).map(([label, value], idx) => ({ id: idx + 1, label, value }));
    return { data };
  }, [tickets]);

  const prioritySummary = useMemo(() => {
    const counts = {};
    tickets.forEach((t) => {
      const p = (t.priority || 'Não informada').toLowerCase();
      counts[p] = (counts[p] || 0) + 1;
    });
    const normalize = (k) => {
      if (k.includes('urg')) return 'Urgente';
      if (k.includes('alta') || k.includes('high')) return 'Alta';
      if (k.includes('méd') || k.includes('medium')) return 'Média';
      if (k.includes('baix') || k.includes('low')) return 'Baixa';
      return 'Outras';
    };
    const agg = {};
    Object.entries(counts).forEach(([k, v]) => {
      const nk = normalize(k);
      agg[nk] = (agg[nk] || 0) + v;
    });
    const items = [
      { label: 'Urgente', color: 'error' },
      { label: 'Alta', color: 'warning' },
      { label: 'Média', color: 'info' },
      { label: 'Baixa', color: 'default' },
      { label: 'Outras', color: 'success' }
    ].map((i) => ({ ...i, value: agg[i.label] || 0 }));
    return items;
  }, [tickets]);


  return (
    <Box sx={{ mx: 0, px: 0 }}>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Total de chamados" value={stats.total} color="#3f51b5" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Chamados abertos" value={stats.open} color="#f44336" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Em andamento" value={stats.progress} color="#ff9800" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Fechados" value={stats.closed} color="#4caf50" />
      </Grid>

      {/* Linha de separação entre cards e gráficos */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      {/* Dois gráficos abaixo dos cards, lado a lado */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              TMA médio por mês (min)
            </Typography>
            <LineChart
              xAxis={[{ scaleType: 'band', data: monthNames }]}
              series={[{ data: monthlyAverages.tmaAvg, label: 'TMA (min)', color: '#465FFF' }]}
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              FRT médio por mês (min)
            </Typography>
            <LineChart
              xAxis={[{ scaleType: 'band', data: monthNames }]}
              series={[{ data: monthlyAverages.frtAvg, label: 'FRT (min)', color: '#9CB9FF' }]}
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Terceiro dashboard: Donut por Departamento */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Chamados por Departamento</Typography>
            <PieChart
              series={[{ data: departmentChart.data, innerRadius: 80 }]}
              height={280}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Tabela de abertos no final em full-width, ocupando a tela */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Chamados abertos</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Últimos 10 por data de abertura
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small" sx={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Solicitante</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell>Prioridade</TableCell>
                  <TableCell>Aberto em</TableCell>
                  <TableCell align="right">TMA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openTickets.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.requester}</TableCell>
                    <TableCell>{t.department || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.priority || '—'} color={String(t.priority).toLowerCase().includes('urg') ? 'error' : String(t.priority).toLowerCase().includes('alta') || String(t.priority).toLowerCase().includes('high') ? 'warning' : String(t.priority).toLowerCase().includes('méd') || String(t.priority).toLowerCase().includes('medium') ? 'info' : 'default'} />
                    </TableCell>
                    <TableCell>{t.created_at || '—'}</TableCell>
                    <TableCell align="right">{t.tma || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    </Box>
  );
}
