import React from 'react';

export const FocusMode = ({ onBack, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Focus Mode</h2>
          <p className="text-sm text-gray-500">A distraction-free workspace to help you concentrate.</p>
        </div>
        <div>
          <button
            onClick={() => onBack && onBack()}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Study Mode Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate && onNavigate('study')}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate('study'); }}
          className="cursor-pointer rounded-xl p-6 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-all duration-200 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Study Mode</h3>
              <p className="text-xs text-gray-500">Minimal UI for focused study sessions with timers and task isolation.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">S</div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Click to open Study Mode. This will take you to a dedicated Study Mode page where you can run timed sessions and concentrate on one task at a time.
          </div>

          <div className="mt-auto flex items-center gap-2">
            <button onClick={() => onNavigate && onNavigate('study')} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Open Study Mode</button>
            <button onClick={() => alert('Study mode description...')} className="px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md text-sm">Learn more</button>
          </div>
        </div>

        {/* Placeholder for other focus utilities */}
        <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow transition-all duration-200">
          <h3 className="text-lg font-semibold">Focus Utilities</h3>
          <p className="mt-2 text-sm text-gray-500">Add timers, ambient sounds, or session statistics here.</p>
        </div>
      </div>
    </div>
  );
};
