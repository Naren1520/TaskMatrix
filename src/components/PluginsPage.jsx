import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const PluginsPage = ({ onBack }) => {
  const [appSettings, setAppSettings] = useLocalStorage('appSettings', { plugins: { habit: true, water: true, budget: false } });
  const plugins = appSettings.plugins || { habit: true, water: true, budget: false };

  const toggle = (key) => {
    const next = { ...(appSettings||{}), plugins: { ...(plugins||{}), [key]: !plugins[key] } };
    setAppSettings(next);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plugins</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm md:text-base"
          >
            <FiArrowLeft size={18} />
            Back
          </motion.button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">Enable or disable optional plugins. Enabled plugins will appear across the app where relevant.</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <div className="font-semibold">Habit Tracker</div>
              <div className="text-sm text-gray-500">Track streaks and habits linked to tasks.</div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!plugins.habit} onChange={()=>toggle('habit')} />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <div className="font-semibold">Water Intake</div>
              <div className="text-sm text-gray-500">Simple water logging panel for daily hydration goals.</div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!plugins.water} onChange={()=>toggle('water')} />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <div className="font-semibold">Budget Tracker</div>
              <div className="text-sm text-gray-500">Track expenses and budgets (simple view).</div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!plugins.budget} onChange={()=>toggle('budget')} />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Enabled plugins are persisted to app settings and may reveal additional views in the app.
        </div>
      </div>
    </div>
  );
};

export default PluginsPage;
