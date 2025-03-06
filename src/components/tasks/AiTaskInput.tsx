
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useAiTaskParser } from "@/hooks/use-ai-task-parser";
import { Priority } from "@/lib/types";

interface AiTaskInputProps {
  onTaskParsed: (title: string, description: string, priority: Priority, date: Date | undefined) => void;
}

const AiTaskInput = ({ onTaskParsed }: AiTaskInputProps) => {
  const [naturalInput, setNaturalInput] = useState("");
  const { parseTask, parsedTask, isLoading, resetParser } = useAiTaskParser();

  const handleAiParseClick = async () => {
    if (!naturalInput.trim()) return;
    const result = await parseTask(naturalInput);
    
    if (result) {
      onTaskParsed(
        result.title,
        result.description || "",
        result.priority,
        result.dueDate ? new Date(result.dueDate) : undefined
      );
    }
  };

  return (
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
  );
};

export default AiTaskInput;
