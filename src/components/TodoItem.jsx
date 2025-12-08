// Individual todo item component with edit, delete, alarm, notes, and attachments functionality
import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCheck, FiBell, FiFileText, FiPaperclip, FiStar, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTodoDispatch } from '../context/TodoContext';
// voice input removed
import { AlarmModal } from './AlarmModal';
import { NotesModal } from './NotesModal';
import { AttachmentsModal } from './AttachmentsModal';
import { RecurrenceModal } from './RecurrenceModal';
import { LocationModal } from './LocationModal';

export const TodoItem = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const { updateTodo, trashTask, setAlarm, setNotes, addAttachment, removeAttachment, togglePin } = useTodoDispatch();
  // voice input removed

  // Handle saving edited todo
  const handleSaveEdit = () => {
    if (editText.trim()) {
      updateTodo(todo.id, { text: editText.trim() });
      setIsEditing(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  // Allow saving with Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <>
      <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="todo-item"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Checkbox for marking complete */}
          <button
            onClick={() => updateTodo(todo.id, { completed: !todo.completed })}
            className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              todo.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 dark:border-gray-500 hover:border-green-500'
            }`}
          >
            {todo.completed && <FiCheck className="text-white" size={14} />}
          </button>

          {/* Todo text or edit input */}
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-blue-500 rounded dark:bg-gray-600 dark:text-white focus:outline-none text-sm sm:text-base"
            />
          ) : (
            <span
              className={`flex-1 text-sm sm:text-base lg:text-lg transition-all duration-200 break-words ${
                todo.completed
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {todo.text}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 sm:gap-2 flex-wrap sm:flex-nowrap self-start sm:self-center">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
                className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors duration-200 text-xs sm:text-sm"
              >
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                className="bg-gray-400 hover:bg-gray-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors duration-200 text-xs sm:text-sm"
              >
                Cancel
              </motion.button>
            </>
          ) : (
            <>
              {/* Alarm Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAlarmOpen(true)}
                className={`p-1.5 sm:p-2 rounded transition-colors duration-200 ${
                  todo.alarmTime
                    ? 'text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-gray-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title={todo.alarmTime ? 'Edit Alarm' : 'Set Alarm'}
              >
                <FiBell size={18} />
              </motion.button>

              {/* Location Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLocationOpen(true)}
                className={`p-2 rounded transition-colors duration-200 ${todo.locationReminder && todo.locationReminder.enabled ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                title={todo.locationReminder && todo.locationReminder.enabled ? 'Edit Location Reminder' : 'Add Location Reminder'}
              >
                <FiMapPin size={18} />
              </motion.button>

              {/* Notes Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotesOpen(true)}
                className={`p-2 rounded transition-colors duration-200 ${
                  todo.notes
                    ? 'text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-gray-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title={todo.notes ? 'Edit Notes' : 'Add Notes'}
              >
                <FiFileText size={18} />
              </motion.button>

              {/* Pin Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePin(todo.id)}
                className={`p-2 rounded transition-colors duration-200 ${
                  todo.pinned
                    ? 'text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-gray-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title={todo.pinned ? 'Unpin Task' : 'Pin Task'}
              >
                <FiStar size={18} />
              </motion.button>

              {/* Attachments Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAttachmentsOpen(true)}
                className={`p-2 rounded transition-colors duration-200 ${
                  todo.attachments && todo.attachments.length > 0
                    ? 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-gray-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title={todo.attachments && todo.attachments.length > 0 ? `${todo.attachments.length} attachment(s)` : 'Add Attachments'}
              >
                <FiPaperclip size={18} />
              </motion.button>

              {/* voice input removed */}

              {/* Edit Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors duration-200"
                title="Edit"
              >
                <FiEdit2 size={18} />
              </motion.button>

              {/* Delete Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => trashTask(todo.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-100 dark:hover:bg-gray-600 transition-colors duration-200"
                title="Delete"
              >
                <FiTrash2 size={18} />
              </motion.button>
            </>
          )}
        </div>
      </div>
      </motion.div>
      {isAlarmOpen && (
      <AlarmModal
        isOpen={isAlarmOpen}
        task={todo}
        onSave={(alarm) => {
          setAlarm(todo.id, alarm);
          try {
            window.dispatchEvent(new CustomEvent('todo:alarmChanged', { detail: { id: todo.id } }));
          } catch {
            // ignore
          }
        }}
        onClose={() => setIsAlarmOpen(false)}
      />
    )}
    {isNotesOpen && (
      <NotesModal
        isOpen={isNotesOpen}
        task={todo}
        onSave={(notes) => setNotes(todo.id, notes)}
        onClose={() => setIsNotesOpen(false)}
      />
    )}
    {isAttachmentsOpen && (
      <AttachmentsModal
        isOpen={isAttachmentsOpen}
        task={todo}
        onAddAttachment={addAttachment}
        onRemoveAttachment={removeAttachment}
        onClose={() => setIsAttachmentsOpen(false)}
      />
    )}
    {isLocationOpen && (
      <LocationModal
        isOpen={isLocationOpen}
        task={todo}
        onSave={(payload) => updateTodo(todo.id, { locationReminder: payload })}
        onClose={() => setIsLocationOpen(false)}
      />
    )}
    </>
  );
};
