import { pgTable, text, serial, integer, boolean, date, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const insertTodoSchema = createInsertSchema(todos).omit({ id: true });

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;

// Index events table - stores Ticker, Announcement Date, and Effective Date
export const indexEvents = pgTable("index_events", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  announcementDate: date("announcement_date").notNull(),
  effectiveDate: date("effective_date").notNull(),
});

export const insertIndexEventSchema = createInsertSchema(indexEvents).omit({ id: true });

export type IndexEvent = typeof indexEvents.$inferSelect;
export type InsertIndexEvent = z.infer<typeof insertIndexEventSchema>;

// Daily metrics table - stores Pressure Score and Relative Volume for historical comparison
export const dailyMetrics = pgTable("daily_metrics", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  date: date("date").notNull(),
  pressureScore: real("pressure_score").notNull(),
  relativeVolume: real("relative_volume").notNull(),
});

export const insertDailyMetricSchema = createInsertSchema(dailyMetrics).omit({ id: true });

export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetric = z.infer<typeof insertDailyMetricSchema>;
