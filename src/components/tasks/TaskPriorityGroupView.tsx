
import { useTaskStore } from "@/lib/store";
import { Priority, Task } from "@/lib/types";
import { PriorityBadge, priorityColors } from "./TaskBadges";
import TaskCard from "./TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowDown, CircleDot, GripVertical } from "lucide-react";
import TaskEmptyState from "./TaskEmptyState";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";

interface TaskPriorityGroupProps {
  title: string;
  tasks: Task[];
  priority: Priority;
  icon: React.ReactNode;
  droppableId: string;
}

const TaskPriorityGroup = ({ title, tasks, priority, icon, droppableId }: TaskPriorityGroupProps) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
        <PriorityBadge priority={priority} disabled />
        <span className="text-muted-foreground ml-2">({tasks.length})</span>
      </div>
      
      <Droppable droppableId={droppableId} type="TASK">
        {(provided, snapshot) => (
          <div 
            className={`space-y-4 p-2 rounded-lg transition-colors min-h-[80px] ${
              snapshot.isDraggingOver ? 'bg-accent/30 border border-dashed border-primary/30' : ''
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <AnimatePresence mode="sync">
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-all mb-4 ${snapshot.isDragging ? "opacity-80 scale-105 z-50" : ""}`}
                    >
                      <div className="flex items-start">
                        <div 
                          {...provided.dragHandleProps}
                          className="mt-6 mr-2 p-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <TaskCard key={task.id} task={task} />
                        </div>
                      </div>
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
  );
};

const TaskPriorityGroupView = () => {
  const { tasks, updateTaskPriority, reorderTasksInPriorityGroup } = useTaskStore();
  
  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === "high");
  const mediumPriorityTasks = tasks.filter(task => task.priority === "medium");
  const lowPriorityTasks = tasks.filter(task => task.priority === "low");
  
  // Check if there are any tasks
  const hasTasks = tasks.length > 0;

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Log drag operation for debugging
    console.log("Drag operation result:", result);
    
    // Dropped outside the list
    if (!destination) {
      console.log("No destination");
      return;
    }
    
    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log("Same position, no change needed");
      return;
    }

    // Map droppableId to priority
    const priorityMap: Record<string, Priority> = {
      'high-priority': 'high',
      'medium-priority': 'medium',
      'low-priority': 'low'
    };

    // Get the source and destination task lists
    let sourceTaskList: Task[] = [];
    let destTaskList: Task[] = [];
    
    if (source.droppableId === 'high-priority') {
      sourceTaskList = highPriorityTasks;
    } else if (source.droppableId === 'medium-priority') {
      sourceTaskList = mediumPriorityTasks;
    } else if (source.droppableId === 'low-priority') {
      sourceTaskList = lowPriorityTasks;
    }

    if (destination.droppableId === 'high-priority') {
      destTaskList = highPriorityTasks;
    } else if (destination.droppableId === 'medium-priority') {
      destTaskList = mediumPriorityTasks;
    } else if (destination.droppableId === 'low-priority') {
      destTaskList = lowPriorityTasks;
    }
    
    // Get the task that was dragged
    const taskToMove = sourceTaskList[source.index];

    if (taskToMove) {
      console.log("Task to move:", taskToMove);
      
      try {
        // If moved to a different priority group, update its priority
        if (source.droppableId !== destination.droppableId) {
          const newPriority = priorityMap[destination.droppableId];
          
          // Create a clone of the destination list
          const newDestList = [...destTaskList];
          
          // Insert the task at the destination position
          newDestList.splice(destination.index, 0, {
            ...taskToMove,
            priority: newPriority
          });
          
          // Update task priority and position
          updateTaskPriority(
            taskToMove.id, 
            newPriority, 
            destination.index,
            newDestList.map(t => t.id)
          );
          
          toast.success(`"${taskToMove.title}" moved to ${newPriority} priority`);
        } else {
          // Same priority group, just reordering
          // Create a new array with the reordered items
          const reorderedTasks = Array.from(sourceTaskList);
          const [removed] = reorderedTasks.splice(source.index, 1);
          reorderedTasks.splice(destination.index, 0, removed);
          
          // Get the reordered IDs
          const reorderedIds = reorderedTasks.map(task => task.id);
          
          // Update task position in the store
          reorderTasksInPriorityGroup(
            taskToMove.id,
            taskToMove.priority,
            source.index,
            destination.index,
            reorderedIds
          );
          
          toast.success(`"${taskToMove.title}" reordered successfully`);
        }
      } catch (error) {
        console.error("Failed to reorder task:", error);
        toast.error("Failed to reorder task. Please try again.");
      }
    } else {
      console.error("Task not found:", source);
    }
  };

  // If no tasks, show empty state
  if (!hasTasks) {
    return <TaskEmptyState hasTasksInStore={false} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <TaskPriorityGroup
          title="High Priority"
          tasks={highPriorityTasks}
          priority="high"
          droppableId="high-priority"
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        />
        
        <TaskPriorityGroup
          title="Medium Priority"
          tasks={mediumPriorityTasks}
          priority="medium"
          droppableId="medium-priority"
          icon={<CircleDot className="h-5 w-5 text-yellow-500" />}
        />
        
        <TaskPriorityGroup
          title="Low Priority"
          tasks={lowPriorityTasks}
          priority="low"
          droppableId="low-priority"
          icon={<ArrowDown className="h-5 w-5 text-blue-500" />}
        />
      </DragDropContext>
    </motion.div>
  );
};

export default TaskPriorityGroupView;
