import { useState, useEffect } from 'react';
import { Header, TodoInput, TodoList, FilterButtons, Footer, AlarmReminderNotification, SettingsPage, CalendarView, AnalyticsPage, Loader, TemplatesPage, PluginsPage, TimelinePage, GuidePage, OtherServicesPage, AboutDeveloperPage, AiAssistantPanel, SmartSuggestionsModal, WeatherWidget, TimeTablePage } from './components';
import { FocusMode, StudyMode } from './components';
import { useStudyMode } from './context/StudyModeContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAlarmNotifications, playNotificationSound } from './hooks/useAlarmNotifications';
import useGeofenceWatcher from './hooks/useGeofenceWatcher';
import { useTodoState, useTodoDispatch } from './context/TodoContext';
import './App.css';

function App() {
  // Todos come from central TodoContext
  const { todos } = useTodoState();
  const { bulkImport } = useTodoDispatch();
  const [filter, setFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);
  const [appSettings] = useLocalStorage('appSettings', { alarmVolume: 0.8 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('tasks'); // 'tasks', 'calendar', 'analytics'
  const [isLoading, setIsLoading] = useState(true);
  const [showGeofence, setShowGeofence] = useState(false);

  // AI & Weather Features
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isSmartSuggestionsOpen, setIsSmartSuggestionsOpen] = useState(false);
  const [isTimeTableOpen, setIsTimeTableOpen] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);

  // App-level UI state
  const [triggeredAlarm, setTriggeredAlarm] = useState(null);

  // Show loader for 3 seconds on initial load, then enable geofence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowGeofence(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle alarm notifications
  useAlarmNotifications(todos, (todo) => {
    setTriggeredAlarm(todo);
    // Play tone: priority -> ringtoneLibraryId -> customRingtone -> default synth
    (async () => {
      try {
        // read latest appSettings from localStorage to ensure UI changes take effect immediately
        let volume = 1.0;
        try {
          const raw = window.localStorage.getItem('appSettings');
          const latest = raw ? JSON.parse(raw) : null;
          volume = (latest && latest.alarmVolume != null) ? Number(latest.alarmVolume) : 1.0;
        } catch {
          volume = (appSettings && appSettings.alarmVolume != null) ? Number(appSettings.alarmVolume) : 1.0;
        }
        if (todo?.ringtoneLibraryId) {
          const list = JSON.parse(localStorage.getItem('ringtones') || '[]');
          const entry = list.find(r => r.id === todo.ringtoneLibraryId);
          if (entry && entry.data) {
            const audio = new Audio(entry.data);
            audio.volume = volume;
            // handle optional trim
            if (entry.trim && entry.trim.start) audio.currentTime = Number(entry.trim.start) || 0;
            audio.play().catch(() => playNotificationSound(volume));
            if (entry.trim && entry.trim.end) {
              const duration = (Number(entry.trim.end) - (entry.trim.start || 0)) * 1000;
              setTimeout(()=>audio.pause(), Math.max(0, duration));
            }
            return;
          }
        }

        if (todo?.customRingtone?.data) {
          const cr = todo.customRingtone;
          const audio = new Audio(cr.data);
          audio.volume = volume;
          if (cr.trim && cr.trim.start) audio.currentTime = Number(cr.trim.start) || 0;
          audio.play().catch(() => playNotificationSound(volume));
          if (cr.trim && cr.trim.end) {
            const duration = (Number(cr.trim.end) - (cr.trim.start || 0)) * 1000;
            setTimeout(()=>audio.pause(), Math.max(0, duration));
          }
          return;
        }

        // fallback synth
        playNotificationSound(volume);
      } catch (err) {
        console.error('Error playing alarm sound', err);
        playNotificationSound(undefined);
      }
    })();
  });

  // Location-based reminders - only enable after loader is complete
  useGeofenceWatcher({ enabled: showGeofence });

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Calculate statistics
  const totalTodos = (todos || []).filter(t => !t.trashed).length;
  const completedTodos = (todos || []).filter(todo => todo.completed && !todo.trashed).length;
  const activeTodos = totalTodos - completedTodos;

  // Show loader for 3 seconds on initial load
  if (isLoading) {
    return <Loader />;
  }

  // If study mode is currently running, render only the StudyMode screen (hide header/footer/other UI)
  try {
    const studyCtx = useStudyMode();
    if (studyCtx?.running) {
      return (
        <div className="min-h-screen bg-black">
          <StudyMode onBack={() => setCurrentPage('focus')} />
        </div>
      );
    }
  } catch (err) {
    // if provider not available or hook fails, ignore and render normally
  }

  // Decide what to render in the main area based on app state
  let mainContent = null;

  if (isSettingsOpen) {
    mainContent = (
      <SettingsPage
        onBack={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  } else {
    switch (currentPage) {
      case 'calendar':
        mainContent = <CalendarView onBack={() => setCurrentPage('tasks')} />;
        break;
      case 'templates':
        mainContent = <TemplatesPage onBack={() => setCurrentPage('tasks')} />;
        break;
      case 'analytics':
        mainContent = <AnalyticsPage onBack={() => setCurrentPage('tasks')} />;
        break;
      case 'plugins':
        mainContent = <PluginsPage onBack={() => setCurrentPage('tasks')} />;
        break;
      case 'timeline':
        mainContent = <TimelinePage onBack={() => setCurrentPage('tasks')} />;
        break;
      case 'focus':
        mainContent = <FocusMode onBack={() => setCurrentPage('tasks')} onNavigate={(p) => setCurrentPage(p)} />;
        break;
      case 'study':
        mainContent = <StudyMode onBack={() => setCurrentPage('focus')} />;
        break;
      case 'guide':
        mainContent = <GuidePage onBack={() => setCurrentPage('tasks')} />;
        break;
      case 'other':
        mainContent = <OtherServicesPage onBack={() => setCurrentPage('tasks')} onNavigate={(p) => setCurrentPage(p)} />;
        break;
      case 'about':
        mainContent = <AboutDeveloperPage onBack={() => setCurrentPage('other')} />;
        break;
      case 'tasks':
      default:
        mainContent = (
          <>
            {/* Weather Widget */}
            {import.meta.env.VITE_ENABLE_WEATHER === 'true' && (
              <div className="mb-4">
                <WeatherWidget 
                  city="Mangaluru"
                  onWeatherChange={(weather) => setCurrentWeather(weather)}
                />
              </div>
            )}

            {/* Smart Planner Buttons */}
            {import.meta.env.VITE_ENABLE_AI === 'true' && (
              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => setIsSmartSuggestionsOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  ✨ Smart Suggestions
                </button>
                <button
                  onClick={() => setIsAiPanelOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  💬 AI Assistant
                </button>
              </div>
            )}

            {/* Input for adding todos */}
            <TodoInput />

            {/* Filter buttons */}
            <FilterButtons currentFilter={filter} onFilterChange={setFilter} />

            {/* Todo list with animations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 transition-colors duration-300 card-bg-override">
              <TodoList filter={filter} />
            </div>
          </>
        );
        break;
    }
  }

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 flex flex-col flex-grow">
        {/* Header - always visible */}
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAI={() => setIsAiPanelOpen(true)}
          onOpenSmartSuggestions={() => setIsSmartSuggestionsOpen(true)}
          onOpenTimeTable={() => setIsTimeTableOpen(true)}
          onNavigate={(p) => {
            // close settings if open whenever navigating via header menu
            setIsSettingsOpen(false);
            if (p === 'tasks') {
              setCurrentPage('tasks');
            } else {
              setCurrentPage(p);
            }
          }}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8 flex-grow">
          {mainContent}
        </main>

        {/* Footer with statistics - sticky to bottom */}
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <Footer
            total={totalTodos}
            completed={completedTodos}
            active={activeTodos}
          />
        </div>
      </div>

      {/* Item-level modals are handled inside each TodoItem now. */}

      {/* Alarm Reminder Notification */}
      {triggeredAlarm && (
        <AlarmReminderNotification
          task={triggeredAlarm}
          onDismiss={() => setTriggeredAlarm(null)}
        />
      )}

      {/* AI Assistant Panel */}
      <AiAssistantPanel
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        todos={todos}
        currentWeather={currentWeather}
      />

      {/* Smart Suggestions Modal */}
      <SmartSuggestionsModal
        isOpen={isSmartSuggestionsOpen}
        onClose={() => setIsSmartSuggestionsOpen(false)}
        todos={todos}
        onAddTasks={(newTasks) => {
          bulkImport(newTasks);
        }}
        currentWeather={currentWeather}
      />

      {/* TimeTable Page */}
      <TimeTablePage
        isOpen={isTimeTableOpen}
        onClose={() => setIsTimeTableOpen(false)}
      />
    </div>
  );
}

export default App;
