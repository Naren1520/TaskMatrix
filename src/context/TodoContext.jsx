import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Task shape:
// {
//   id, text, completed, createdAt,
//   alarmTime: string|null,
//   repeat: 'none'|'daily'|'weekly',
//   snoozeUntil: string|null,
//   notes: string,
//   tags: string[],
//   priority: 'high'|'medium'|'low',
//   subtasks: [{id,text,completed}],
//   attachments: [{id,name,type,url}],
//   archived: boolean,
//   trashed: boolean,
//   listId: string
// }

export const TodoStateContext = createContext(null);
export const TodoDispatchContext = createContext(null);

const ACTIONS = {
  SET_ALL: 'SET_ALL',
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  SET_ALARM: 'SET_ALARM',
  SET_NOTES: 'SET_NOTES',
  ADD_SUBTASK: 'ADD_SUBTASK',
  TOGGLE_SUBTASK: 'TOGGLE_SUBTASK',
  ADD_TAG: 'ADD_TAG',
  SET_PRIORITY: 'SET_PRIORITY',
  ARCHIVE: 'ARCHIVE',
  TRASH: 'TRASH',
  RESTORE: 'RESTORE',
  REORDER: 'REORDER',
  ADD_ATTACHMENT: 'ADD_ATTACHMENT',
  REMOVE_ATTACHMENT: 'REMOVE_ATTACHMENT',
  TOGGLE_PIN: 'TOGGLE_PIN',
  SET_RECURRENCE: 'SET_RECURRENCE',
  BULK_IMPORT: 'BULK_IMPORT'
};

function todoReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ALL:
      return { ...state, todos: action.payload };
    case ACTIONS.ADD:
      return { ...state, todos: [action.payload, ...state.todos] };
    case ACTIONS.UPDATE:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t) };
    case ACTIONS.DELETE:
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload) };
    case ACTIONS.SET_ALARM:
        return {
          ...state,
          todos: state.todos.map(t => t.id === action.payload.id ? {
            ...t,
            alarmTime: action.payload.alarmTime,
            repeat: action.payload.repeat || 'none',
            snoozeUntil: action.payload.snoozeUntil || null,
            ringtone: action.payload.ringtone || t.ringtone,
            customRingtone: action.payload.customRingtone || t.customRingtone,
            ringtoneLibraryId: action.payload.ringtoneLibraryId || t.ringtoneLibraryId
          } : t)
        };
    case ACTIONS.SET_NOTES:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, notes: action.payload.notes } : t) };
    case ACTIONS.ADD_SUBTASK:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, subtasks: [...(t.subtasks||[]), action.payload.subtask] } : t) };
    case ACTIONS.TOGGLE_SUBTASK:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, subtasks: (t.subtasks||[]).map(s => s.id === action.payload.subtaskId ? { ...s, completed: !s.completed } : s) } : t) };
    case ACTIONS.ADD_TAG:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, tags: Array.from(new Set([...(t.tags||[]), action.payload.tag])) } : t) };
    case ACTIONS.SET_PRIORITY:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, priority: action.payload.priority } : t) };
    case ACTIONS.ARCHIVE:
      return { ...state, todos: state.todos.map(t => t.id === action.payload ? { ...t, archived: true } : t) };
    case ACTIONS.TRASH:
      return { ...state, todos: state.todos.map(t => t.id === action.payload ? { ...t, trashed: true, trashedAt: new Date().toISOString() } : t) };
    case ACTIONS.RESTORE:
      return { ...state, todos: state.todos.map(t => t.id === action.payload ? { ...t, trashed: false, archived: false } : t) };
    case ACTIONS.REORDER:
      return { ...state, todos: action.payload };
    case ACTIONS.ADD_ATTACHMENT:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, attachments: [...(t.attachments||[]), action.payload.attachment] } : t) };
    case ACTIONS.REMOVE_ATTACHMENT:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, attachments: (t.attachments||[]).filter(a => a.id !== action.payload.attachmentId) } : t) };
    case ACTIONS.TOGGLE_PIN:
      return { ...state, todos: state.todos.map(t => t.id === action.payload ? { ...t, pinned: !t.pinned } : t) };
    case ACTIONS.SET_RECURRENCE:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? { ...t, recurrence: action.payload.recurrence } : t) };
    case ACTIONS.BULK_IMPORT:
      return { ...state, todos: [...state.todos, ...action.payload] };
    default:
      return state;
  }
}

