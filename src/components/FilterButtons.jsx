// Filter buttons component for All, Active, and Completed filters
import { motion } from 'framer-motion';

export const FilterButtons = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="flex gap-2 justify-center mb-4 sm:mb-6 flex-wrap">
      {filters.map((filter) => (
        <motion.button
          key={filter.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
            currentFilter === filter.value
              ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
          }`}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
};
