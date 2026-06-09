import { useState, useEffect } from 'react';

const STORAGE_KEY = 'prompt_tester_templates';

export const CATEGORIES = ['마케팅', '글쓰기', '코딩', '교육', '기타'];

export function useTemplates() {
  const [templates, setTemplates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  function saveTemplate({ name, category, promptA, promptB }) {
    const entry = {
      id: Date.now(),
      name: name.trim(),
      category,
      promptA,
      promptB: promptB || '',
      createdAt: new Date().toISOString(),
    };
    setTemplates(prev => [entry, ...prev]);
    return entry;
  }

  function deleteTemplate(id) {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  return { templates, saveTemplate, deleteTemplate };
}
