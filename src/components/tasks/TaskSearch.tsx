
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TaskSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TaskSearch = ({ searchQuery, setSearchQuery }: TaskSearchProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search tasks..."
        className="pl-9"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default TaskSearch;
