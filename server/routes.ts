import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { analyzeNewAddition, SUPPORTED_INDICES } from "./analyzer";
import { z } from "zod";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 60) {
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new MemoryCache(30);

// Rate Limiter for API Key Protection
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 30, windowSeconds: number = 60) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
    
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(clientId) || [];
    
    // Filter to only requests within the window
    const recentRequests = timestamps.filter(t => now - t < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    return true;
  }

  getRemainingRequests(clientId: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(clientId) || [];
    const recentRequests = timestamps.filter(t => now - t < this.windowMs);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.requests.forEach((timestamps, clientId) => {
      const recent = timestamps.filter((t: number) => now - t < this.windowMs);
      if (recent.length === 0) {
        keysToDelete.push(clientId);
      } else {
        this.requests.set(clientId, recent);
      }
    });
    
    keysToDelete.forEach((key) => this.requests.delete(key));
  }
}

// 30 requests per minute per IP to protect API key
const tickerLookupLimiter = new RateLimiter(30, 60);

function getMockIndexNews() {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      ticker: "PATH",
      companyName: "UiPath Inc.",
      eventType: "Migration",
      fromIndex: "SP600",
      toIndex: "SP400",
      announcementDate: today,
      effectiveDate: "2026-01-16",
      currentPrice: 24.50,
      marketCap: 14200000000,
      avgVolume30d: 6500000,
      morningVolume: 12000000,
      typicalMorningVolume: 1500000,
    },
    {
      ticker: "HOOD",
      companyName: "Robinhood Markets",
      eventType: "Addition",
      fromIndex: null,
      toIndex: "SP500",
      announcementDate: today,
      effectiveDate: "2026-01-23",
      currentPrice: 32.10,
      marketCap: 28500000000,
      avgVolume30d: 15000000,
      morningVolume: 18000000,
      typicalMorningVolume: 4000000,
    },
  ];
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/mock/index-news", (_req, res) => {
    res.json(getMockIndexNews());
  });

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

  app.post("/api/ticker-lookup", async (req, res) => {
    try {
      // Rate limiting by IP address
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      
      if (!tickerLookupLimiter.isAllowed(clientIp)) {
        const remaining = tickerLookupLimiter.getRemainingRequests(clientIp);
        res.setHeader("X-RateLimit-Remaining", remaining.toString());
        res.setHeader("Retry-After", "60");
        res.status(429).json({ 
          message: "Rate limit exceeded. Please wait before making more requests.",
          retryAfter: 60
        });
        return;
      }
      
      // Add rate limit headers
      res.setHeader("X-RateLimit-Remaining", tickerLookupLimiter.getRemainingRequests(clientIp).toString());
      
      const { ticker, indexTarget } = req.body;

      if (!ticker || !indexTarget) {
        res.status(400).json({ message: "Missing ticker or indexTarget" });
        return;
      }

      const apiKey = process.env.FIN_API_KEY;
      if (!apiKey) {
        res.status(500).json({ message: "API Key Not Configured" });
        return;
      }

      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(ticker.toUpperCase())}?apikey=${apiKey}`
      );

      if (!response.ok) {
        res.status(response.status).json({ message: "API request failed" });
        return;
      }

      const data = await response.json();

      if (!data || !Array.isArray(data) || data.length === 0) {
        res.status(404).json({ message: `Ticker '${ticker}' not found` });
        return;
      }

      const quote = data[0];
      const price = quote.price;
      const marketCap = quote.marketCap;
      const avgVolume = quote.avgVolume;

      if (!price || !marketCap || !avgVolume) {
        res.status(404).json({ message: `Incomplete data for ticker '${ticker}'` });
        return;
      }

      const result = analyzeNewAddition({
        ticker: ticker.toUpperCase(),
        marketCap,
        price,
        avgVolume30d: avgVolume,
        morningVolume: avgVolume,
        typicalMorningVolume: avgVolume,
        indexTarget,
        isMigration: false,
      });

      res.json({
        ...result,
        liveData: {
          price,
          marketCap,
          avgVolume,
        },
      });
    } catch (err) {
      console.error("Ticker lookup error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/shadow-inventory", (_req, res) => {
    const CACHE_KEY = "shadow-inventory";
    
    const cached = cache.get<any[]>(CACHE_KEY);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.json(cached);
      return;
    }

    const shadowInventoryData = [
      {
        ticker: "PLTR",
        company: "Palantir Technologies",
        sector: "Technology",
        marketCap: 18500000000,
        positiveQuarters: 5,
        avgVolume: 45000000,
        priceChange24h: 2.4,
        eps: 0.21,
        eligibilityScore: 92,
      },
      {
        ticker: "RBLX",
        company: "Roblox Corporation",
        sector: "Technology",
        marketCap: 21000000000,
        positiveQuarters: 4,
        avgVolume: 12000000,
        priceChange24h: -1.2,
        eps: 0.08,
        eligibilityScore: 85,
      },
      {
        ticker: "DASH",
        company: "DoorDash Inc.",
        sector: "Consumer Discretionary",
        marketCap: 19800000000,
        positiveQuarters: 4,
        avgVolume: 8500000,
        priceChange24h: 1.8,
        eps: 0.15,
        eligibilityScore: 88,
      },
      {
        ticker: "SNAP",
        company: "Snap Inc.",
        sector: "Technology",
        marketCap: 16200000000,
        positiveQuarters: 6,
        avgVolume: 22000000,
        priceChange24h: -0.5,
        eps: 0.12,
        eligibilityScore: 78,
      },
      {
        ticker: "COIN",
        company: "Coinbase Global",
        sector: "Financials",
        marketCap: 23500000000,
        positiveQuarters: 5,
        avgVolume: 9800000,
        priceChange24h: 4.2,
        eps: 0.45,
        eligibilityScore: 91,
      },
      {
        ticker: "RIVN",
        company: "Rivian Automotive",
        sector: "Consumer Discretionary",
        marketCap: 15800000000,
        positiveQuarters: 4,
        avgVolume: 18000000,
        priceChange24h: -2.1,
        eps: -0.85,
        eligibilityScore: 72,
      },
    ];

    cache.set(CACHE_KEY, shadowInventoryData);
    res.setHeader("X-Cache", "MISS");
    res.json(shadowInventoryData);
  });

  return httpServer;
}
