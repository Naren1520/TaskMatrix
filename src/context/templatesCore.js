import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export const TemplatesContext = React.createContext(null);

export const PREBUILT_TEMPLATES = [
  {
    id: 'tpl-study-planner',
    name: 'Study Planner',
    description: 'Plan study sessions and topics',
    tasks: [
      { text: 'Read chapter 1', priority: 'medium', tags: ['study'], subtasks: [{ id: uuidv4(), text: 'Highlight key points', completed: false }] },
      { text: 'Practice problem set', priority: 'high', tags: ['practice'], subtasks: [{ id: uuidv4(), text: 'Solve Q1-Q5', completed: false }] },
      { text: 'Review notes and summarize', priority: 'low', tags: ['review'], subtasks: [] }
    ]
  },
  {
    id: 'tpl-workout-plan',
    name: 'Workout Plan',
    description: 'Weekly exercise routine',
    tasks: [
      { text: 'Warm-up 10 min', priority: 'medium', tags: ['workout'], subtasks: [] },
      { text: 'Strength training - upper body', priority: 'high', tags: ['workout'], subtasks: [] },
      { text: 'Cooldown & stretch', priority: 'low', tags: ['recovery'], subtasks: [] }
    ]
  },
  {
    id: 'tpl-daily-routine',
    name: 'Daily Routine',
    description: 'Daily essentials list',
    tasks: [
      { text: 'Morning meditation', priority: 'low', tags: ['routine'], subtasks: [] },
      { text: 'Check emails', priority: 'medium', tags: ['work'], subtasks: [] },
      { text: 'Plan top 3 tasks', priority: 'high', tags: ['planning'], subtasks: [] }
    ]
  },
  {
    id: 'tpl-shopping-list',
    name: 'Shopping List',
    description: 'Groceries and supplies',
    tasks: [
      { text: 'Milk', priority: 'low', tags: ['shopping'], subtasks: [] },
      { text: 'Bread', priority: 'low', tags: ['shopping'], subtasks: [] },
      { text: 'Eggs', priority: 'low', tags: ['shopping'], subtasks: [] }
    ]
  }
];

export default TemplatesContext;
