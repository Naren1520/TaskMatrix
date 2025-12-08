import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Sketch = ({ children, w=220, h=110 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="rounded border bg-white dark:bg-gray-800 p-1">
    <rect x="0" y="0" width="100%" height="100%" fill="none" />
    <g fill="none" stroke="#94a3b8" strokeWidth="1.5">{children}</g>
  </svg>
);

export const GuidePage = ({ onBack }) => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guide & Walkthrough</h2>
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

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">TaskMatrix helps you create tasks, set alarms, attach notes/links, pick locations, use templates, and view timelines. Use the top-left menu to navigate between major areas (Tasks, Calendar, Templates, Plugins, Timeline, Guide, Settings).</p>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Tasks (Main screen)</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Add tasks with the input at the top. Each task has actions: set alarm, add notes, add attachments, add location reminder, pin, archive, and delete.</p>
          <div className="flex gap-4 items-start">
            <Sketch>
              <rect x="12" y="12" width="120" height="22" rx="4" stroke="#cbd5e1" />
              <line x1="12" y1="46" x2="200" y2="46" stroke="#cbd5e1" />
              <circle cx="30" cy="76" r="8" fill="#cbd5e1" />
              <rect x="50" y="68" width="120" height="16" rx="3" stroke="#cbd5e1" />
            </Sketch>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Input area → type and press Enter to create a task. Task item shows quick action icons (alarm, note, map, attachments).</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Templates</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Open Templates from the menu. Create reusable task templates, edit them, and apply to pre-fill task fields.</p>
          <Sketch>
            <rect x="8" y="12" width="200" height="26" rx="6" stroke="#cbd5e1" />
            <rect x="8" y="46" width="200" height="16" rx="4" stroke="#cbd5e1" />
            <rect x="8" y="72" width="120" height="16" rx="4" stroke="#cbd5e1" />
          </Sketch>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Alarms & Ringtones</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Set an alarm on a task. You can choose a built-in tone, upload a custom ringtone, trim it, and save to library. Alarm volume follows Settings → App Settings.</p>
          <Sketch>
            <rect x="10" y="12" width="140" height="18" rx="4" stroke="#cbd5e1" />
            <rect x="10" y="40" width="80" height="12" rx="3" stroke="#cbd5e1" />
            <rect x="100" y="40" width="40" height="12" rx="3" stroke="#cbd5e1" />
          </Sketch>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Location Reminders</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Open the location picker from a task to set a lat/lng and radius. Click on the map to pick a location. Leaflet maps are used (no API key required).</p>
          <Sketch>
            <rect x="6" y="6" width="208" height="96" rx="6" stroke="#cbd5e1" />
            <circle cx="60" cy="50" r="6" fill="#ef4444" />
            <line x1="60" y1="62" x2="140" y2="62" stroke="#cbd5e1" />
          </Sketch>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Plugins</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Enable optional plugins from the Plugins page (e.g., Habit, Water, Budget). Enabled plugins add views or features in the app.</p>
          <Sketch>
            <rect x="12" y="12" width="60" height="28" rx="4" stroke="#cbd5e1" />
            <rect x="80" y="12" width="60" height="28" rx="4" stroke="#cbd5e1" />
            <rect x="148" y="12" width="60" height="28" rx="4" stroke="#cbd5e1" />
          </Sketch>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Timeline / Gantt</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Open Timeline from the menu to view tasks on a Gantt chart. Drag to change start/end and use Day/Week/Month zoom controls.</p>
          <Sketch>
            <rect x="6" y="12" width="200" height="22" rx="4" stroke="#cbd5e1" />
            <rect x="30" y="46" width="120" height="16" rx="3" stroke="#3b82f6" fill="#3b82f6" opacity="0.15" />
          </Sketch>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Notes, Links & Attachments</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Open Notes on a task to add freeform notes and inline links. Attachments support files and images. Use the Attachments modal inside a task to upload and preview files.</p>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">Open Settings to adjust time format, notification options, alarm volume, manage ringtones, backup/restore data, and profile details.</p>
        </section>

        <div className="text-xs text-gray-500">Tip: Hover over icons for quick actions. Explore Templates to speed up task creation.</div>
      </div>
    </div>
  );
};

export default GuidePage;
