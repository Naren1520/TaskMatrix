import React, { useState, useRef } from 'react';
import { FiArrowLeft, FiUpload, FiTrash2, FiRotateCcw, FiDownload, FiSettings } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProfile } from '../context/ProfileContext';
import { useTodoState, useTodoDispatch } from '../context/TodoContext';
import { ImportExportModal } from './ImportExportModal';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { getCurrentTheme } from '../utils/themeUtils';

export const SettingsPage = ({ onBack, isDarkMode, onToggleDarkMode }) => {
  const { profile, updateProfile, uploadProfileImage } = useProfile();
  const { todos } = useTodoState();
  const { restoreTask, deleteTodo, bulkImport, setAllTodos } = useTodoDispatch();
  const [appSettings, setAppSettings] = useLocalStorage('appSettings', {
    timeFormat: '24',
    enableSound: true,
    enablePopup: true,
    alarmVolume: 0.8,
    plugins: { habit: true, water: true, budget: false }
  });

  const updateAppSetting = (partial) => setAppSettings(prev => ({ ...(prev||{}), ...partial }));

  const handleClearAllTasks = () => {
    if (confirm('Clear ALL tasks? This cannot be undone.')) {
      setAllTodos([]);
      alert('All tasks cleared');
    }
  };

  const handleClearCompleted = () => {
    if (confirm('Clear completed tasks?')) {
      const remaining = (todos || []).filter(t => !t.completed);
      setAllTodos(remaining);
      alert('Completed tasks cleared');
    }
  };

  const handleClearArchived = () => {
    if (confirm('Clear archived tasks?')) {
      const remaining = (todos || []).filter(t => !t.archived);
      setAllTodos(remaining);
      alert('Archived tasks cleared');
    }
  };
  const fileInputRef = useRef(null);
  const [userName, setUserName] = useState(profile.name || 'User');
  const [mobileNo, setMobileNo] = useState(profile.mobileNo || '');
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || '');
  const [address, setAddress] = useState(profile.address || '');
  const [email, setEmail] = useState(profile.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || '');
  const [gender, setGender] = useState(profile.gender || '');
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  const trashedTodos = (todos || []).filter(t => t.trashed);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadProfileImage(file);
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: userName,
      mobileNo,
      bloodGroup,
      address,
      email,
      dateOfBirth,
      gender,
    });
    alert('Profile updated!');
  };

  const handleRemoveImage = () => {
    updateProfile({ image: null });
  };

  const handleRestoreTask = (id) => {
    restoreTask(id);
  };

  const handlePermanentlyDelete = (id) => {
    if (confirm('Permanently delete this task? This cannot be undone.')) {
      deleteTodo(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 pb-8 sm:pb-12">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-3 sm:mb-6 font-semibold text-xs sm:text-sm md:text-base"
        >
          <FiArrowLeft size={18} />
          Back to Tasks
        </motion.button>

        {/* Settings Container */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile</h2>

            {/* Profile Image Section */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-500 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">👤</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 flex-1 w-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 text-sm sm:text-base font-semibold"
                >
                  <FiUpload size={18} />
                  Upload Image
                </motion.button>
                {profile.image && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemoveImage}
                    className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 text-sm sm:text-base font-semibold"
                  >
                    <FiTrash2 size={16} className="sm:hidden" />
                    <FiTrash2 size={18} className="hidden sm:inline" />
                    Remove
                  </motion.button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Form Fields - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              {/* Mobile No */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                >
                  <option value="">Select Blood Group</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Address - Full Width */}
            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address"
                rows="3"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 text-xs sm:text-sm resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base"
            >
              Save Profile
            </motion.button>
          </motion.div>

          {/* Theme Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 card-bg-override"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎨 Appearance
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <span className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">
                  Dark Mode: <span className="font-semibold">{isDarkMode ? 'ON' : 'OFF'}</span>
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleDarkMode}
                  className={`w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-white transition-colors duration-200 text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isDarkMode ? ' Light Mode' : ' Dark Mode'}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsThemeSelectorOpen(true)}
                className="w-full themed-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base"
              >
                <FiSettings size={18} className="sm:hidden" />
                <FiSettings size={20} className="hidden sm:inline" />
                Customize Themes & Colors
              </motion.button>
            </div>
          </motion.div>
          {/* App Settings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 card-bg-override"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">⚙️ App Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Format</label>
                <div className="flex gap-2">
                  <button onClick={() => updateAppSetting({ timeFormat: '12' })} className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${appSettings.timeFormat==='12' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>12-hour</button>
                  <button onClick={() => updateAppSetting({ timeFormat: '24' })} className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${appSettings.timeFormat==='24' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>24-hour</button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notifications</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!appSettings.enableSound} onChange={(e)=>updateAppSetting({ enableSound: e.target.checked })} className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Enable sound</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!appSettings.enablePopup} onChange={(e)=>updateAppSetting({ enablePopup: e.target.checked })} className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Enable popup notifications</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alarm Volume: {Math.round((appSettings.alarmVolume||0)*100)}%</label>
                <input type="range" min="0" max="1" step="0.01" value={appSettings.alarmVolume||0.8} onChange={(e)=>updateAppSetting({ alarmVolume: parseFloat(e.target.value) })} />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Reset</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <button onClick={handleClearAllTasks} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm font-medium">Clear All</button>
                <button onClick={handleClearCompleted} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs sm:text-sm font-medium">Clear Done</button>
                <button onClick={handleClearArchived} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs sm:text-sm font-medium">Clear Archived</button>
              </div>
            </div>
          </motion.div>

            {/* Ringtones Library */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 card-bg-override"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">🔊 Ringtones Library</h2>
              <RingtonesManager />
            </motion.div>

          {/* Import/Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 card-bg-override"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              💾 Data Management
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsImportExportOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base"
              >
                <FiDownload size={18} className="sm:hidden" />
                <FiDownload size={20} className="hidden sm:inline" />
                Import / Export
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const backup = JSON.stringify({ todos, profile, timestamp: new Date().toISOString() }, null, 2);
                  const blob = new Blob([backup], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base"
              >
                <FiDownload size={18} className="sm:hidden" />
                <FiDownload size={20} className="hidden sm:inline" />
                Create Full Backup
              </motion.button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 sm:mt-4">
               Export your tasks regularly and backup your data for safety
            </p>
          </motion.div>

          {/* Recycle Bin Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 card-bg-override"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Recycle Bin ({trashedTodos.length})
            </h2>

            {trashedTodos.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No deleted tasks.</p>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {trashedTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-through break-words flex-1">
                      {todo.text}
                    </span>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRestoreTask(todo.id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors duration-200"
                      >
                        <FiRotateCcw size={12} className="sm:hidden" />
                        <FiRotateCcw size={14} className="hidden sm:inline" />
                        <span className="hidden sm:inline">Restore</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePermanentlyDelete(todo.id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors duration-200"
                      >
                        <FiTrash2 size={12} className="sm:hidden" />
                        <FiTrash2 size={14} className="hidden sm:inline" />
                        <span className="hidden sm:inline">Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        todos={todos}
        onImport={bulkImport}
      />

      <ThemeSelectorModal
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        currentTheme={getCurrentTheme()}
      />
    </motion.div>
  );
};

// Map picker no longer requires a Google Maps API key; Leaflet is used dynamically in the LocationModal.

const RingtonesManager = () => {
  const [list, setList] = React.useState(() => JSON.parse(localStorage.getItem('ringtones') || '[]'));
  const fileRef = React.useRef(null);
  const [previewSrc, setPreviewSrc] = React.useState(null);
  const [name, setName] = React.useState('');
    const [previewTrimStart, setPreviewTrimStart] = React.useState(0);
    const [previewTrimEnd, setPreviewTrimEnd] = React.useState(30);

  React.useEffect(()=>{
    const onStorage = (e)=>{ if (e.key==='ringtones') setList(JSON.parse(localStorage.getItem('ringtones')||'[]')); };
    window.addEventListener('storage', onStorage);
    return ()=>window.removeEventListener('storage', onStorage);
  },[]);

  const handleUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewSrc(e.target.result);
      setName(file.name);
      setPreviewTrimStart(0);
      setPreviewTrimEnd(30);
    };
    reader.readAsDataURL(file);
  };

  const saveToLibrary = () => {
    if (!previewSrc) return alert('Upload an audio file first');
    const id = 'r_' + Math.random().toString(36).substr(2,9);
    const entry = { id, name: name || `tone-${id}`, data: previewSrc, type: 'audio/*', trim: { start: Number(previewTrimStart||0), end: Number(previewTrimEnd||30) } };
    const next = [entry, ...list];
    localStorage.setItem('ringtones', JSON.stringify(next));
    setList(next);
    setPreviewSrc(null); setName('');
    setPreviewTrimStart(0); setPreviewTrimEnd(30);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-3">
        <input type="file" ref={fileRef} accept="audio/*" onChange={(e)=>handleUpload(e.target.files?.[0])} className="text-xs sm:text-sm flex-1 sm:flex-none" />
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name (optional)" className="px-2 sm:px-3 py-1.5 sm:py-1 rounded border text-xs sm:text-sm flex-1 sm:flex-none dark:bg-gray-700 dark:border-gray-600" />
        <button onClick={saveToLibrary} className="w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-blue-600 text-white rounded text-xs sm:text-sm font-medium">Save</button>
      </div>
      {previewSrc && (
        <div className="mb-3">
          <p className="text-xs sm:text-sm">Preview:</p>
          <audio src={previewSrc} controls className="w-full" />
          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs">Start (s)</label>
            <input type="number" min="0" value={previewTrimStart} onChange={(e)=>setPreviewTrimStart(Number(e.target.value))} className="w-20 px-2 py-1 text-xs rounded border" />
            <label className="text-xs">End (s)</label>
            <input type="number" min="0" value={previewTrimEnd} onChange={(e)=>setPreviewTrimEnd(Number(e.target.value))} className="w-20 px-2 py-1 text-xs rounded border" />
            <button onClick={()=>{ /* apply is implicit when saving */ alert('Trim values updated for next save'); }} className="px-2 py-1 text-xs bg-green-500 text-white rounded">Apply</button>
          </div>
        </div>
      )}

      <h3 className="font-semibold text-sm sm:text-base mb-2">Saved Ringtones</h3>
      {list.length===0 ? <p className="text-xs sm:text-sm text-gray-500">No ringtones saved.</p> : (
        <div className="space-y-2">
          {list.map(r=> (
            <div key={r.id} className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 w-full">
                <div className="font-medium text-xs sm:text-sm truncate">{r.name}</div>
                <audio src={r.data} controls className="w-full text-xs" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                <button onClick={()=>{ navigator.clipboard.writeText(r.id); alert('ID copied'); }} className="flex-1 sm:flex-none px-2 py-1 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 rounded">Copy ID</button>
                <button onClick={()=>{ if (!confirm('Delete?')) return; const next=list.filter(x=>x.id!==r.id); localStorage.setItem('ringtones', JSON.stringify(next)); setList(next); }} className="flex-1 sm:flex-none px-2 py-1 text-xs sm:text-sm bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
