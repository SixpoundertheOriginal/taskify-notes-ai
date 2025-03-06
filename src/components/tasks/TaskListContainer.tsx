
import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";
import { useTaskStore } from "@/lib/store";

interface TaskListContainerProps {
  filteredTasks: Task[];
  totalTasksCount: number;
}

const TaskListContainer = ({ filteredTasks, totalTasksCount }: TaskListContainerProps) => {
  return (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
        <div className="space-y-4 p-2 rounded-lg min-h-[100px]">
          <AnimatePresence mode="sync">
            {filteredTasks.map((task) => (
              <div key={task.id} className="mb-4">
                <TaskCard key={task.id} task={task} />
              </div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <TaskEmptyState hasTasksInStore={totalTasksCount > 0} />
      )}
    </div>
  );
};

export default TaskListContainer;
