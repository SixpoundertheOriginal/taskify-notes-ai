
import { useEffect, useState } from "react";
import { useTaskStore } from "@/lib/store";
import { Task } from "@/lib/types";
import TaskForm from "./TaskForm";
import TaskSearch from "./TaskSearch";
import TaskFilters, { FilterOption, SortOption } from "./TaskFilters";
import TaskListContainer from "./TaskListContainer";
import TaskPriorityGroupView from "./TaskPriorityGroupView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListFilter, Layers } from "lucide-react";

const TaskList = () => {
  const { tasks } = useTaskStore();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [viewMode, setViewMode] = useState<"list" | "priority">("list");

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
        <TaskSearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <div className="flex gap-2">
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as "list" | "priority")}
            className="mr-2"
          >
            <TabsList className="h-9">
              <TabsTrigger value="list" className="flex items-center gap-1 px-3">
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="priority" className="flex items-center gap-1 px-3">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">By Priority</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <TaskFilters
            filterBy={filterBy}
            sortBy={sortBy}
            setFilterBy={setFilterBy}
            setSortBy={setSortBy}
          />
        </div>
      </div>
      
      <TaskForm />
      
      {viewMode === "list" ? (
        <TaskListContainer 
          filteredTasks={filteredTasks} 
          totalTasksCount={tasks.length} 
        />
      ) : (
        <TaskPriorityGroupView />
      )}
    </div>
  );
};

export default TaskList;
