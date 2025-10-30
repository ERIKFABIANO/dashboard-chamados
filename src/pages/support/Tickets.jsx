import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';

import { useTickets } from 'contexts/TicketsContext';

const statusOptions = ['Aberto', 'Em andamento', 'Fechado'];
const priorityOptions = ['Baixa', 'Média', 'Alta'];

function StatusChip({ status }) {
  const map = {
    Aberto: 'error',
    'Em andamento': 'warning',
    Fechado: 'success'
  };
  const color = map[status] || 'default';
  return <Chip label={status} color={color} size="small" />;
}

export default function Tickets() {
  const { tickets, loading, error, refreshTickets, autoRefresh, setAutoRefresh } = useTickets();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);

  const assigneeOptions = useMemo(() => {
    const s = new Set();
    tickets.forEach((t) => t.assignee && s.add(t.assignee));
    return Array.from(s);
  }, [tickets]);

  const rows = useMemo(() => {
    return tickets
      .map((t, idx) => ({
        id: t.id || idx,
        title: t.title,
        description: t.description,
        status: t.status || 'Aberto',
        priority: t.priority || 'Média',
        assignee: t.assignee,
        requester: t.requester,
        created_at: t.created_at,
        updated_at: t.updated_at,
        raw: t.raw
      }))
      .filter((r) => (filterStatus ? r.status === filterStatus : true))
      .filter((r) => (filterPriority ? r.priority === filterPriority : true))
      .filter((r) => (filterAssignee ? r.assignee === filterAssignee : true))
      .filter((r) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          String(r.title || '').toLowerCase().includes(q) ||
          String(r.description || '').toLowerCase().includes(q) ||
          String(r.requester || '').toLowerCase().includes(q) ||
          String(r.assignee || '').toLowerCase().includes(q)
        );
      });
  }, [tickets, filterStatus, filterPriority, filterAssignee, query]);

  const columns = [
    'ID',
    'Título',
    'Descrição',
    'Status',
    'Prioridade',
    'Responsável',
    'Solicitante',
    'Data de abertura',
    'Data de atualização'
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField select label="Status" fullWidth value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField select label="Prioridade" fullWidth value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            {priorityOptions.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField select label="Responsável" fullWidth value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {assigneeOptions.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField label="Buscar" fullWidth value={query} onChange={(e) => setQuery(e.target.value)} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button variant="contained" onClick={() => refreshTickets()} disabled={loading}>
            Atualizar dados
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button variant={autoRefresh ? 'contained' : 'outlined'} onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? 'Parar auto' : 'Auto 60s'}
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c}>{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * pageSize, page * pageSize + pageSize).map((row) => (
              <TableRow key={row.id} hover onClick={() => setSelected(row)} sx={{ cursor: 'pointer' }}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</TableCell>
                <TableCell>
                  <StatusChip status={row.status} />
                </TableCell>
                <TableCell>{row.priority}</TableCell>
                <TableCell>{row.assignee}</TableCell>
                <TableCell>{row.requester}</TableCell>
                <TableCell>{row.created_at}</TableCell>
                <TableCell>{row.updated_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[5, 10, 20, 50]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>Detalhes do Chamado</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Typography variant="h6">{selected.title}</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                ID: {selected.id} — Status: <StatusChip status={selected.status} /> — Prioridade: {selected.priority}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">{selected.description}</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Responsável: {selected.assignee}</Typography>
                <Typography variant="body2">Solicitante: {selected.requester}</Typography>
                <Typography variant="body2">Criado: {selected.created_at}</Typography>
                <Typography variant="body2">Atualizado: {selected.updated_at}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
