import { z } from "zod";
import { insertIndexEventSchema, insertDailyMetricSchema, analyzeTickerSchema, indexEvents, dailyMetrics } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const analysisResultSchema = z.object({
  ticker: z.string(),
  indexTarget: z.string(),
  pressureScore: z.number(),
  pressureScoreDisplay: z.string(),
  requiredShares: z.number(),
  requiredSharesDisplay: z.string(),
  intensity: z.string(),
  relativeVolume: z.number(),
  relativeVolumeDisplay: z.string(),
  algoAlert: z.string(),
  action: z.string(),
  isAlgoActive: z.boolean(),
});

export const api = {
  indexEvents: {
    list: {
      method: 'GET' as const,
      path: '/api/index-events',
      responses: {
        200: z.array(z.custom<typeof indexEvents.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/index-events',
      input: insertIndexEventSchema,
      responses: {
        201: z.custom<typeof indexEvents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/index-events/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  dailyMetrics: {
    list: {
      method: 'GET' as const,
      path: '/api/daily-metrics',
      responses: {
        200: z.array(z.custom<typeof dailyMetrics.$inferSelect>()),
      },
    },
    byTicker: {
      method: 'GET' as const,
      path: '/api/daily-metrics/:ticker',
      responses: {
        200: z.array(z.custom<typeof dailyMetrics.$inferSelect>()),
      },
    },
  },
  analyze: {
    calculate: {
      method: 'POST' as const,
      path: '/api/analyze',
      input: analyzeTickerSchema,
      responses: {
        200: analysisResultSchema,
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
