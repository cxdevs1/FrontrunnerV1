import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import type { Todo } from "@shared/schema";
import { useUpdateTodo, useDeleteTodo } from "@/hooks/use-todos";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleToggle = () => {
    updateTodo.mutate({ id: todo.id, completed: !todo.completed });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTodo.mutate(todo.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.005 }}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
        "bg-white border border-transparent hover:border-border hover:shadow-sm",
        "dark:bg-card dark:hover:border-border",
        todo.completed && "opacity-60 bg-transparent hover:bg-muted/30"
      )}
    >
      <button
        onClick={handleToggle}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20",
          todo.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 hover:border-primary/50"
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: todo.completed ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.div>
      </button>

      <span
        className={cn(
          "flex-1 text-base font-medium transition-all duration-300",
          todo.completed
            ? "text-muted-foreground line-through decoration-muted-foreground/30"
            : "text-foreground"
        )}
      >
        {todo.title}
      </span>

      <button
        onClick={handleDelete}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          "p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10",
          "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive/20"
        )}
        aria-label="Delete todo"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
