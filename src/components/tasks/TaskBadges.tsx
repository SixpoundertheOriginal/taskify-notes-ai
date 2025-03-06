
import { Badge } from "@/components/ui/badge";
import { Priority, Status } from "@/lib/types";

export const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const statusColors = {
  "todo": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  "in-progress": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "completed": "bg-green-500/10 text-green-500 border-green-500/20",
};

interface PriorityBadgeProps {
  priority: Priority;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const PriorityBadge = ({ priority, onClick, disabled }: PriorityBadgeProps) => (
  <Badge 
    className={`${priorityColors[priority]} ${!disabled ? "cursor-pointer" : ""}`}
    onClick={!disabled ? onClick : undefined}
  >
    {priority.charAt(0).toUpperCase() + priority.slice(1)}
  </Badge>
);

interface StatusBadgeProps {
  status: Status;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const StatusBadge = ({ status, onClick, disabled }: StatusBadgeProps) => (
  <Badge 
    className={`${statusColors[status]} ${!disabled ? "cursor-pointer" : ""}`}
    onClick={!disabled ? onClick : undefined}
  >
    {status === "todo" ? "To-Do" : 
     status === "in-progress" ? "In Progress" : 
     "Completed"}
  </Badge>
);
