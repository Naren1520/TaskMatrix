import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTodoState } from '../context/TodoContext';

export const AnalyticsPage = ({ onBack }) => {
  const { todos } = useTodoState();
  const visibleTodos = (todos || []).filter(t => !t.trashed);

  // Calculate completion stats by day
  const getCompletionByDay = () => {
    const days = {};
    const last30Days = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push(dateStr);
      days[dateStr] = { date: dateStr, completed: 0, total: 0 };
    }

    visibleTodos.forEach(todo => {
      const createdDate = new Date(todo.createdAt).toISOString().split('T')[0];
      if (days[createdDate]) {
        days[createdDate].total += 1;
        if (todo.completed) days[createdDate].completed += 1;
      }
    });

    return last30Days.map(dateStr => {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: days[dateStr].completed,
        total: days[dateStr].total,
        pending: days[dateStr].total - days[dateStr].completed,
      };
    });
  };

  // Calculate stats by priority
  const getPriorityStats = () => {
    const stats = { high: 0, medium: 0, low: 0 };
    const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

    visibleTodos.forEach(todo => {
      const priority = todo.priority || 'medium';
      stats[priority] = (stats[priority] || 0) + 1;
    });

    return [
      { name: 'High', value: stats.high, fill: colors.high },
      { name: 'Medium', value: stats.medium, fill: colors.medium },
      { name: 'Low', value: stats.low, fill: colors.low },
    ].filter(p => p.value > 0);
  };

  // Calculate stats by tags
  const getTagStats = () => {
    const tagCounts = {};

    visibleTodos.forEach(todo => {
      (todo.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    return Object.entries(tagCounts)
      .map(([tag, count], idx) => ({
        name: tag,
        value: count,
        fill: colors[idx % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // Overall stats
  const totalTasks = visibleTodos.length;
  const completedTasks = visibleTodos.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const averagePerDay = totalTasks > 0 ? (totalTasks / 30).toFixed(1) : 0;

  const completionData = getCompletionByDay();
  const priorityData = getPriorityStats();
  const tagData = getTagStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-gray-900 p-4"
    >
      <div className="max-w-7xl mx-auto">
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

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Analytics & Statistics</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: totalTasks, color: 'blue' },
            { label: 'Completed', value: completedTasks, color: 'green' },
            { label: 'Completion Rate', value: `${completionRate}%`, color: 'purple' },
            { label: 'Avg per Day', value: averagePerDay, color: 'indigo' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-50 dark:from-${stat.color}-900 dark:to-${stat.color}-800 rounded-lg shadow-lg p-6`}
            >
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-300`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Completion Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tasks Completed (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
                <Line type="monotone" dataKey="pending" stroke="#ef4444" name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Priority Distribution */}
          {priorityData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tasks by Priority</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" labelLine={false} label={{ fill: '#fff' }} outerRadius={80} fill="#8884d8" dataKey="value">
                    {priorityData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Daily Completion Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Tasks</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#ef4444" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tags Distribution */}
          {tagData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Tags</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tagData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
