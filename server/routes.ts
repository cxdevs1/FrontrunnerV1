import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.todos.list.path, async (_req, res) => {
    const todos = await storage.getTodos();
    res.json(todos);
  });

  app.post(api.todos.create.path, async (req, res) => {
    try {
      const data = api.todos.create.input.parse(req.body);
      const todo = await storage.createTodo(data);
      res.status(201).json(todo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
        return;
      }
      throw err;
    }
  });

  app.patch(api.todos.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const data = api.todos.update.input.parse(req.body);
      const todo = await storage.updateTodo(id, data);
      if (!todo) {
        res.status(404).json({ message: "Todo not found" });
        return;
      }
      res.json(todo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
        return;
      }
      throw err;
    }
  });

  app.delete(api.todos.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTodo(id);
    res.status(204).end();
  });

  return httpServer;
}
