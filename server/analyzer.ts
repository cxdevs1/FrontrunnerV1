import type { AnalyzeTickerRequest, AnalysisResult } from "@shared/schema";

const INDEX_AUM_SP500 = 12_500_000_000_000; // $12.5 Trillion
const TOTAL_SP500_CAP = 52_000_000_000_000; // $52 Trillion

export function getMechanicalPressure(
  mktCap: number,
  price: number,
  avgVol30d: number
): number {
  const weight = mktCap / TOTAL_SP500_CAP;
  const requiredDollars = INDEX_AUM_SP500 * weight;
  const requiredShares = requiredDollars / price;
  const pressureScore = requiredShares / avgVol30d;
  return Math.round(pressureScore * 100) / 100;
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
  const { ticker, marketCap, price, avgVolume30d, morningVolume, typicalMorningVolume } = request;

  const pressureScore = getMechanicalPressure(marketCap, price, avgVolume30d);
  const { rvol, isAlgoActive } = detectAlgoFrontrunning(morningVolume, typicalMorningVolume);

  const algoAlert = isAlgoActive
    ? "CAUTION: Algos Front-running"
    : "Normal Accumulation";

  const action =
    pressureScore > 2.5 && !isAlgoActive
      ? "High Squeeze Potential"
      : "Watch for Reversal";

  return {
    ticker,
    pressureScore,
    pressureScoreDisplay: `${pressureScore}x Daily Vol`,
    relativeVolume: rvol,
    relativeVolumeDisplay: `${rvol}x`,
    algoAlert,
    action,
    isAlgoActive,
  };
}
