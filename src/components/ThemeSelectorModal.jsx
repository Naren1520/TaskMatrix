import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiRotateCcw } from 'react-icons/fi';
import { THEMES, getAvailableThemes, saveThemePreference, saveCustomTheme, getGradientBackgrounds } from '../utils/themeUtils';

export const ThemeSelectorModal = ({ isOpen, onClose, currentTheme }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customColors, setCustomColors] = useState({});
  const [selectedGradient, setSelectedGradient] = useState(0);

  const themes = getAvailableThemes();
  const gradients = getGradientBackgrounds();

  const handleThemeSelect = (themeName) => {
    setSelectedTheme(themeName);
    saveThemePreference(themeName);
    setIsCustomizing(false);
  };

  const handleGradientSelect = (index) => {
    setSelectedGradient(index);
  };

  const handleSaveCustomTheme = () => {
    const fullCustom = {
      ...customColors,
      gradient: gradients[selectedGradient]
    };
    // Persist and apply custom colors immediately
    saveThemePreference(THEMES.CUSTOM, fullCustom);
    setSelectedTheme(THEMES.CUSTOM);
    setIsCustomizing(false);
  };

  const handleResetTheme = () => {
    // Clear custom theme and revert to light
    localStorage.removeItem('customTheme');
    localStorage.setItem('appTheme', THEMES.LIGHT);
    setSelectedTheme(THEMES.LIGHT);
    // Remove any injected theme overrides
    const styleEl = document.getElementById('theme-overrides');
    if (styleEl) styleEl.remove();
  };

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isCustomizing ? '🎨 Customize Theme' : '🎨 Themes'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {!isCustomizing ? (
                <>
                  {/* Preset Themes */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Preset Themes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {themes.map(theme => (
                        <motion.button
                          key={theme.id}
                          onClick={() => handleThemeSelect(theme.id)}
                          className={`p-4 rounded-lg border-2 transition text-center ${
                            selectedTheme === theme.id
                              ? 'border-blue-500 ring-2 ring-blue-300'
                              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-3xl mb-2">{theme.icon}</div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {theme.name}
                          </div>
                          <div className="flex gap-1 mt-2 justify-center">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.secondary }}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>
                        </motion.button>
                      ))}

                      {/* Custom Theme Button */}
                      <motion.button
                        onClick={() => setIsCustomizing(true)}
                        className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 transition text-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">✏️</div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          Create Custom
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4 text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Your theme preference is saved automatically. Customize colors for a unique look!
                  </div>
                </>
              ) : (
                <>
                  {/* Customization Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Gradient Background</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {gradients.map((gradient, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleGradientSelect(index)}
                          className={`h-24 rounded-lg border-2 transition ${
                            selectedGradient === index
                              ? 'border-blue-500 ring-2 ring-blue-300'
                              : 'border-gray-200 dark:border-slate-600'
                          }`}
                          style={{ background: gradient }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t dark:border-slate-700 pt-4 space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Color Palette</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'primary', label: 'Primary', icon: '🎯' },
                        { key: 'secondary', label: 'Secondary', icon: '✨' },
                        { key: 'accent', label: 'Accent', icon: '⭐' },
                        { key: 'success', label: 'Success', icon: '✅' }
                      ].map(color => (
                        <div key={color.key} className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span>{color.icon}</span>
                            {color.label}
                          </label>
                          <input
                            type="color"
                            defaultValue={customColors[color.key] || '#3b82f6'}
                            onChange={(e) => setCustomColors(prev => ({
                              ...prev,
                              [color.key]: e.target.value
                            }))}
                            className="w-full h-10 rounded cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 text-sm text-amber-800 dark:text-amber-200">
                    💡 Tip: Choose complementary colors for the best appearance
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t dark:border-slate-700 p-4 flex justify-between gap-2 bg-white dark:bg-slate-800">
              <button
                onClick={handleResetTheme}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                title="Reset to light theme and clear custom colors"
              >
                <FiRotateCcw size={16} />
                Reset to Default
              </button>
              <div className="flex gap-2">
                {isCustomizing && (
                  <>
                    <button
                      onClick={() => setIsCustomizing(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCustomTheme}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Save Theme
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
