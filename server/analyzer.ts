import type { AnalyzeTickerRequest, AnalysisResult } from "@shared/schema";

const INDEX_DATA: Record<string, { aum: number; totalCap: number }> = {
  SP500: { aum: 12_500_000_000_000, totalCap: 58_000_000_000_000 },
  SP400: { aum: 1_600_000_000_000, totalCap: 3_200_000_000_000 },
  SP600: { aum: 1_100_000_000_000, totalCap: 1_500_000_000_000 },
};

export function getMechanicalPressure(
  mktCap: number,
  price: number,
  avgVol30d: number,
  indexTarget: string
): { pressureScore: number; requiredShares: number } {
  const config = INDEX_DATA[indexTarget];
  if (!config) {
    return { pressureScore: 0, requiredShares: 0 };
  }

  const weight = mktCap / config.totalCap;
  const requiredDollars = config.aum * weight;
  const requiredShares = requiredDollars / price;
  const pressureScore = requiredShares / avgVol30d;

  return {
    pressureScore: Math.round(pressureScore * 100) / 100,
    requiredShares: Math.round(requiredShares),
  };
}

export function getIntensityLabel(pressureScore: number): string {
  if (pressureScore > 3.0) return "EXTREME";
  if (pressureScore > 1.5) return "HIGH";
  return "NORMAL";
}

export function detectAlgoFrontrunning(
  currentVol: number,
  avgMorningVol: number
): { rvol: number; isAlgoActive: boolean } {
  const rvol = currentVol / avgMorningVol;
  const isAlgoActive = rvol > 3.0;
  return { rvol: Math.round(rvol * 100) / 100, isAlgoActive };
}

export function analyzeNewAddition(request: AnalyzeTickerRequest): AnalysisResult {
  const {
    ticker,
    marketCap,
    price,
    avgVolume30d,
    morningVolume,
    typicalMorningVolume,
    indexTarget,
  } = request;

  const { pressureScore, requiredShares } = getMechanicalPressure(
    marketCap,
    price,
    avgVolume30d,
    indexTarget
  );
  const intensity = getIntensityLabel(pressureScore);
  const { rvol, isAlgoActive } = detectAlgoFrontrunning(
    morningVolume,
    typicalMorningVolume
  );

  const algoAlert = isAlgoActive
    ? "CAUTION: Algos Front-running"
    : "Normal Accumulation";

  const action =
    pressureScore > 2.5 && !isAlgoActive
      ? "High Squeeze Potential"
      : "Watch for Reversal";

  return {
    ticker,
    indexTarget,
    pressureScore,
    pressureScoreDisplay: `${pressureScore}x Daily Vol`,
    requiredShares,
    requiredSharesDisplay: requiredShares.toLocaleString(),
    intensity,
    relativeVolume: rvol,
    relativeVolumeDisplay: `${rvol}x`,
    algoAlert,
    action,
    isAlgoActive,
  };
}

export const SUPPORTED_INDICES = Object.keys(INDEX_DATA);
