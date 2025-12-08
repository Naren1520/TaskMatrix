import jsPDF from 'jspdf';

/**
 * Export tasks as CSV
 */
export const exportAsCSV = (todos, filename = 'tasks.csv') => {
  const headers = ['ID', 'Task', 'Status', 'Priority', 'Tags', 'Due Date', 'Notes', 'Pinned', 'Recurring'];
  
  const rows = todos
    .filter(todo => !todo.trashed) // Exclude trashed tasks
    .map(todo => [
      todo.id,
      `"${(todo.text || '').replace(/"/g, '""')}"`, // Escape quotes in text
      todo.completed ? 'Completed' : 'Active',
      todo.priority || 'None',
      (todo.tags || []).join('; '),
      todo.alarmTime ? new Date(todo.alarmTime).toLocaleDateString() : '',
      `"${(todo.notes || '').replace(/"/g, '""')}"`,
      todo.pinned ? 'Yes' : 'No',
      todo.recurrence || 'None'
    ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

/**
 * Export tasks as JSON
 */
export const exportAsJSON = (todos, filename = 'tasks.json') => {
  const dataToExport = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tasks: todos.filter(todo => !todo.trashed).map(todo => {
      return {
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        priority: todo.priority,
        tags: todo.tags || [],
        alarmTime: todo.alarmTime,
        notes: todo.notes,
        createdAt: todo.createdAt,
        pinned: todo.pinned,
        recurrence: todo.recurrence,
        subtasks: todo.subtasks || [],
        attachments: todo.attachments || []
      };
    })
  };

  const jsonContent = JSON.stringify(dataToExport, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

/**
 * Export tasks as PDF
 */
export const exportAsPDF = (todos, filename = 'tasks.pdf') => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const lineHeight = 7;
  const maxWidth = pageWidth - 2 * margin;

  // Title
  pdf.setFontSize(18);
  pdf.text('Task Report', margin, yPosition);
  yPosition += 15;

  // Export date
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Exported: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPosition);
  yPosition += 10;

  // Summary stats
  const total = todos.filter(t => !t.trashed).length;
  const completed = todos.filter(t => !t.trashed && t.completed).length;
  pdf.setFontSize(11);
  pdf.setTextColor(0);
  pdf.text(`Total Tasks: ${total} | Completed: ${completed} | Pending: ${total - completed}`, margin, yPosition);
  yPosition += 12;

  // Separate pinned and regular tasks
  const pinnedTodos = todos.filter(t => !t.trashed && t.pinned);
  const regularTodos = todos.filter(t => !t.trashed && !t.pinned);

  // Render pinned section
  if (pinnedTodos.length > 0) {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('📌 Pinned Tasks', margin, yPosition);
    yPosition += 8;
    
    pinnedTodos.forEach((todo, idx) => {
      yPosition = addTaskToPDF(pdf, todo, idx + 1, margin, yPosition, maxWidth, lineHeight, pageHeight);
    });
    yPosition += 5;
  }

  // Render regular section
  if (regularTodos.length > 0) {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0);
    pdf.text('Tasks', margin, yPosition);
    yPosition += 8;
    
    regularTodos.forEach((todo, idx) => {
      yPosition = addTaskToPDF(pdf, todo, idx + 1, margin, yPosition, maxWidth, lineHeight, pageHeight);
    });
  }

  pdf.save(filename);
};

/**
 * Helper to add a task to PDF with text wrapping
 */
const addTaskToPDF = (pdf, todo, index, margin, yPosition, maxWidth, lineHeight, pageHeight) => {
  if (yPosition > pageHeight - 15) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(0);

  // Task checkbox and number
  const checkbox = todo.completed ? '☑' : '☐';
  const taskLabel = `${checkbox} ${todo.text}`;

  // Split text to fit page width
  const splitText = pdf.splitTextToSize(taskLabel, maxWidth - 5);
  pdf.text(splitText, margin + 5, yPosition);
  yPosition += splitText.length * lineHeight;

  // Add metadata
  pdf.setFontSize(8);
  pdf.setTextColor(100);
  
  const metadata = [];
  if (todo.priority) metadata.push(`Priority: ${todo.priority}`);
  if (todo.tags?.length) metadata.push(`Tags: ${todo.tags.join(', ')}`);
  if (todo.recurrence) metadata.push(`Recurring: ${todo.recurrence}`);
  if (todo.alarmTime) metadata.push(`Due: ${new Date(todo.alarmTime).toLocaleDateString()}`);

  if (metadata.length > 0) {
    pdf.text(metadata.join(' | '), margin + 5, yPosition);
    yPosition += lineHeight + 2;
  }

  pdf.setTextColor(0);
  return yPosition + 3;
};

/**
 * Helper to download file
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import tasks from file
 */
export const importTasksFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let importedTasks = [];

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          importedTasks = data.tasks || [];
        } else if (file.name.endsWith('.csv')) {
          importedTasks = parseCSV(content);
        } else {
          reject(new Error('Unsupported file format. Use JSON or CSV.'));
          return;
        }

        // Validate and clean imported tasks
        const cleanedTasks = importedTasks.map(task => ({
          id: task.id || generateId(),
          text: task.text || '',
          completed: task.completed || false,
          priority: task.priority || 'medium',
          tags: task.tags || [],
          alarmTime: task.alarmTime || null,
          notes: task.notes || '',
          createdAt: task.createdAt || new Date().toISOString(),
          pinned: task.pinned || false,
          recurrence: task.recurrence || null,
          subtasks: task.subtasks || [],
          attachments: task.attachments || [],
          archived: task.archived || false,
          trashed: false,
          listId: task.listId || 'default'
        }));

        resolve(cleanedTasks);
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Parse CSV content
 */
const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  const tasks = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted fields)
    const values = parseCSVLine(line);
    
    if (values.length > 0 && values[0]) {
      tasks.push({
        id: values[0] || generateId(),
        text: values[1] || '',
        completed: values[2]?.toLowerCase() === 'completed',
        priority: values[3] || 'medium',
        tags: values[4] ? values[4].split(';').map(t => t.trim()) : [],
        alarmTime: values[5] ? new Date(values[5]).toISOString() : null,
        notes: values[6] || '',
        pinned: values[7]?.toLowerCase() === 'yes',
        recurrence: values[8] || null
      });
    }
  }

  return tasks;
};

/**
 * Parse CSV line respecting quoted values
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

/**
 * Generate unique ID
 */
const generateId = () => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
