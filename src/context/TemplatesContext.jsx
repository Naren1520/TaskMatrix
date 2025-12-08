import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useTodoDispatch } from './TodoContext';
import { TemplatesContext, PREBUILT_TEMPLATES } from './templatesCore';

export function TemplatesProvider({ children }) {
  const [stored, setStored] = useLocalStorage('templates', PREBUILT_TEMPLATES);
  const todoDispatch = useTodoDispatch();

  React.useEffect(() => {
    if (!stored || stored.length === 0) setStored(PREBUILT_TEMPLATES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTemplates = () => stored || [];

  const addTemplate = (template) => {
    const tpl = { ...template, id: template.id || uuidv4() };
    const newList = [tpl, ...(stored || [])];
    setStored(newList);
    return tpl;
  };

  const removeTemplate = (id) => {
    const newList = (stored || []).filter(t => t.id !== id);
    setStored(newList);
  };

  const duplicateTemplate = (id) => {
    const tpl = (stored || []).find(t => t.id === id);
    if (!tpl) return null;
    const copy = { ...tpl, id: uuidv4(), name: tpl.name + ' (copy)' };
    setStored([copy, ...(stored || [])]);
    return copy;
  };

  const updateTemplate = (id, updates) => {
    const newList = (stored || []).map(t => t.id === id ? { ...t, ...updates } : t);
    setStored(newList);
    return newList.find(t => t.id === id);
  };

  const loadTemplate = (id) => {
    const tpl = (stored || []).find(t => t.id === id);
    if (!tpl) return false;

    const tasks = (tpl.tasks || []).map(t => ({
      id: uuidv4(),
      text: t.text || '',
      completed: false,
      createdAt: new Date().toISOString(),
      alarmTime: null,
      repeat: 'none',
      snoozeUntil: null,
      notes: t.notes || '',
      tags: t.tags || [],
      priority: t.priority || 'medium',
      subtasks: (t.subtasks || []).map(s => ({ id: uuidv4(), text: s.text || s, completed: !!s.completed })),
      attachments: [],
      archived: false,
      trashed: false,
      listId: 'default'
    }));

    if (todoDispatch && todoDispatch.bulkImport) {
      todoDispatch.bulkImport(tasks);
    } else if (todoDispatch && todoDispatch.addTodo) {
      tasks.forEach(task => todoDispatch.addTodo(task));
    }

    return true;
  };

  return (
    <TemplatesContext.Provider value={{ getTemplates, addTemplate, removeTemplate, updateTemplate, loadTemplate, duplicateTemplate }}>
      {children}
    </TemplatesContext.Provider>
  );
}

export default TemplatesProvider;
