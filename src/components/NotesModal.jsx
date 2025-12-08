// Modal component for adding/editing task notes and links
import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';


export const NotesModal = ({ isOpen, task, onSave, onClose }) => {
  const [notes, setNotes] = useState(task?.notes || '');
  const [links, setLinks] = useState(task?.links || []);
  const [newLink, setNewLink] = useState('');

  // Handle saving notes
  const handleSave = () => {
    onSave({ notes: notes.trim(), links });
    onClose();
  };

  const handleAddLink = () => {
    if (!newLink || !newLink.trim()) return;
    setLinks([...links, { id: Date.now(), url: newLink.trim() }]);
    setNewLink('');
  };

  const handleRemoveLink = (id) => {
    setLinks(links.filter(l => l.id !== id));
  };

  // Handle removing notes
  const handleRemoveNotes = () => {
    onSave('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Notes for: {task?.text}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Notes Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add or edit notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none h-32"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notes.length} characters
          </p>
        </div>

        {/* Links Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Links
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <button onClick={handleAddLink} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold">Add</button>
          </div>
          {links && links.length > 0 && (
            <div className="space-y-1">
              {links.map(link => (
                <div key={link.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 truncate hover:underline">{link.url}</a>
                  <button onClick={() => handleRemoveLink(link.id)} className="text-red-500 hover:text-red-700">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Save Notes & Links
          </motion.button>
          {task?.notes && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRemoveNotes}
              className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              Delete
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
