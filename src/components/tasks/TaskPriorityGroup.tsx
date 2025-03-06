
import { Priority, Task } from "@/lib/types";
import { PriorityBadge } from "./TaskBadges";
import TaskCard from "./TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import { Droppable, Draggable } from "react-beautiful-dnd";

interface TaskPriorityGroupProps {
  title: string;
  tasks: Task[];
  priority: Priority;
  icon?: React.ReactNode; // Make icon optional
  droppableId: string;   // Add the missing droppableId prop
}

const TaskPriorityGroup = ({ title, tasks, priority, icon, droppableId }: TaskPriorityGroupProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
        <PriorityBadge priority={priority} disabled />
        <span className="text-muted-foreground ml-2">({tasks.length})</span>
      </div>
      
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div 
            className={`space-y-4 p-2 rounded-lg min-h-[80px] transition-colors ${
              snapshot.isDraggingOver ? "bg-accent/20" : ""
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.length > 0 ? (
              <AnimatePresence mode="sync">
                {tasks.map((task, index) => (
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
            ) : (
              <div className="text-center py-2 px-4 text-sm text-muted-foreground border border-dashed border-muted-foreground/20 rounded-md">
                Drop tasks here
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskPriorityGroup;
