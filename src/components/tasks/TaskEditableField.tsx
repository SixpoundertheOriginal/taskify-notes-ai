import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Priority, Status } from "@/lib/types";
import { format } from "date-fns";

interface TaskEditableTitleProps {
  value: string;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (value: string) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TaskEditableTitle = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave,
  onCancel
}: TaskEditableTitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return isEditing ? (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="font-medium text-foreground"
      placeholder="Task title"
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    <h3 
      className={`font-medium text-foreground ${isCompleted ? "line-through text-muted-foreground" : ""} cursor-text`}
      onClick={(e) => !isCompleted && onStartEditing(e)}
    >
      {value}
    </h3>
  );
};

interface TaskEditableDescriptionProps {
  value: string;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (value: string) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TaskEditableDescription = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave,
  onCancel
}: TaskEditableDescriptionProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  return isEditing ? (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.ctrlKey) onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="text-sm text-muted-foreground resize-none mt-2"
      placeholder="Add a description..."
      rows={3}
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    value ? (
      <p 
        className={`text-sm text-muted-foreground mt-2 ${isCompleted ? "line-through" : ""} cursor-text`}
        onClick={(e) => !isCompleted && onStartEditing(e)}
      >
        {value}
      </p>
    ) : (
      !isCompleted && (
        <p 
          className="text-sm text-muted-foreground mt-2 italic cursor-text" 
          onClick={(e) => onStartEditing(e)}
        >
          Add a description...
        </p>
      )
    )
  );
};

interface TaskEditablePriorityProps {
  value: Priority;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (value: Priority) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
}

export const TaskEditablePriority = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave
}: TaskEditablePriorityProps) => {
  if (isEditing) {
    return (
      <Select
        value={value}
        onValueChange={(val: string) => {
          onChange(val as Priority);
          setTimeout(onSave, 100);
        }}
        onOpenChange={(open) => {
          if (!open) {
            onSave();
          }
        }}
      >
        <SelectTrigger className="w-[100px] h-7 text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const { PriorityBadge } = require('./TaskBadges');
  return (
    <PriorityBadge 
      priority={value} 
      onClick={(e) => !isCompleted && onStartEditing(e)}
      disabled={isCompleted}
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

export const TaskEditableStatus = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave
}: TaskEditableStatusProps) => {
  if (isEditing) {
    return (
      <Select
        value={value}
        onValueChange={(val: string) => {
          onChange(val as Status);
          setTimeout(onSave, 100);
        }}
        onOpenChange={(open) => {
          if (!open) {
            onSave();
          }
        }}
      >
        <SelectTrigger className="w-[120px] h-7 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todo">To-Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const { StatusBadge } = require('./TaskBadges');
  return (
    <StatusBadge 
      status={value} 
      onClick={(e) => !isCompleted && onStartEditing(e)} 
      disabled={isCompleted}
    />
  );
};

interface TaskEditableDateProps {
  value: Date | undefined;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (value: Date | undefined) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
}

export const TaskEditableDate = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave
}: TaskEditableDateProps) => {
  if (isEditing) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs font-normal"
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
            {value ? format(value, "MMM d, yyyy") : "Set date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setTimeout(onSave, 100);
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
  }

  return value ? (
    <div 
      className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer"
      onClick={(e) => !isCompleted && onStartEditing(e)}
    >
      <CalendarIcon className="h-3 w-3" />
      <span>{new Date(value).toLocaleDateString()}</span>
    </div>
  ) : (
    !isCompleted && (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={(e) => onStartEditing(e)}
      >
        <CalendarIcon className="h-3 w-3 mr-1" />
        Add date
      </Button>
    )
  );
};

interface TaskEditableReminderProps {
  value: Date | undefined;
  isEditing: boolean;
  isCompleted: boolean;
  onChange: (value: Date | undefined) => void;
  onStartEditing: (e: React.MouseEvent) => void;
  onSave: () => void;
}

export const TaskEditableReminder = ({
  value,
  isEditing,
  isCompleted,
  onChange,
  onStartEditing,
  onSave
}: TaskEditableReminderProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isEditing) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs font-normal"
          >
            <Bell className="h-3.5 w-3.5 mr-1" />
            {value ? formatTime(value) : "Set reminder"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <div className="p-3">
            <h4 className="mb-2 text-sm font-medium">Set reminder time</h4>
            <div className="flex gap-2 items-center">
              <Input
                type="time"
                value={value ? 
                  `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}` 
                  : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date();
                    newDate.setHours(hours, minutes, 0, 0);
                    onChange(newDate);
                  } else {
                    onChange(undefined);
                  }
                }}
                className="h-8"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onChange(undefined)}
                className="h-8"
              >
                Clear
              </Button>
            </div>
            <div className="mt-3 text-right">
              <Button 
                size="sm" 
                onClick={() => {
                  onSave();
                }}
              >
                Set Reminder
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return value ? (
    <div 
      className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer"
      onClick={(e) => !isCompleted && onStartEditing(e)}
    >
      <Bell className="h-3 w-3" />
      <span>{formatTime(value)}</span>
    </div>
  ) : (
    !isCompleted && (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={(e) => onStartEditing(e)}
      >
        <Bell className="h-3 w-3 mr-1" />
        Add reminder
      </Button>
    )
  );
};
