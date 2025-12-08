import { addDays, addWeeks, addMonths, endOfMonth, isSameDay } from 'date-fns';

/**
 * Recurring task patterns
 */
export const RECURRENCE_TYPES = {
  DAILY: 'daily',
  EVERY_2_DAYS: 'every_2_days',
  EVERY_3_DAYS: 'every_3_days',
  WEEKLY: 'weekly',
  EVERY_2_WEEKS: 'every_2_weeks',
  MONTHLY: 'monthly',
  LAST_FRIDAY: 'last_friday',
  LAST_MONDAY: 'last_monday',
  CUSTOM: 'custom'
};

/**
 * Get readable recurrence text
 */
export const getRecurrenceText = (recurrence) => {
  if (!recurrence) return 'Never';

  const patterns = {
    [RECURRENCE_TYPES.DAILY]: 'Every day',
    [RECURRENCE_TYPES.EVERY_2_DAYS]: 'Every 2 days',
    [RECURRENCE_TYPES.EVERY_3_DAYS]: 'Every 3 days',
    [RECURRENCE_TYPES.WEEKLY]: 'Every week',
    [RECURRENCE_TYPES.EVERY_2_WEEKS]: 'Every 2 weeks',
    [RECURRENCE_TYPES.MONTHLY]: 'Every month',
    [RECURRENCE_TYPES.LAST_FRIDAY]: 'Last Friday of month',
    [RECURRENCE_TYPES.LAST_MONDAY]: 'Last Monday of month',
  };

  return patterns[recurrence] || recurrence;
};

/**
 * Calculate next occurrence date
 */
export const calculateNextOccurrence = (baseDate = new Date(), recurrenceType) => {
  const base = new Date(baseDate);

  switch (recurrenceType) {
    case RECURRENCE_TYPES.DAILY:
      return addDays(base, 1);
    
    case RECURRENCE_TYPES.EVERY_2_DAYS:
      return addDays(base, 2);
    
    case RECURRENCE_TYPES.EVERY_3_DAYS:
      return addDays(base, 3);
    
    case RECURRENCE_TYPES.WEEKLY:
      return addWeeks(base, 1);
    
    case RECURRENCE_TYPES.EVERY_2_WEEKS:
      return addWeeks(base, 2);
    
    case RECURRENCE_TYPES.MONTHLY:
      return addMonths(base, 1);
    
    case RECURRENCE_TYPES.LAST_FRIDAY:
      return getLastFridayOfMonth(addMonths(base, 1));
    
    case RECURRENCE_TYPES.LAST_MONDAY:
      return getLastMondayOfMonth(addMonths(base, 1));
    
    default:
      return base;
  }
};

/**
 * Get last Friday of a given month
 */
const getLastFridayOfMonth = (date) => {
  const end = endOfMonth(date);
  let lastFriday = new Date(end);

  // Friday = 5
  while (lastFriday.getDay() !== 5) {
    lastFriday.setDate(lastFriday.getDate() - 1);
  }

  return lastFriday;
};

/**
 * Get last Monday of a given month
 */
const getLastMondayOfMonth = (date) => {
  const end = endOfMonth(date);
  let lastMonday = new Date(end);

  // Monday = 1
  while (lastMonday.getDay() !== 1) {
    lastMonday.setDate(lastMonday.getDate() - 1);
  }

  return lastMonday;
};

/**
 * Check if a recurring task should create a duplicate today
 */
export const shouldCreateRecurringDuplicate = (task, lastCompletedDate) => {
  if (!task.recurrence) return false;

  const today = new Date();
  const lastCompleted = lastCompletedDate ? new Date(lastCompletedDate) : null;

  if (!lastCompleted) return true;

  const nextOccurrence = calculateNextOccurrence(lastCompleted, task.recurrence);

  return isSameDay(today, nextOccurrence) || today > nextOccurrence;
};

/**
 * Create duplicate task from recurring task
 */
export const createRecurringTaskDuplicate = (originalTask) => {
  return {
    ...originalTask,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    completed: false,
    createdAt: new Date().toISOString(),
    alarmTime: calculateNextOccurrence(new Date(), originalTask.recurrence).toISOString(),
    notes: originalTask.notes ? `[Recurring] ${originalTask.notes}` : '[Recurring]',
    subtasks: [],
    attachments: [],
  };
};

/**
 * Get upcoming recurrences (next 30 days)
 */
export const getUpcomingRecurrences = (todos) => {
  const today = new Date();
  const upcoming = [];

  todos
    .filter(todo => todo.recurrence && !todo.archived && !todo.trashed)
    .forEach(todo => {
      let nextDate = todo.alarmTime ? new Date(todo.alarmTime) : today;
      
      for (let i = 0; i < 5; i++) {
        nextDate = calculateNextOccurrence(nextDate, todo.recurrence);
        
        if (nextDate <= addDays(today, 30)) {
          upcoming.push({
            ...todo,
            nextOccurrence: nextDate.toISOString()
          });
        }
      }
    });

  return upcoming.sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence));
};
