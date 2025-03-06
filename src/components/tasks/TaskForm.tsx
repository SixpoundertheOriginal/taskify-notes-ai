
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus } from "lucide-react";
import { Priority } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const TaskForm = () => {
  const { addTask } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    addTask({
      title,
      description: description.trim() ? description : undefined,
      priority,
      dueDate: date ? date.toISOString() : undefined,
    });
    
    toast.success("Task created successfully");
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDate(undefined);
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full glass-card h-14 border-dashed"
        >
          <Plus className="h-5 w-5 mr-2" /> Add New Task
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Create a new task</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
                    defaultValue={priority} 
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
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TaskForm;
