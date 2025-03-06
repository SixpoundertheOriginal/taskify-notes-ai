import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";
import { useTaskStore } from "@/lib/store";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCallback } from "react";

interface TaskListContainerProps {
  filteredTasks: Task[];
  totalTasksCount: number;
}

const TaskListContainer = ({ filteredTasks, totalTasksCount }: TaskListContainerProps) => {
  const { tasks: allTasks, reorderTasks } = useTaskStore();

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Create a mapping between filtered task IDs and their position in the full list
    const taskIdToFullListIndex = new Map();
    allTasks.forEach((task, index) => {
      taskIdToFullListIndex.set(task.id, index);
    });
    
    // Get the task IDs from the filtered tasks
    const filteredTaskIds = filteredTasks.map(task => task.id);
    
    // Create a new array with the correct order in the filtered view
    const newFilteredTaskIds = [...filteredTaskIds];
    newFilteredTaskIds.splice(source.index, 1);
    newFilteredTaskIds.splice(destination.index, 0, draggableId);
    
    // Generate the complete reordered list with all tasks (including non-filtered ones)
    // First, create a set of filtered IDs for quick lookups
    const filteredIdsSet = new Set(filteredTaskIds);
    
    // Start with an array of all task IDs in their current order
    const allTaskIds = allTasks.map(task => task.id);
    
    // Create a new ordered array for the complete task list
    const reorderedCompleteList = [];
    
    // Track which filtered tasks have been processed
    const processedFilteredIds = new Set();
    
    // Go through all tasks and rebuild the order
    for (const taskId of allTaskIds) {
      // If this task is in the filtered list, we'll handle it differently
      if (filteredIdsSet.has(taskId)) {
        // Skip for now - we'll add filtered tasks in their new order later
        continue;
      } else {
        // This task was not in the filtered view, keep its position
        reorderedCompleteList.push(taskId);
      }
    }
    
    // Now insert all filtered tasks in their new order
    for (const filteredId of newFilteredTaskIds) {
      // Find the original position of this task
      const originalIndex = taskIdToFullListIndex.get(filteredId);
      
      // Find the right insertion point in the complete list
      // This ensures filtered tasks maintain relative positions with non-filtered tasks
      let insertionIndex = 0;
      
      // If there's a task before this in the filtered view, try to position after it
      const filteredIndex = newFilteredTaskIds.indexOf(filteredId);
      if (filteredIndex > 0) {
        const previousFilteredId = newFilteredTaskIds[filteredIndex - 1];
        const previousIndex = reorderedCompleteList.indexOf(previousFilteredId);
        if (previousIndex !== -1) {
          insertionIndex = previousIndex + 1;
        }
      } else {
        // This is the first filtered task, find where to insert it
        // Try to maintain its general position in the list
        insertionIndex = Math.min(originalIndex, reorderedCompleteList.length);
      }
      
      // Insert the task at the calculated position
      reorderedCompleteList.splice(insertionIndex, 0, filteredId);
    }
    
    // Update the store with the new order that contains all tasks
    reorderTasks(
      draggableId,
      source.index,
      destination.index,
      reorderedCompleteList
    );
  }, [filteredTasks, allTasks, reorderTasks]);

  return (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks-list">
            {(provided, snapshot) => (
              <div 
                className={`space-y-4 p-2 rounded-lg min-h-[100px] transition-colors ${
                  snapshot.isDraggingOver ? "bg-accent/20" : ""
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <AnimatePresence mode="sync">
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-4 transition-opacity ${
                            snapshot.isDragging ? "opacity-80" : ""
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <TaskCard key={task.id} task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <TaskEmptyState hasTasksInStore={totalTasksCount > 0} />
      )}
    </div>
  );
};

export default TaskListContainer;
