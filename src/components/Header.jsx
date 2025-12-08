// Header component with title, profile image, settings and main menu
import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { useProfile } from '../context/ProfileContext';
import logo from '../assets/logo.png';

export const Header = ({ isDarkMode, onToggleDarkMode, onOpenSettings, onNavigate, onOpenAI, onOpenSmartSuggestions, onOpenTimeTable }) => {
  const { profile } = useProfile();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [now, setNow] = React.useState(() => new Date());
  const [timeFormat, setTimeFormat] = React.useState(() => {
    try {
      const raw = window.localStorage.getItem('appSettings');
      const app = raw ? JSON.parse(raw) : {};
      return app?.timeFormat || '24';
    } catch {
      return '24';
    }
  });

  // update clock every second and listen for appSettings changes
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    const handler = (e) => {
      try {
        if (e.key === 'appSettings') {
          const val = e.newValue ? JSON.parse(e.newValue) : {};
          setTimeFormat(val?.timeFormat || '24');
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('storage', handler);
    return () => {
      clearInterval(t);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const handleNavigate = (page) => {
    setMenuOpen(false);
    if (onNavigate) onNavigate(page);
  };

  return (
    <header className="app-header bg-gradient-to-r from-blue-500 to-purple-600 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 flex justify-between items-center gap-2 sm:gap-4">
        {/* Left side: Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md overflow-hidden">
            <img
              src={logo}
              alt="TaskMatrix Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
            TaskMatrix
          </h1>
        </div>

        {/* Center: Title (hidden on small screens) */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-blue-100 dark:text-gray-400 text-xs sm:text-sm">Stay organized and productive</p>
        </div>
        
        {/* Right side: Menu, Profile and Settings */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 relative">
          {/* Small live clock (respects 12/24 setting) - always visible */}
          <div className="flex items-center px-2 py-1 rounded bg-white/10 dark:bg-gray-700/30 mr-2">
            <span className="text-xs sm:text-sm text-white dark:text-gray-100 font-medium">
              {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: timeFormat === '12' })}
            </span>
          </div>
          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
              aria-label="Open menu"
              title="Menu"
            >
              <FiMenu className="text-gray-800 dark:text-white text-lg sm:text-xl" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                <button onClick={() => handleNavigate('tasks')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Tasks</button>
                <button onClick={() => handleNavigate('calendar')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Calendar</button>
                <button onClick={() => handleNavigate('analytics')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Analytics</button>
                <button onClick={() => handleNavigate('templates')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Templates</button>
                <button onClick={() => handleNavigate('focus')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Focus Mode</button>
                <button onClick={() => handleNavigate('plugins')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Plugins</button>
                <button onClick={() => handleNavigate('timeline')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Timeline</button>
                <button onClick={() => { setMenuOpen(false); onOpenTimeTable && onOpenTimeTable(); }} className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold">Time Table</button>
                <button onClick={() => handleNavigate('other')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Other Services</button>
                <button onClick={() => handleNavigate('guide')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Guide</button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button onClick={() => { setMenuOpen(false); onOpenSmartSuggestions && onOpenSmartSuggestions(); }} className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold">Smart Suggestions</button>
                <button onClick={() => { setMenuOpen(false); onOpenAI && onOpenAI(); }} className="w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"> AI Assistant</button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button onClick={() => { setMenuOpen(false); onOpenSettings && onOpenSettings(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</button>
              </div>
            )}
          </div>

          {/* Profile Image */}
          {profile?.image ? (
            <img
              src={profile.image}
              alt="Profile"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 sm:border-3 border-white dark:border-gray-700 object-cover cursor-pointer hover:opacity-80 transition-opacity"
              title={profile?.name || 'User'}
            />
          ) : (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 sm:border-3 border-white dark:border-gray-700 bg-white dark:bg-gray-700 flex items-center justify-center text-sm sm:text-base cursor-pointer hover:opacity-80 transition-opacity">
              👤
            </div>
          )}

          {/* Settings is available inside the menu; no header settings button */}
        </div>
      </div>
    </header>
  );
};
