import { storage } from "./storage";

async function runSeed() {
  console.log("Seeding database...");
  
  const existingTodos = await storage.getTodos();
  if (existingTodos.length === 0) {
    console.log("Creating initial todos...");
    await storage.createTodo({ title: "Setup PostgreSQL database", completed: true });
    await storage.createTodo({ title: "Implement backend storage", completed: true });
    await storage.createTodo({ title: "Generate frontend", completed: true });
    await storage.createTodo({ title: "Verify application works", completed: false });
    console.log("Seed data created.");
  } else {
    console.log("Database already seeded.");
  }
}

runSeed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
