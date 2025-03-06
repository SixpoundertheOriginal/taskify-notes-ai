
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus, Sparkles, ArrowRight } from "lucide-react";
import { Priority } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAiTaskParser } from "@/hooks/use-ai-task-parser";

const TaskForm = () => {
  const { addTask } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isAiMode, setIsAiMode] = useState(false);
  const [naturalInput, setNaturalInput] = useState("");
  
  const { parseTask, parsedTask, isLoading, resetParser } = useAiTaskParser();

  useEffect(() => {
    if (parsedTask) {
      setTitle(parsedTask.title);
      setDescription(parsedTask.description || "");
      setPriority(parsedTask.priority);
      
      if (parsedTask.dueDate) {
        setDate(new Date(parsedTask.dueDate));
      }
    }
  }, [parsedTask]);

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
    setNaturalInput("");
    resetParser();
  };

  const handleAiParseClick = async () => {
    if (!naturalInput.trim()) {
      toast.error("Please enter a task description");
      return;
    }
    await parseTask(naturalInput);
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
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Create a new task</CardTitle>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-muted-foreground">AI Mode</span>
                  <Button
                    size="sm"
                    variant={isAiMode ? "default" : "outline"}
                    onClick={() => setIsAiMode(!isAiMode)}
                    className="gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isAiMode ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {isAiMode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="natural-input">Describe your task in natural language</Label>
                      <div className="flex gap-2">
                        <Input
                          id="natural-input"
                          placeholder="e.g., Remind me to call Sarah tomorrow at 2pm"
                          value={naturalInput}
                          onChange={(e) => setNaturalInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAiParseClick}
                          disabled={isLoading || !naturalInput.trim()}
                        >
                          {isLoading ? "Parsing..." : "Parse"} <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI will extract title, description, priority, and due date from your input.
                      </p>
                    </div>
                    
                    {parsedTask && (
                      <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                        <p className="text-sm font-medium mb-1">AI Parsed Result:</p>
                        <ul className="text-sm space-y-1">
                          <li><span className="font-medium">Title:</span> {parsedTask.title}</li>
                          {parsedTask.description && (
                            <li><span className="font-medium">Description:</span> {parsedTask.description}</li>
                          )}
                          <li><span className="font-medium">Priority:</span> {parsedTask.priority}</li>
                          {parsedTask.dueDate && (
                            <li><span className="font-medium">Due Date:</span> {format(new Date(parsedTask.dueDate), "PPP")}</li>
                          )}
                        </ul>
                        <p className="text-xs text-muted-foreground mt-2">
                          Edit fields below if needed.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
                
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
