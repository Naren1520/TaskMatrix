import React, { useState } from 'react';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useTodoState } from '../context/TodoContext';

export const CalendarView = ({ onBack }) => {
  const { todos } = useTodoState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (todos || []).filter(todo => {
      if (todo.trashed) return false;
      const createdDate = new Date(todo.createdAt).toISOString().split('T')[0];
      return createdDate === dateStr;
    });
  };

  // Get all dates that have tasks
  const getDatesWithTasks = () => {
    const dates = new Set();
    (todos || []).forEach(todo => {
      if (!todo.trashed) {
        const date = new Date(todo.createdAt).toISOString().split('T')[0];
        dates.add(date);
      }
    });
    return dates;
  };

  // Calendar grid generation
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const datesWithTasks = getDatesWithTasks();
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-gray-900 p-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-6 font-semibold text-xs sm:text-sm md:text-base"
        >
          <FiArrowLeft size={18} />
          Back to Tasks
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <FiChevronLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="bg-gray-50 dark:bg-gray-700 rounded" />;
                }

                const dateStr = day.toISOString().split('T')[0];
                const hasTask = datesWithTasks.has(dateStr);
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <motion.button
                    key={dateStr}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-lg'
                        : isToday
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : hasTask
                        ? 'bg-green-100 dark:bg-green-900 text-gray-900 dark:text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div>{day.getDate()}</div>
                    {hasTask && (
                      <div className="text-xs mt-1">
                        {getTasksForDate(day).length} task{getTasksForDate(day).length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedDate
                ? selectedDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Select a date'}
            </h3>

            {selectedTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tasks for this date.</p>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map(todo => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <p className={`font-medium text-gray-900 dark:text-white ${
                      todo.completed ? 'line-through text-gray-500' : ''
                    }`}>
                      {todo.text}
                    </p>
                    {todo.priority && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Priority: <span className="font-semibold capitalize">{todo.priority}</span>
                      </p>
                    )}
                    {todo.tags && todo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {todo.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
