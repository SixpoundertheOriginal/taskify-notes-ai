import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNoteStore } from "@/lib/store";
import NoteCard from "./NoteCard";
import NoteForm from "./NoteForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, CalendarCheck } from "lucide-react";
import { Note } from "@/lib/types";

type SortOption = "newest" | "oldest" | "alphabetical";

const NoteList = () => {
  const { notes } = useNoteStore();
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    let result = [...notes];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredNotes(result);
  }, [notes, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[150px]">
            <CalendarCheck className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <NoteForm />
      
      <div className="space-y-4">
        {filteredNotes.length > 0 ? (
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="flex justify-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No notes found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {notes.length === 0
                ? "Start by creating your first note"
                : "Try adjusting your search or sort options"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NoteList;
