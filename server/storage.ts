import { db } from "./db";
import {
  indexEvents,
  dailyMetrics,
  type IndexEvent,
  type InsertIndexEvent,
  type DailyMetric,
  type InsertDailyMetric,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getIndexEvents(): Promise<IndexEvent[]>;
  createIndexEvent(event: InsertIndexEvent): Promise<IndexEvent>;
  deleteIndexEvent(id: number): Promise<void>;
  getDailyMetrics(): Promise<DailyMetric[]>;
  getDailyMetricsByTicker(ticker: string): Promise<DailyMetric[]>;
  createDailyMetric(metric: InsertDailyMetric): Promise<DailyMetric>;
}

export class DatabaseStorage implements IStorage {
  async getIndexEvents(): Promise<IndexEvent[]> {
    return await db.select().from(indexEvents).orderBy(desc(indexEvents.effectiveDate));
  }

  async createIndexEvent(event: InsertIndexEvent): Promise<IndexEvent> {
    const [created] = await db.insert(indexEvents).values(event).returning();
    return created;
  }

  async deleteIndexEvent(id: number): Promise<void> {
    await db.delete(indexEvents).where(eq(indexEvents.id, id));
  }

  async getDailyMetrics(): Promise<DailyMetric[]> {
    return await db.select().from(dailyMetrics).orderBy(desc(dailyMetrics.createdAt));
  }

  async getDailyMetricsByTicker(ticker: string): Promise<DailyMetric[]> {
    return await db
      .select()
      .from(dailyMetrics)
      .where(eq(dailyMetrics.ticker, ticker))
      .orderBy(desc(dailyMetrics.date));
  }

  async createDailyMetric(metric: InsertDailyMetric): Promise<DailyMetric> {
    const [created] = await db.insert(dailyMetrics).values(metric).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
