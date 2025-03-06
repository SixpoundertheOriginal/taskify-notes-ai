
import { Filter, CalendarCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Priority } from "@/lib/types";

export type SortOption = "newest" | "oldest" | "dueDate" | "priority";
export type FilterOption = "all" | "completed" | "active" | Priority;

interface TaskFiltersProps {
  filterBy: FilterOption;
  sortBy: SortOption;
  setFilterBy: (option: FilterOption) => void;
  setSortBy: (option: SortOption) => void;
}

const TaskFilters = ({ 
  filterBy, 
  sortBy, 
  setFilterBy, 
  setSortBy 
}: TaskFiltersProps) => {
  return (
    <div className="flex gap-2">
      <Select 
        value={filterBy} 
        onValueChange={(value) => setFilterBy(value as FilterOption)}
      >
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
      
      <Select 
        value={sortBy} 
        onValueChange={(value) => setSortBy(value as SortOption)}
      >
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
  );
};

export default TaskFilters;
