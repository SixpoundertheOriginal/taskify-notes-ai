
import { CalendarIcon, Bell } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Priority } from "@/lib/types";

interface TaskDetailsFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  priority: Priority;
  setPriority: (priority: Priority) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  reminderTime: Date | undefined;
  setReminderTime: (time: Date | undefined) => void;
}

const TaskDetailsForm = ({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  date,
  setDate,
  reminderTime,
  setReminderTime,
}: TaskDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="transition-all duration-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none transition-all duration-200"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Priority</Label>
        <RadioGroup 
          value={priority} 
          onValueChange={(value) => setPriority(value as Priority)}
          className="flex space-x-2"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low" className="text-blue-500">Low</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="text-yellow-500">Medium</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high" className="text-red-500">High</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label>Due Date (optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal transition-all duration-200",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label>Reminder (optional)</Label>
        <div className="flex gap-2">
          <Input
            type="time"
            id="reminder"
            value={reminderTime ? 
              `${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}` 
              : ""}
            onChange={(e) => {
              if (e.target.value) {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date();
                newDate.setHours(hours, minutes, 0, 0);
                setReminderTime(newDate);
              } else {
                setReminderTime(undefined);
              }
            }}
            className="w-full"
            placeholder="Set reminder time"
          />
          {reminderTime && (
            <Button 
              variant="outline" 
              type="button"
              onClick={() => setReminderTime(undefined)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsForm;
