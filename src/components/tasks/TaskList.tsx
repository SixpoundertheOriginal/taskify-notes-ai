
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTaskStore } from "@/lib/store";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Search, Filter, CalendarCheck, CalendarClock } from "lucide-react";
import { Priority, Task } from "@/lib/types";

type SortOption = "newest" | "oldest" | "dueDate" | "priority";
type FilterOption = "all" | "completed" | "active" | Priority;

const TaskList = () => {
  const { tasks } = useTaskStore();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  useEffect(() => {
    let result = [...tasks];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply filters
    if (filterBy === "completed") {
      result = result.filter((task) => task.completed);
    } else if (filterBy === "active") {
      result = result.filter((task) => !task.completed);
    } else if (["low", "medium", "high"].includes(filterBy)) {
      result = result.filter((task) => task.priority === filterBy);
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "dueDate") {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, sortBy, filterBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[130px]">
              <CalendarCheck className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <TaskForm />
      
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {tasks.length === 0
                ? "Start by creating your first task"
                : "Try adjusting your search or filters"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
