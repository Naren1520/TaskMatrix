import React, { useRef, useState } from 'react';
import { FiX, FiUpload, FiTrash2, FiDownload } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';


export const AttachmentsModal = ({ isOpen, task, onAddAttachment, onRemoveAttachment, onClose }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    files.forEach(file => {
      if (file.size > maxFileSize) {
        setError(`File ${file.name} is too large. Max size: 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          url: event.target.result, // Base64 data URL
        };
        onAddAttachment(task.id, attachment);
        setError('');
      };
      reader.onerror = () => {
        setError(`Failed to read ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const isImagePreviewable = (type) => type.startsWith('image/');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Attachments: {task?.text}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors mb-6"
        >
          <FiUpload className="mx-auto text-blue-500 text-4xl mb-2" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload files</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">or drag and drop</p>
          <p className="text-gray-400 text-xs mt-1">Max file size: 5MB (Images, PDFs, Videos, Audio)</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,video/*,audio/*"
          />
        </div>

        {/* Attachments List */}
        {task?.attachments && task.attachments.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Attachments ({task.attachments.length})
            </h3>
            {task.attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-start gap-3"
              >
                {/* Image Preview */}
                {isImagePreviewable(attachment.type) ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center text-3xl">
                    {getFileIcon(attachment.type)}
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={attachment.url}
                    download={attachment.name}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    title="Download"
                  >
                    <FiDownload size={16} />
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRemoveAttachment(task.id, attachment.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No attachments yet.</p>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
