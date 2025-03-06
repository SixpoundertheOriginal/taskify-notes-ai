
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import TaskPriorityGroup from "./TaskPriorityGroup";
import { useTaskPriorityDnd } from "@/hooks/use-task-priority-dnd";

const TaskPriorityGroupView = () => {
  const { 
    highPriorityTasks, 
    mediumPriorityTasks, 
    lowPriorityTasks, 
    hasTasks, 
    handleDragEnd,
    isSaving
  } = useTaskPriorityDnd();

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`space-y-8 ${isSaving ? 'opacity-70' : ''}`}>
          <TaskPriorityGroup
            title="High Priority"
            priority="high"
            tasks={highPriorityTasks}
            droppableId="priority-high"
          />
          
          <TaskPriorityGroup
            title="Medium Priority"
            priority="medium"
            tasks={mediumPriorityTasks}
            droppableId="priority-medium"
          />
          
          <TaskPriorityGroup
            title="Low Priority"
            priority="low"
            tasks={lowPriorityTasks}
            droppableId="priority-low"
          />
          
          {!hasTasks && (
            <div className="text-center p-8 border border-dashed rounded-lg bg-card text-muted-foreground">
              No tasks found. Try adding a new task above.
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskPriorityGroupView;
