import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import useTemplates from '../context/useTemplates';
import { useTodoState } from '../context/TodoContext';

export const TemplatesPage = ({ onBack }) => {
  const { getTemplates, addTemplate, removeTemplate, loadTemplate, duplicateTemplate, updateTemplate } = useTemplates();
  const templates = getTemplates();
  const { todos } = useTodoState();
  const [newName, setNewName] = useState('');

  const handleSaveCurrent = () => {
    if (!newName || !newName.trim()) return alert('Please provide a template name');
    const tpl = {
      name: newName.trim(),
      description: 'Saved from current tasks',
      tasks: (todos || []).map(t => ({ text: t.text, priority: t.priority, tags: t.tags || [], subtasks: (t.subtasks||[]).map(s=>({ text: s.text, completed: s.completed })) }))
    };
    addTemplate(tpl);
    setNewName('');
    alert('Template saved');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm md:text-base mb-4"
        >
          <FiArrowLeft size={18} />
          Back to Tasks
        </motion.button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Templates</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(templates || []).map(t => (
            <div key={t.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <TemplateCard t={t} loadTemplate={loadTemplate} duplicateTemplate={duplicateTemplate} removeTemplate={removeTemplate} updateTemplate={updateTemplate} />
            </div>
          ))}

          {/* Template Card Component */}
          
          
          
          

        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Save Current Tasks As Template</h3>
          <div className="flex gap-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Template name" className="flex-1 px-3 py-2 rounded border dark:bg-gray-700" />
            <button onClick={handleSaveCurrent} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const TemplateCard = ({ t, loadTemplate, duplicateTemplate, removeTemplate, updateTemplate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(t.name || '');
  const [desc, setDesc] = useState(t.description || '');
  const [tasks, setTasks] = useState(t.tasks || []);
  const [newTaskText, setNewTaskText] = useState('');

  const handleSave = () => {
    if (!name || !name.trim()) return alert('Template name required');
    updateTemplate(t.id, { name: name.trim(), description: desc, tasks });
    setIsEditing(false);
    alert('Template updated');
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), priority: 'medium', tags: [], subtasks: [] }]);
    setNewTaskText('');
  };

  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleEditTask = (taskId, updates) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, ...updates } : task));
  };

  return (
    <div>
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Template name" className="w-full px-2 py-1 mb-2 rounded border dark:bg-gray-700 dark:text-white text-sm" />
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="w-full px-2 py-1 mb-2 rounded border dark:bg-gray-700 dark:text-white text-sm" />
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Tasks</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="flex gap-2">
                  <input value={task.text} onChange={(e)=>handleEditTask(task.id, { text: e.target.value })} className="flex-1 px-2 py-1 rounded border dark:bg-gray-600 dark:text-white text-xs" />
                  <button onClick={()=>handleRemoveTask(task.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} placeholder="Add new task" className="flex-1 px-2 py-1 rounded border dark:bg-gray-600 dark:text-white text-xs" />
              <button onClick={handleAddTask} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Add</button>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Save</button>
            <button onClick={()=>{ setIsEditing(false); setName(t.name); setDesc(t.description); setTasks(t.tasks); }} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => loadTemplate(t.id)} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm">Load</button>
              <button onClick={() => duplicateTemplate(t.id)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm">Duplicate</button>
              <button onClick={()=>setIsEditing(true)} className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-sm">Edit</button>
              <button onClick={() => { if (confirm('Delete template?')) removeTemplate(t.id); }} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">Delete</button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            <ul className="list-disc ml-5">
              {(t.tasks||[]).slice(0,6).map((task, i) => <li key={i}>{task.text}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
