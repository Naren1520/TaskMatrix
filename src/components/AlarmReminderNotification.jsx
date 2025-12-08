// Notification modal that appears when an alarm triggers
import { FiBell, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const AlarmReminderNotification = ({ task, onDismiss }) => {
  if (!task) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-2xl max-w-sm z-50 p-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <FiBell size={24} />
          </motion.div>
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg">Task Reminder!</h3>
          <p className="text-sm mt-1">It's time for: <span className="font-semibold">{task.text}</span></p>
          {task.notes && (
            <p className="text-xs mt-2 bg-white bg-opacity-20 p-2 rounded line-clamp-2">
              Note: {task.notes}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>
    </motion.div>
  );
};
