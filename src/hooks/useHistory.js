import { useState, useEffect } from 'react';

const STORAGE_KEY = 'prompt_tester_history';
const MAX_ENTRIES = 50;

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  function addHistory(entry) {
    setHistory(prev => [entry, ...prev].slice(0, MAX_ENTRIES));
  }

  function deleteHistory(id) {
    setHistory(prev => prev.filter(e => e.id !== id));
  }

  function clearHistory() {
    setHistory([]);
  }

  return { history, addHistory, deleteHistory, clearHistory };
}
