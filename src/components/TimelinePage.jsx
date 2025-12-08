import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTodoState, useTodoDispatch } from '../context/TodoContext';
import Gantt from 'frappe-gantt';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

// Inject frappe-gantt CSS from CDN at runtime to avoid Vite deep-import resolution issues
const injectFrappeCss = () => {
  if (document.querySelector('link[data-frappe-gantt]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/frappe-gantt/dist/frappe-gantt.css';
  link.setAttribute('data-frappe-gantt', '1');
  document.head.appendChild(link);
};

const viewModeMap = {
  Day: 'Day',
  Week: 'Week',
  Month: 'Month'
};

export const TimelinePage = ({ onBack }) => {
  const { todos } = useTodoState();
  const { updateTodo } = useTodoDispatch();
  const [view, setView] = useState('Day');
  const wrapperRef = useRef(null);
  const ganttRef = useRef(null);

  const tasks = useMemo(() => (todos || []).filter(t => !t.trashed).map(t => ({
    id: t.id,
    name: t.text || 'Untitled',
    start: (t.createdAt ? new Date(t.createdAt).toISOString().slice(0,10) : new Date(0).toISOString().slice(0,10)),
    end: (t.alarmTime ? new Date(t.alarmTime).toISOString().slice(0,10) : (t.createdAt ? new Date(new Date(t.createdAt).getTime() + 3600 * 1000).toISOString().slice(0,10) : new Date(24 * 3600 * 1000).toISOString().slice(0,10))),
    progress: t.completed ? 100 : 0,
    dependencies: ''
  })), [todos]);

  useEffect(() => {
    injectFrappeCss();
    const container = wrapperRef.current;
    if (!container) return;
    // initialize or refresh
    try {
      // clear previous content before (re)creating
      container.innerHTML = '';
      ganttRef.current = new Gantt(container, tasks, {
        view_mode: viewModeMap[view] || 'Day',
        on_date_change: (task, start, end) => {
          try {
            updateTodo(task.id, { createdAt: new Date(start).toISOString(), alarmTime: new Date(end).toISOString() });
          } catch (err) { console.error(err); }
        }
      });
    } catch (err) {
      console.warn('Error initializing Gantt', err);
    }
    // cleanup
    return () => {
      if (container) container.innerHTML = '';
    };
  }, [tasks, view, updateTodo]);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Timeline (Gantt)</h2>
          <p className="text-gray-600 dark:text-gray-300">No tasks to show on the timeline yet.</p>
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm md:text-base"
            >
              <FiArrowLeft size={18} />
              Back to Tasks
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline (Gantt)</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setView('Day')} className={`px-2 py-1 rounded text-xs sm:text-sm ${view==='Day' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Day</button>
            <button onClick={() => setView('Week')} className={`px-2 py-1 rounded text-xs sm:text-sm ${view==='Week' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Week</button>
            <button onClick={() => setView('Month')} className={`px-2 py-1 rounded text-xs sm:text-sm ${view==='Month' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Month</button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm md:text-base ml-auto"
            >
              <FiArrowLeft size={18} />
              Back
            </motion.button>
          </div>
        </div>

        <div ref={wrapperRef} />
      </div>
    </div>
  );
};

export default TimelinePage;
