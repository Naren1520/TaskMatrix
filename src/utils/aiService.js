// AI Service using Google Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Use gemini-pro model (stable and widely available)
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Get task suggestions based on user context
 */
export const getTaskSuggestions = async (userContext = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `As a smart task planning assistant, suggest 5 practical tasks for today based on this context:
${userContext.interests ? `- User interests: ${userContext.interests}` : ''}
${userContext.recentTasks ? `- Recent tasks: ${userContext.recentTasks}` : ''}
${userContext.timeOfDay ? `- Time of day: ${userContext.timeOfDay}` : ''}
${userContext.weather ? `- Weather: ${userContext.weather}` : ''}

Format as JSON array with objects containing: { title, description, priority, estimatedTime, category }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Error getting task suggestions:', error);
    return [];
  }
};

/**
 * Prioritize tasks using AI
 */
export const prioritizeTasks = async (tasks) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const taskList = tasks.map(t => `- ${t.text} (due: ${t.alarmTime || 'no deadline'})`).join('\n');

    const prompt = `Analyze and prioritize these tasks by urgency, impact, and effort:
${taskList}

Return a JSON array with the same tasks but reordered by priority (highest first), and add a "reason" field for each task explaining the priority decision.
Format: [{ original_text, priority_order, reason }]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return tasks;
  } catch (error) {
    console.error('Error prioritizing tasks:', error);
    return tasks;
  }
};

/**
 * Generate daily/weekly plan
 */
export const generateSmartPlan = async (tasks, timeframe = 'daily') => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const taskList = tasks.map(t => `- ${t.text} (${t.alarmTime ? new Date(t.alarmTime).toLocaleString() : 'no deadline'})`).join('\n');

    const prompt = `Create an optimized ${timeframe} plan for these tasks:
${taskList}

Consider:
- Task dependencies and logical order
- Estimated time blocks
- Energy levels throughout the day
- Break times

Return JSON with: { timeBlocks: [{ startTime, endTime, task, notes }], summary, tips }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error generating smart plan:', error);
    return null;
  }
};

/**
 * Summarize long notes
 */
export const summarizeNotes = async (notes) => {
  try {
    if (!notes || notes.length < 50) return notes;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Summarize these notes concisely (2-3 sentences):
${notes}

Maintain key facts and action items.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error summarizing notes:', error);
    return notes;
  }
};

/**
 * Convert notes to subtasks
 */
export const notesToSubtasks = async (notes) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Extract actionable subtasks from these notes:
${notes}

Return as JSON array: [{ title, description, priority, estimatedTime }]
Only include concrete action items.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Error converting notes to subtasks:', error);
    return [];
  }
};

/**
 * Predict ideal time for a task
 */
export const predictTaskTiming = async (task, userPatterns = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Based on task characteristics and user patterns, suggest the best time to schedule this task:

Task: ${task.text}
Duration: ${task.estimatedTime || 'unknown'}
${userPatterns.mostProductiveHours ? `User is most productive: ${userPatterns.mostProductiveHours}` : ''}
${userPatterns.focusPreference ? `Focus preference: ${userPatterns.focusPreference}` : ''}
${userPatterns.recentPattern ? `Recent pattern: ${userPatterns.recentPattern}` : ''}

Return JSON: { recommendedTime, reasoning, alternativeTimes: [] }
(Use 24-hour format, e.g., "09:00")`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error predicting task timing:', error);
    return null;
  }
};

/**
 * Suggest smart reminders based on behavior
 */
export const suggestSmartReminders = async (task, userHistory = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Suggest smart reminder strategy for this task:

Task: ${task.text}
Due: ${task.alarmTime || 'no deadline'}
${userHistory.remindersFrequency ? `User usually sets ${userHistory.remindersFrequency} reminders` : ''}
${userHistory.completionRate ? `User completion rate: ${userHistory.completionRate}%` : ''}
${userHistory.taskCategory ? `Category: ${userHistory.taskCategory}` : ''}

Return JSON: { 
  reminderTimes: ["HH:mm"], 
  reminderMessages: [], 
  followUpStrategy, 
  notificationMethod 
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error suggesting smart reminders:', error);
    return null;
  }
};

/**
 * General AI chat for task assistance
 */
export const askAI = async (question, context = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = `You are a smart task planning assistant helping users manage their tasks.
${contextStr ? `Current context:\n${contextStr}\n` : ''}

User question: ${question}

Provide practical, actionable advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error asking AI:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};
