import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { fetchSheetData, transformSheetData } from '../api/sheets';

// Context para manter tickets globalmente
const TicketsContext = createContext();

export function useTickets() {
  return useContext(TicketsContext);
}

export default function TicketsProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // Ativado por padrão
  const intervalRef = useRef(null);

  // Config defaults: o usuário pode sobrescrever via variáveis de ambiente ou edição local em config
  const SPREADSHEET_ID = import.meta.env.VITE_SHEETS_SPREADSHEET_ID || '1e4Cs0v7ZTeQpT3fVaIHYyPsxto5ZL_9rT4M_2gosZXA';
  const RANGE = import.meta.env.VITE_SHEETS_RANGE || 'A2:M';
  const API_KEY = import.meta.env.VITE_SHEETS_API_KEY || 'AIzaSyBSjRQcvmgqA78rS9-V7LMaab3BXuHpZ2g';

  async function refreshTickets() {
    if (!SPREADSHEET_ID || !API_KEY) {
      setError('Spreadsheet ID ou API key não configurados. Configure VITE_SHEETS_SPREADSHEET_ID e VITE_SHEETS_API_KEY');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rawData = await fetchSheetData(SPREADSHEET_ID, RANGE, API_KEY);
      const transformedData = transformSheetData(rawData);
      setTickets(transformedData);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  // auto refresh a cada 60s quando habilitado
  useEffect(() => {
    if (autoRefresh) {
      // iniciar imediatamente e em seguida a cada 60s
      refreshTickets();
      intervalRef.current = setInterval(() => refreshTickets(), 60000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  // carregar uma vez ao montar (não obriga autoRefresh)
  useEffect(() => {
    refreshTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    tickets,
    loading,
    error,
    refreshTickets,
    autoRefresh,
    setAutoRefresh
  };

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

TicketsProvider.propTypes = {
  children: PropTypes.node
};
