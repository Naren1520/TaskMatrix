import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { FiX, FiDownload, FiUpload, FiAlertCircle } from 'react-icons/fi';
import { exportAsCSV, exportAsJSON, exportAsPDF, importTasksFromFile } from '../utils/exportUtils';

export const ImportExportModal = ({ isOpen, onClose, todos, onImport }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      
      switch (exportFormat) {
        case 'csv':
          exportAsCSV(todos, `tasks_${timestamp}.csv`);
          break;
        case 'json':
          exportAsJSON(todos, `tasks_${timestamp}.json`);
          break;
        case 'pdf':
          exportAsPDF(todos, `tasks_${timestamp}.pdf`);
          break;
        default:
          break;
      }

      setImportStatus(`Successfully exported as ${exportFormat.toUpperCase()}!`);
      setTimeout(() => setImportStatus(null), 2000);
    } catch (error) {
      setImportError(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportStatus(null);

    try {
      const importedTasks = await importTasksFromFile(file);
      onImport(importedTasks);
      setImportStatus(`Successfully imported ${importedTasks.length} task(s)!`);
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 2000);
    } catch (error) {
      setImportError(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Import & Export
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Export Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiDownload size={18} /> Export Tasks
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { format: 'csv', label: 'CSV', icon: '📊' },
                      { format: 'json', label: 'JSON', icon: '📄' },
                      { format: 'pdf', label: 'PDF', icon: '📕' }
                    ].map(option => (
                      <button
                        key={option.format}
                        onClick={() => setExportFormat(option.format)}
                        className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                          exportFormat === option.format
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded text-sm text-gray-600 dark:text-gray-300">
                    {exportFormat === 'csv' && '📊 Spreadsheet-friendly format. Open with Excel, Sheets, etc.'}
                    {exportFormat === 'json' && '📄 Complete data format. Perfect for backup and re-import.'}
                    {exportFormat === 'pdf' && '📕 Printable format. Great for sharing and archiving.'}
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t dark:border-slate-700" />

              {/* Import Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiUpload size={18} /> Import Tasks
                </h3>

                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-slate-500 transition cursor-pointer"
                    onClick={handleImportClick}
                  >
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Click to select file
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JSON or CSV format
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    onClick={handleImportClick}
                    disabled={isImporting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    {isImporting ? 'Importing...' : 'Choose File'}
                  </button>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 text-sm text-amber-800 dark:text-amber-200 flex gap-2">
                    <FiAlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                    <p>Imported tasks will be added to your existing tasks. Duplicates are allowed.</p>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {importStatus && (
                <motion.div
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-sm text-green-800 dark:text-green-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                   {importStatus}
                </motion.div>
              )}

              {importError && (
                <motion.div
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-800 dark:text-red-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                   {importError}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t dark:border-slate-700 p-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
