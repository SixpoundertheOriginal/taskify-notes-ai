
import { Priority, Status } from "@/lib/types";
import { PriorityBadge } from "./TaskBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Circle, CheckCircle, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

interface TaskEditablePriorityProps {
  value: Priority;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (value: Priority) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
}

export const SafeTaskEditablePriority = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave,
}: TaskEditablePriorityProps) => {
  if (isEditing) {
    return (
      <div className="inline-flex">
        <RadioGroup
          value={value}
          onValueChange={(value) => {
            onChange(value as Priority);
            onSave();
          }}
          className="flex space-x-2"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="low" id="edit-low" />
            <Label htmlFor="edit-low" className="text-blue-500">Low</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="medium" id="edit-medium" />
            <Label htmlFor="edit-medium" className="text-yellow-500">Medium</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="high" id="edit-high" />
            <Label htmlFor="edit-high" className="text-red-500">High</Label>
          </div>
        </RadioGroup>
      </div>
    );
  }

  return (
    <PriorityBadge 
      priority={value} 
      onClick={onStartEditing} 
      className={`cursor-pointer hover:opacity-80 ${isCompleted ? "opacity-60" : ""}`} 
    />
  );
};

interface TaskEditableStatusProps {
  value: Status;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (value: Status) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
}

export const SafeTaskEditableStatus = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave,
}: TaskEditableStatusProps) => {
  const statusColors = {
    "todo": "bg-slate-500",
    "in-progress": "bg-amber-500",
    "completed": "bg-green-500",
  };

  const statusIcons = {
    "todo": <Circle className="h-3 w-3 mr-1" />,
    "in-progress": <Clock className="h-3 w-3 mr-1" />,
    "completed": <CheckCircle className="h-3 w-3 mr-1" />,
  };

  if (isEditing) {
    return (
      <div className="inline-flex">
        <RadioGroup
          value={value}
          onValueChange={(value) => {
            onChange(value as Status);
            onSave();
          }}
          className="flex space-x-2"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="todo" id="edit-todo" />
            <Label htmlFor="edit-todo" className="flex items-center">
              <Circle className="h-3 w-3 mr-1" />
              Todo
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="in-progress" id="edit-in-progress" />
            <Label htmlFor="edit-in-progress" className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="completed" id="edit-completed" />
            <Label htmlFor="edit-completed" className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Label>
          </div>
        </RadioGroup>
      </div>
    );
  }

  return (
    <Badge
      className={`flex items-center ${statusColors[value]} hover:${
        statusColors[value]
      } cursor-pointer ${isCompleted ? "opacity-60" : ""}`}
      onClick={onStartEditing}
    >
      {statusIcons[value]}
      {value === "todo" ? "Todo" : value === "in-progress" ? "In Progress" : "Completed"}
    </Badge>
  );
};

interface TaskEditableDateProps {
  value: Date | undefined;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (date: Date | undefined) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
}

export const SafeTaskEditableDate = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave,
}: TaskEditableDateProps) => {
  if (isEditing) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              onSave();
            }}
            initialFocus
          />
          {value && (
            <div className="p-3 border-t border-border">
              <Button 
                variant="ghost"
                className="w-full"
                onClick={() => {
                  onChange(undefined);
                  onSave();
                }}
              >
                <CircleX className="h-4 w-4 mr-2" />
                Remove date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  if (!value) return null;

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 cursor-pointer hover:bg-accent ${
        isCompleted ? "opacity-60" : ""
      }`}
      onClick={onStartEditing}
    >
      <CalendarIcon className="h-3 w-3" />
      {format(new Date(value), "MMM d")}
    </Badge>
  );
};

interface TaskEditableReminderProps {
  value: Date | undefined;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (time: Date | undefined) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
}

export const SafeTaskEditableReminder = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave,
}: TaskEditableReminderProps) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="time"
          value={
            value
              ? `${String(value.getHours()).padStart(2, "0")}:${String(
                  value.getMinutes()
                ).padStart(2, "0")}`
              : ""
          }
          onChange={(e) => {
            if (e.target.value) {
              const [hours, minutes] = e.target.value.split(":").map(Number);
              const newDate = new Date();
              newDate.setHours(hours, minutes, 0, 0);
              onChange(newDate);
            } else {
              onChange(undefined);
            }
          }}
          className="w-32"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSave();
          }}
        >
          Save
        </Button>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(undefined);
              onSave();
            }}
          >
            Clear
          </Button>
        )}
      </div>
    );
  }

  if (!value) return null;

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 cursor-pointer hover:bg-accent ${
        isCompleted ? "opacity-60" : ""
      }`}
      onClick={onStartEditing}
    >
      <Clock className="h-3 w-3" />
      {format(new Date(value), "h:mm a")}
    </Badge>
  );
};
