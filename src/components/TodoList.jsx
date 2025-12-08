// List component that displays all todos with animation and drag & drop
import { AnimatePresence, motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TodoItem } from './TodoItem';
import { useTodoState, useTodoDispatch } from '../context/TodoContext';

export const TodoList = ({ filter = 'all' }) => {
  const { todos } = useTodoState();
  const { reorderTodos } = useTodoDispatch();
  
  // Exclude trashed items from the main list view
  const allVisible = (todos || []).filter(t => !t.trashed);

  // Apply user-selected filter: all | active | completed
  let visibleTodos = allVisible;
  if (filter === 'active') visibleTodos = allVisible.filter(t => !t.completed);
  if (filter === 'completed') visibleTodos = allVisible.filter(t => t.completed);

  // Separate pinned and regular todos
  const pinnedTodos = visibleTodos.filter(t => t.pinned);
  const regularTodos = visibleTodos.filter(t => !t.pinned);
  const displayTodos = [...pinnedTodos, ...regularTodos];

  // Handle drag end
  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside the list, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Reorder todos
    const reorderedTodos = Array.from(displayTodos);
    const [movedTodo] = reorderedTodos.splice(source.index, 1);
    reorderedTodos.splice(destination.index, 0, movedTodo);

    // Update context with all todos (preserving trashed ones)
    const allTodos = todos.map(t => {
      if (t.trashed) return t;
      const reorderedIndex = reorderedTodos.findIndex(rt => rt.id === t.id);
      return reorderedIndex !== -1 ? reorderedTodos[reorderedIndex] : t;
    });

    reorderTodos(allTodos);
  };

  // Show empty state if no todos
  if (!displayTodos || displayTodos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 dark:text-gray-500 text-lg">
          No tasks yet. Add one to get started! 
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Pinned Section */}
      {pinnedTodos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
            <span className="text-lg">📌</span>
            Pinned Tasks ({pinnedTodos.length})
          </div>
          <Droppable droppableId="pinned-todos">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg' : ''
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {pinnedTodos.map((todo, index) => (
                    <Draggable key={todo.id} draggableId={`pinned-${todo.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-all ${
                            snapshot.isDragging ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          <TodoItem todo={todo} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </motion.div>
      )}

      {/* Regular Tasks Section */}
      {regularTodos.length > 0 && (
        <div>
          {pinnedTodos.length > 0 && (
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Other Tasks
            </div>
          )}
          <Droppable droppableId="todos">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-gray-700 p-3 rounded-lg' : ''
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {regularTodos.map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-all ${
                            snapshot.isDragging ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          <TodoItem todo={todo} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </DragDropContext>
  );
};
