import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTickets } from 'contexts/TicketsContext';

function StatCard({ title, value, color }) {
  return (
    <Card sx={{ borderLeft: `6px solid ${color}` }}>
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

  return (
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
    </Grid>
  );
}
