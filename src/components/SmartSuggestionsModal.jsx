import React, { useState } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  getTaskSuggestions,
  prioritizeTasks,
  generateSmartPlan,
  notesToSubtasks,
  predictTaskTiming,
  suggestSmartReminders,
} from '../utils/aiService';

export const SmartSuggestionsModal = ({ isOpen, onClose, todos, onAddTasks, currentWeather, profile }) => {
  const [activeTab, setActiveTab] = useState('suggestions'); // suggestions, prioritize, plan, timing
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const context = {
        interests: profile?.interests || '',
        recentTasks: todos.slice(0, 3).map(t => t.text).join(', '),
        weather: currentWeather?.condition || 'unknown',
        timeOfDay: new Date().getHours() > 12 ? 'afternoon' : 'morning',
      };

      const suggestions = await getTaskSuggestions(context);
      setData(suggestions);
      setSelectedSuggestions(suggestions.map((_, i) => i));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrioritize = async () => {
    setLoading(true);
    try {
      const prioritized = await prioritizeTasks(todos);
      setData(prioritized);
    } catch (error) {
      console.error('Error prioritizing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const plan = await generateSmartPlan(todos, 'daily');
      setData(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictTiming = async () => {
    setLoading(true);
    try {
      const timings = [];
      for (const todo of todos.slice(0, 5)) {
        const timing = await predictTaskTiming(todo);
        if (timing) {
          timings.push({ task: todo.text, ...timing });
        }
      }
      setData(timings);
    } catch (error) {
      console.error('Error predicting timing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestions = () => {
    if (!data || !Array.isArray(data)) return;

    const tasksToAdd = selectedSuggestions
      .map(i => data[i])
      .filter(item => item?.title)
      .map(item => ({
        text: item.title || item,
        description: item.description || '',
        priority: item.priority || 'medium',
        estimatedTime: item.estimatedTime || '1h',
        completed: false,
      }));

    if (onAddTasks) {
      onAddTasks(tasksToAdd);
    }

    setSelectedSuggestions([]);
    setData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-96 flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">✨ Smart Suggestions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'suggestions', label: ' Task Suggestions' },
            { id: 'prioritize', label: 'Prioritize Tasks' },
            { id: 'plan', label: 'Daily Plan' },
            { id: 'timing', label: 'Best Timing' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setData(null);
                setSelectedSuggestions([]);
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!data && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {activeTab === 'suggestions' && 'Get AI-powered task suggestions based on your interests and weather'}
                {activeTab === 'prioritize' && 'Let AI prioritize your tasks by urgency and impact'}
                {activeTab === 'plan' && 'Generate an optimized daily schedule'}
                {activeTab === 'timing' && 'Get the best time to schedule each task'}
              </p>
              <button
                onClick={() => {
                  if (activeTab === 'suggestions') handleGetSuggestions();
                  if (activeTab === 'prioritize') handlePrioritize();
                  if (activeTab === 'plan') handleGeneratePlan();
                  if (activeTab === 'timing') handlePredictTiming();
                }}
                disabled={loading || todos.length === 0}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                Generate
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <FiLoader className="animate-spin text-blue-500" size={32} />
              <p className="text-gray-600 dark:text-gray-300">Generating AI insights...</p>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-3">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                  >
                    {activeTab === 'suggestions' && (
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSuggestions([...selectedSuggestions, idx]);
                            } else {
                              setSelectedSuggestions(selectedSuggestions.filter(i => i !== idx));
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                          <div className="flex gap-2 mt-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {item.priority || 'medium'}
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                              {item.estimatedTime || '1h'}
                            </span>
                          </div>
                        </div>
                      </label>
                    )}

                    {activeTab === 'prioritize' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.original_text || item}</h4>
                        {item.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            <span className="font-medium">Why:</span> {item.reason}
                          </p>
                        )}
                        {item.priority_order && (
                          <span className="inline-block mt-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-semibold">
                            Priority #{item.priority_order}
                          </span>
                        )}
                      </div>
                    )}

                    {activeTab === 'plan' && item.timeBlocks && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {item.startTime} - {item.endTime}
                        </h4>
                        <p className="text-gray-900 dark:text-white">{item.task}</p>
                        {item.notes && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.notes}</p>}
                      </div>
                    )}

                    {activeTab === 'timing' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.task}</h4>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          <span className="font-semibold">Recommended time:</span> {item.recommendedTime}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.reasoning}</p>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div>
                  {activeTab === 'plan' && data.summary && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Daily Plan Summary</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{data.summary}</p>
                      {data.tips && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Tips:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {data.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {data && activeTab === 'suggestions' && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
            <button
              onClick={() => {
                setData(null);
                setSelectedSuggestions([]);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSuggestions}
              disabled={selectedSuggestions.length === 0}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              Add Selected ({selectedSuggestions.length})
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
