import { pgTable, text, serial, date, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const indexEvents = pgTable("index_events", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  indexTarget: text("index_target").notNull().default("SP500"),
  announcementDate: date("announcement_date").notNull(),
  effectiveDate: date("effective_date").notNull(),
  marketCap: real("market_cap"),
  price: real("price"),
  avgVolume30d: real("avg_volume_30d"),
});

export const insertIndexEventSchema = createInsertSchema(indexEvents).omit({ id: true });

export type IndexEvent = typeof indexEvents.$inferSelect;
export type InsertIndexEvent = z.infer<typeof insertIndexEventSchema>;

export const dailyMetrics = pgTable("daily_metrics", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  indexTarget: text("index_target").notNull().default("SP500"),
  date: date("date").notNull(),
  pressureScore: real("pressure_score").notNull(),
  relativeVolume: real("relative_volume").notNull(),
  requiredShares: integer("required_shares"),
  intensity: text("intensity"),
  morningVolume: real("morning_volume"),
  typicalMorningVolume: real("typical_morning_volume"),
  algoAlert: text("algo_alert"),
  action: text("action"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyMetricSchema = createInsertSchema(dailyMetrics).omit({ id: true, createdAt: true });

export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetric = z.infer<typeof insertDailyMetricSchema>;

export const analyzeTickerSchema = z.object({
  ticker: z.string().min(1),
  indexTarget: z.enum(["SP500", "SP400", "SP600"]),
  marketCap: z.number().positive(),
  price: z.number().positive(),
  avgVolume30d: z.number().positive(),
  morningVolume: z.number().positive(),
  typicalMorningVolume: z.number().positive(),
  isMigration: z.boolean().optional().default(false),
  fromIndex: z.enum(["SP500", "SP400", "SP600"]).optional(),
});

export type AnalyzeTickerRequest = z.infer<typeof analyzeTickerSchema>;

export interface AnalysisResult {
  ticker: string;
  indexTarget: string;
  pressureScore: number;
  pressureScoreDisplay: string;
  requiredShares: number;
  requiredSharesDisplay: string;
  intensity: string;
  relativeVolume: number;
  relativeVolumeDisplay: string;
  algoAlert: string;
  action: string;
  isAlgoActive: boolean;
  isMigration?: boolean;
  fromIndex?: string;
  buyPressure?: number;
  sellPressure?: number;
  netDemand?: number;
}