export const TodoProvider = ({ children }) => {
  const [storedTodos, setStoredTodos] = useLocalStorage('todos', []);
  const initialState = { todos: storedTodos || [] };
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Keep localStorage in sync with state.todos
  useEffect(() => {
    setStoredTodos(state.todos);
  }, [state.todos, setStoredTodos]);

  // Exposed actions
  const addTodo = (todo) => dispatch({ type: ACTIONS.ADD, payload: todo });
  const updateTodo = (id, updates) => dispatch({ type: ACTIONS.UPDATE, payload: { id, updates } });
  const deleteTodo = (id) => dispatch({ type: ACTIONS.DELETE, payload: id });
  const setAlarm = (id, alarmTimeOrObj, repeat='none', snoozeUntil=null) => {
    if (alarmTimeOrObj && typeof alarmTimeOrObj === 'object') {
      const { alarmTime, repeat: r, snoozeUntil: s, ringtone, customRingtone } = alarmTimeOrObj;
      return dispatch({ type: ACTIONS.SET_ALARM, payload: { id, alarmTime, repeat: r || repeat, snoozeUntil: s || snoozeUntil, ringtone, customRingtone } });
    }
    return dispatch({ type: ACTIONS.SET_ALARM, payload: { id, alarmTime: alarmTimeOrObj, repeat, snoozeUntil } });
  };
  const setNotes = (id, notes) => dispatch({ type: ACTIONS.SET_NOTES, payload: { id, notes } });
  const addSubtask = (id, subtask) => dispatch({ type: ACTIONS.ADD_SUBTASK, payload: { id, subtask } });
  const toggleSubtask = (id, subtaskId) => dispatch({ type: ACTIONS.TOGGLE_SUBTASK, payload: { id, subtaskId } });
  const addTag = (id, tag) => dispatch({ type: ACTIONS.ADD_TAG, payload: { id, tag } });
  const setPriority = (id, priority) => dispatch({ type: ACTIONS.SET_PRIORITY, payload: { id, priority } });
  const archiveTask = (id) => dispatch({ type: ACTIONS.ARCHIVE, payload: id });
  const trashTask = (id) => dispatch({ type: ACTIONS.TRASH, payload: id });
  const restoreTask = (id) => dispatch({ type: ACTIONS.RESTORE, payload: id });
  const reorderTodos = (newTodos) => dispatch({ type: ACTIONS.REORDER, payload: newTodos });
  const addAttachment = (id, attachment) => dispatch({ type: ACTIONS.ADD_ATTACHMENT, payload: { id, attachment } });
  const removeAttachment = (id, attachmentId) => dispatch({ type: ACTIONS.REMOVE_ATTACHMENT, payload: { id, attachmentId } });
  const togglePin = (id) => dispatch({ type: ACTIONS.TOGGLE_PIN, payload: id });
  const setRecurrence = (id, recurrence) => dispatch({ type: ACTIONS.SET_RECURRENCE, payload: { id, recurrence } });
  const bulkImport = (todos) => dispatch({ type: ACTIONS.BULK_IMPORT, payload: todos });
  const setAllTodos = (todos) => dispatch({ type: ACTIONS.SET_ALL, payload: todos });

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={{ addTodo, updateTodo, deleteTodo, setAlarm, setNotes, addSubtask, toggleSubtask, addTag, setPriority, archiveTask, trashTask, restoreTask, reorderTodos, addAttachment, removeAttachment, togglePin, setRecurrence, bulkImport, setAllTodos }}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
};

// Convenience hooks for components to access state and dispatch
export const useTodoState = () => {
  const ctx = React.useContext(TodoStateContext);
  if (!ctx) throw new Error('useTodoState must be used within TodoProvider');
  return ctx;
};

export const useTodoDispatch = () => {
  const ctx = React.useContext(TodoDispatchContext);
  if (!ctx) throw new Error('useTodoDispatch must be used within TodoProvider');
  return ctx;
};
