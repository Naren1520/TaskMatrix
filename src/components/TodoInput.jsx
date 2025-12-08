// Input component for adding new todos with voice support
import { useState } from 'react';
import { FiPlus, FiMic } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useTodoDispatch } from '../context/TodoContext';
import { useVoiceInput } from '../hooks/useVoiceInput';

export const TodoInput = () => {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState('');
  const [alarmTime, setAlarmTime] = useState('');

  const { addTodo } = useTodoDispatch();

  const handleAddTodoWithText = (text) => {
    if (!text || !text.trim()) return;

    const todo = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      alarmTime: null,
      repeat: 'none',
      snoozeUntil: null,
      notes: '',
      tags: [],
      priority: 'medium',
      subtasks: [],
      attachments: [],
      archived: false,
      trashed: false,
      listId: 'default'
    };

    addTodo(todo);
    setInput('');
    setPriority('medium');
    setTags('');
    setAlarmTime('');
  };

  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput((text) => {
    console.log('Voice callback - updating input:', text);
    setInput(text);
  });

  const handleStopVoice = () => {
    console.log('Stop voice called with transcript:', transcript);
    stopListening();
    // Auto-add task when stopping voice if there's text
    if (transcript && transcript.trim()) {
      setTimeout(() => {
        console.log('Auto-adding task from voice:', transcript);
        handleAddTodoWithText(transcript);
      }, 200);
    }
  };

  const handleAddTodo = () => {
    const text = input.trim();
    if (!text) return;

    const todo = {
      id: uuidv4(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      alarmTime: alarmTime || null,
      repeat: 'none',
      snoozeUntil: null,
      notes: '',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      priority,
      subtasks: [],
      attachments: [],
      archived: false,
      trashed: false,
      listId: 'default'
    };

    addTodo(todo);
    setInput('');
    setPriority('medium');
    setTags('');
    setAlarmTime('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddTodo();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 sm:mb-6"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={isListening && transcript ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 text-sm sm:text-base"
          />

          {isSupported && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? handleStopVoice : startListening}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
              title={isListening ? 'Stop Recording' : 'Start Voice Input'}
            >
              <FiMic size={18} className="hidden sm:inline" />
              <FiMic size={16} className="sm:hidden" />
              <span className="hidden sm:inline">{isListening ? 'Stop' : 'Voice'}</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTodo}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
          >
            <FiPlus size={18} className="hidden sm:inline" />
            <FiPlus size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Add</span>
          </motion.button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center text-xs sm:text-sm flex-wrap">
          <label className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Priority</span>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="px-2 py-1 rounded border dark:bg-gray-700 text-xs sm:text-sm">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <label className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
            <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Tags</span>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="comma,separated" className="px-2 py-1 rounded border dark:bg-gray-700 text-xs sm:text-sm flex-1 sm:flex-none min-w-0" />
          </label>

          <label className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
            <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Alarm</span>
            <input type="datetime-local" value={alarmTime} onChange={e => setAlarmTime(e.target.value)} className="px-2 py-1 rounded border dark:bg-gray-700 text-xs sm:text-sm flex-1 sm:flex-none min-w-0" />
          </label>
        </div>
      </div>
    </motion.div>
  );
};
