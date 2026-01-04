import { useTodos } from "@/hooks/use-todos";
import { CreateTodoInput } from "@/components/CreateTodoInput";
import { TodoItem } from "@/components/TodoItem";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { data: todos, isLoading, error } = useTodos();

  const activeTodos = todos?.filter(t => !t.completed) ?? [];
  const completedTodos = todos?.filter(t => t.completed) ?? [];
  
  const completionPercentage = todos?.length 
    ? Math.round((completedTodos.length / todos.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 flex flex-col items-center py-12 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl space-y-12"
      >
        {/* Header Section */}
        <header className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-primary">
                Focus.
              </h1>
              <p className="text-muted-foreground text-lg">
                Capture your tasks, declutter your mind.
              </p>
            </div>
            
            <div className="hidden sm:flex flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                <CalendarDays className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator - Minimal */}
          {todos && todos.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {completionPercentage}% done
              </span>
            </div>
          )}
        </header>

        {/* Input Section */}
        <section className="bg-card/50 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-border/40">
          <CreateTodoInput />
        </section>

        {/* Main List Section */}
        <main className="space-y-8">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-full bg-secondary/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center rounded-2xl bg-destructive/5 text-destructive border border-destructive/10">
              <p>Failed to load tasks. Please try again.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Tasks */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
                </AnimatePresence>
                
                {activeTodos.length === 0 && todos?.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="py-12 text-center space-y-3"
                  >
                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground/50">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-muted-foreground">No tasks yet. Add one to get started.</p>
                  </motion.div>
                )}
                
                {activeTodos.length === 0 && completedTodos.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="py-8 text-center"
                  >
                    <p className="text-muted-foreground">All caught up! Great work.</p>
                  </motion.div>
                )}
              </div>

              {/* Completed Tasks - Visually separated */}
              {completedTodos.length > 0 && (
                <div className="pt-8">
                  <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4 pl-4">
                    Completed
                  </h3>
                  <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                      {completedTodos.map((todo) => (
                        <TodoItem key={todo.id} todo={todo} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </motion.div>
    </div>
  );
}
