import React, { useState } from 'react';
import { FiX, FiDownload, FiPlus, FiTrash2, FiZap } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { askAI } from '../utils/aiService';

export const TimeTablePage = ({ isOpen, onClose }) => {
  const [timetable, setTimetable] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [timeSlots] = useState(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']);

  const generateTimeTable = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for timetable generation');
      return;
    }

    setIsGenerating(true);
    try {
      const context = {
        taskType: 'Generate a weekly timetable',
        userRequirement: prompt,
      };

      const response = await askAI(`Generate a detailed weekly timetable based on this requirement: ${prompt}. Format the response as a structured schedule with specific times and activities/subjects.`, context);

      // Parse AI response to create timetable entries
      const entries = parseAIResponse(response);
      setTimetable(entries);
      setPrompt('');
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('Failed to generate timetable. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseAIResponse = (response) => {
    // Extract schedule information from AI response
    const entries = [];
    let id = 1;

    // Simple parsing logic - split by lines and extract day/time/subject
    const lines = response.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match patterns like "Monday 08:00-09:00: Mathematics" or similar
      const patterns = [
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{2}:\d{2})-(\d{2}:\d{2})[::]?\s*(.+)$/i,
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{2}:\d{2})[::]?\s*(.+)$/i,
      ];

      for (let pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          if (match[3] && !match[4]) {
            // Second pattern matched
            entries.push({
              id: id++,
              day: match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase(),
              time: match[2],
              subject: match[3],
            });
          } else if (match[4]) {
            // First pattern matched
            entries.push({
              id: id++,
              day: match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase(),
              time: match[2],
              subject: match[4],
            });
          }
          break;
        }
      }
    }

    // If no entries were parsed, create manual entries
    if (entries.length === 0) {
      entries.push({
        id: 1,
        day: 'Monday',
        time: '08:00',
        subject: 'Generated from AI: ' + response.substring(0, 50) + '...',
      });
    }

    return entries;
  };

  const addManualEntry = () => {
    const newEntry = {
      id: Date.now(),
      day: 'Monday',
      time: '08:00',
      subject: 'New Subject',
    };
    setTimetable([...timetable, newEntry]);
  };

  const updateEntry = (id, field, value) => {
    setTimetable(timetable.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const deleteEntry = (id) => {
    setTimetable(timetable.filter(entry => entry.id !== id));
  };

  const exportToPDF = () => {
    if (timetable.length === 0) {
      alert('Please generate or add entries to the timetable first');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add title
      doc.setFontSize(18);
      doc.text('Weekly Timetable', pageWidth / 2, 15, { align: 'center' });

      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: 'center' });

      // Create table data
      const tableColumn = ['Day', 'Time', 'Subject/Activity'];
      const tableRows = timetable.map(entry => [
        entry.day,
        entry.time,
        entry.subject,
      ]);

      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 11,
          cellPadding: 8,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 245, 250],
        },
        margin: { top: 30, right: 10, bottom: 10, left: 10 },
      });

      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      doc.save('timetable.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FiZap size={24} />
            AI Timetable Generator
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Generation Section */}
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-white">Generate Timetable with AI</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., College schedule with 4 subjects, 2-hour slots, breaks at 11 and 2 PM"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <button
                onClick={generateTimeTable}
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <FiZap size={18} />
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Timetable Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Timetable Entries</h3>
              <div className="flex gap-2">
                <button
                  onClick={addManualEntry}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FiPlus size={18} />
                  Add Entry
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FiDownload size={18} />
                  Export PDF
                </button>
              </div>
            </div>

            {timetable.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No timetable entries yet. Generate one using AI or add entries manually.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white font-semibold">Day</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white font-semibold">Time</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white font-semibold">Subject/Activity</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((entry, index) => (
                      <tr key={entry.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          <select
                            value={entry.day}
                            onChange={(e) => updateEntry(entry.id, 'day', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {days.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          <select
                            value={entry.time}
                            onChange={(e) => updateEntry(entry.id, 'time', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {timeSlots.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                            <option value={entry.time}>{entry.time}</option>
                          </select>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          <input
                            type="text"
                            value={entry.subject}
                            onChange={(e) => updateEntry(entry.id, 'subject', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {timetable.length > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{timetable.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Entries</p>
              </div>
              <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{new Set(timetable.map(e => e.day)).size}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Days Covered</p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{new Set(timetable.map(e => e.subject)).size}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Unique Subjects</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
