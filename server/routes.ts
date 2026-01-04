import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { analyzeNewAddition, SUPPORTED_INDICES } from "./analyzer";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/supported-indices", (_req, res) => {
    res.json(SUPPORTED_INDICES);
  });

  app.get(api.indexEvents.list.path, async (_req, res) => {
    const events = await storage.getIndexEvents();
    res.json(events);
  });

  app.post(api.indexEvents.create.path, async (req, res) => {
    try {
      const data = api.indexEvents.create.input.parse(req.body);
      const event = await storage.createIndexEvent(data);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
        return;
      }
      throw err;
    }
  });

  app.delete(api.indexEvents.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteIndexEvent(id);
    res.status(204).end();
  });

  app.get(api.dailyMetrics.list.path, async (_req, res) => {
    const metrics = await storage.getDailyMetrics();
    res.json(metrics);
  });

  app.get(api.dailyMetrics.byTicker.path, async (req, res) => {
    const ticker = req.params.ticker;
    const metrics = await storage.getDailyMetricsByTicker(ticker);
    res.json(metrics);
  });

  app.post(api.analyze.calculate.path, async (req, res) => {
    try {
      const data = api.analyze.calculate.input.parse(req.body);
      const result = analyzeNewAddition(data);

      const today = new Date().toISOString().split("T")[0];
      await storage.createDailyMetric({
        ticker: result.ticker,
        indexTarget: result.indexTarget,
        date: today,
        pressureScore: result.pressureScore,
        relativeVolume: result.relativeVolume,
        requiredShares: result.requiredShares,
        intensity: result.intensity,
        morningVolume: data.morningVolume,
        typicalMorningVolume: data.typicalMorningVolume,
        algoAlert: result.algoAlert,
        action: result.action,
      });

      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: err.errors });
        return;
      }
      throw err;
    }
  });

  return httpServer;
}
