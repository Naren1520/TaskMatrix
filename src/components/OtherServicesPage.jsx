import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

export const OtherServicesPage = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-2xl font-semibold">Other Services</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => onNavigate && onNavigate('other')} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs sm:text-sm">Refresh</button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBack && onBack()}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm md:text-base"
            >
              <FiArrowLeft size={18} />
              Back
            </motion.button>
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">External tools and services that pair with TaskMatrix.</p>

        <div className="space-y-6">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Budget Tracker</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Embedded Budget Tracker app. Click below to open in the embedded viewer.</p>
            <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-700 border rounded overflow-hidden">
              <iframe title="Budget Tracker" src="https://budget-tracker-xi-ebon.vercel.app/" className="w-full h-full" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Learn more about the developer.</p>
            <div className="flex gap-2">
              <button onClick={() => onNavigate && onNavigate('about')} className="px-4 py-2 bg-indigo-600 text-white rounded">About Developer</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OtherServicesPage;
