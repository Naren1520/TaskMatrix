// Footer component showing task statistics and developer credit
import { motion } from 'framer-motion';

export const Footer = ({ total, completed, active }) => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
        </div>
        <div className="p-2 sm:p-3 bg-green-50 dark:bg-gray-700 rounded-lg">
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{completed}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
        </div>
        <div className="p-2 sm:p-3 bg-orange-50 dark:bg-gray-700 rounded-lg">
          <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{active}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active</p>
        </div>
      </div>

      {/* Navigation moved to Header menu; footer keeps stats and credit only */}

      {/* Developer Credit */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Developed By <span className="font-semibold text-gray-700 dark:text-gray-300">Naren S J</span>
        </p>
      </div>
    </motion.footer>
  );
};
