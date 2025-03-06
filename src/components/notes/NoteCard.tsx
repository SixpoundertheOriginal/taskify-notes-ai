
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash, Edit, XCircle, Save, Clock } from "lucide-react";
import { Note } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const { updateNote, deleteNote } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);

  const handleSaveEdit = () => {
    updateNote(note.id, {
      title: editedTitle,
      content: editedContent,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="font-medium text-foreground"
                  placeholder="Note title"
                />
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="text-sm min-h-[100px] resize-none"
                  placeholder="Note content..."
                  rows={5}
                />
              </div>
            ) : (
              <>
                <h3 className="font-medium text-foreground">{note.title}</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </div>
              </>
            )}
            
            <div className="flex items-center text-xs text-muted-foreground pt-2">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="h-8 px-2 text-xs"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEdit}
                className="h-8 px-2 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 px-2 text-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteNote(note.id)}
                className="h-8 px-2 text-xs"
              >
                <Trash className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default NoteCard;
