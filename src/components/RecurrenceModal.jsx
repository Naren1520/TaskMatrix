import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { RECURRENCE_TYPES, getRecurrenceText } from '../utils/recurringUtils';
import { useTodoDispatch } from '../context/TodoContext';

export const RecurrenceModal = ({ isOpen, onClose, todo }) => {
  const [selectedType, setSelectedType] = useState(todo?.recurrence || null);
  const { setRecurrence } = useTodoDispatch();

  const handleSave = () => {
    setRecurrence(todo.id, selectedType);
    onClose();
  };

  const recurrenceOptions = [
    { value: null, label: 'Never', icon: '❌', desc: 'One-time task' },
    { value: RECURRENCE_TYPES.DAILY, label: 'Daily', icon: '📅', desc: 'Every day' },
    { value: RECURRENCE_TYPES.EVERY_2_DAYS, label: 'Every 2 Days', icon: '📆', desc: 'Every 2 days' },
    { value: RECURRENCE_TYPES.EVERY_3_DAYS, label: 'Every 3 Days', icon: '📇', desc: 'Every 3 days' },
    { value: RECURRENCE_TYPES.WEEKLY, label: 'Weekly', icon: '📅', desc: 'Every week (same day)' },
    { value: RECURRENCE_TYPES.EVERY_2_WEEKS, label: 'Every 2 Weeks', icon: '📋', desc: 'Every 2 weeks' },
    { value: RECURRENCE_TYPES.MONTHLY, label: 'Monthly', icon: '🗓️', desc: 'Every month' },
    { value: RECURRENCE_TYPES.LAST_MONDAY, label: 'Last Monday', icon: '📌', desc: 'Last Monday of each month' },
    { value: RECURRENCE_TYPES.LAST_FRIDAY, label: 'Last Friday', icon: '🎉', desc: 'Last Friday of each month' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-50 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                🔄 Recurring Task
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select how often this task should repeat:
              </p>

              <div className="grid gap-2">
                {recurrenceOptions.map(option => (
                  <motion.button
                    key={option.value || 'never'}
                    onClick={() => setSelectedType(option.value)}
                    className={`p-4 text-left rounded-lg border-2 transition ${
                      selectedType === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{option.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {option.desc}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {selectedType && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-sm text-green-800 dark:text-green-200">
                   This task will repeat <strong>{getRecurrenceText(selectedType).toLowerCase()}</strong>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t dark:border-slate-700 p-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Set Recurrence
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
