import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiRefreshCw, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { askAI } from '../utils/aiService';

export const AiAssistantPanel = ({ isOpen, onClose, todos, currentWeather }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! I\'m your Smart Task Assistant. I can help you organize tasks, suggest priorities, or answer any planning questions. What would you like help with?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [messageCount, setMessageCount] = useState(1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { id: messageCount + 1, type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setMessageCount(messageCount + 1);

    try {
      // Prepare context
      const tasksSummary = todos && todos.length > 0
        ? todos.slice(0, 5).map(t => `- ${t.text} (${t.completed ? 'done' : 'pending'})`).join('\n')
        : 'No tasks yet';

      const context = {
        totalTasks: todos?.length || 0,
        completedTasks: todos?.filter(t => t.completed).length || 0,
        recentTasks: tasksSummary,
        weatherCondition: currentWeather?.condition || 'unknown',
      };

      // Get AI response
      const response = await askAI(input, context);

      // Add bot message
      const botMessage = { 
        id: messageCount + 2, 
        type: 'bot', 
        text: response 
      };
      setMessages(prev => [...prev, botMessage]);
      setMessageCount(messageCount + 2);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = { 
        id: messageCount + 2, 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      setMessageCount(messageCount + 2);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      { id: 1, type: 'bot', text: 'Hi! I\'m your Smart Task Assistant. I can help you organize tasks, suggest priorities, or answer any planning questions. What would you like help with?' }
    ]);
    setMessageCount(1);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-40 flex flex-col border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <FiZap size={20} />
          AI Assistant
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-b-lg flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleClearChat}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          title="Clear chat"
        >
          <FiRefreshCw size={18} />
        </button>
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <FiSend size={18} />
        </button>
      </form>
    </motion.div>
  );
};
