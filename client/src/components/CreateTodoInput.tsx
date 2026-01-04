import { useState } from "react";
import { Plus } from "lucide-react";
import { useCreateTodo } from "@/hooks/use-todos";
import { useToast } from "@/hooks/use-toast";

export function CreateTodoInput() {
  const [title, setTitle] = useState("");
  const createTodo = useCreateTodo();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Empty task",
        description: "Please enter a task title first.",
        variant: "destructive",
      });
      return;
    }

    createTodo.mutate(
      { title, completed: false },
      {
        onSuccess: () => setTitle(""),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Plus className="h-5 w-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
      </div>
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full pl-12 pr-4 py-4 bg-transparent text-lg font-medium placeholder:text-muted-foreground/40 border-b-2 border-border/50 focus:border-primary focus:outline-none transition-colors duration-300"
        disabled={createTodo.isPending}
      />
      
      {createTodo.isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </form>
  );
}
