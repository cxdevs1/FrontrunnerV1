import type { AnalyzeTickerRequest, AnalysisResult } from "@shared/schema";

const INDEX_DATA: Record<string, { aum: number; totalCap: number }> = {
  SP500: { aum: 12_500_000_000_000, totalCap: 58_000_000_000_000 },
  SP400: { aum: 1_600_000_000_000, totalCap: 3_200_000_000_000 },
  SP600: { aum: 1_100_000_000_000, totalCap: 1_500_000_000_000 },
};

export interface MechanicalPressureResult {
  pressureScore: number;
  requiredShares: number;
  isMigration: boolean;
  buyPressure?: number;
  sellPressure?: number;
  netDemand?: number;
}

export function getMechanicalPressure(
  mktCap: number,
  price: number,
  avgVol30d: number,
  indexTarget: string,
  isMigration: boolean = false,
  fromIndex?: string
): MechanicalPressureResult {
  const toConfig = INDEX_DATA[indexTarget];
  if (!toConfig) {
    return { pressureScore: 0, requiredShares: 0, isMigration: false };
  }

  // Migration logic: Calculate Net Demand (buyPressure - sellPressure)
  if (isMigration && fromIndex) {
    const fromConfig = INDEX_DATA[fromIndex];
    if (!fromConfig) {
      return { pressureScore: 0, requiredShares: 0, isMigration: false };
    }

    // Sell pressure from exiting index (funds must sell)
    const sellWeight = mktCap / fromConfig.totalCap;
    const sellPressure = (fromConfig.aum * sellWeight) / price;

    // Buy pressure from entering index (funds must buy)
    const buyWeight = mktCap / toConfig.totalCap;
    const buyPressure = (toConfig.aum * buyWeight) / price;

    // Net Mechanical Impact - the value your app sells
    const netDemand = buyPressure - sellPressure;
    const netRequiredShares = Math.abs(netDemand);
    const pressureScore = netRequiredShares / avgVol30d;

    return {
      pressureScore: Math.round(pressureScore * 100) / 100,
      requiredShares: Math.round(netDemand),
      isMigration: true,
      buyPressure: Math.round(buyPressure),
      sellPressure: Math.round(sellPressure),
      netDemand: Math.round(netDemand),
    };
  }

  // Standard addition logic (no migration)
  const weight = mktCap / toConfig.totalCap;
  const requiredDollars = toConfig.aum * weight;
  const requiredShares = requiredDollars / price;
  const pressureScore = requiredShares / avgVol30d;

  return {
    pressureScore: Math.round(pressureScore * 100) / 100,
    requiredShares: Math.round(requiredShares),
    isMigration: false,
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
    isMigration = false,
    fromIndex,
  } = request;

  const pressureResult = getMechanicalPressure(
    marketCap,
    price,
    avgVolume30d,
    indexTarget,
    isMigration,
    fromIndex
  );

  const { pressureScore, requiredShares, buyPressure, sellPressure, netDemand } = pressureResult;
  const intensity = getIntensityLabel(pressureScore);
  const { rvol, isAlgoActive } = detectAlgoFrontrunning(
    morningVolume,
    typicalMorningVolume
  );

  // Enhanced alert messaging for migrations
  let algoAlert: string;
  if (isMigration && fromIndex) {
    const netDirection = (netDemand ?? 0) >= 0 ? "NET BUY" : "NET SELL";
    algoAlert = isAlgoActive
      ? `CAUTION: Algos Front-running ${netDirection}`
      : `Migration: ${fromIndex} → ${indexTarget} (${netDirection})`;
  } else {
    algoAlert = isAlgoActive
      ? "CAUTION: Algos Front-running"
      : "Normal Accumulation";
  }

  // Enhanced action recommendation for migrations
  let action: string;
  if (isMigration && fromIndex) {
    if ((netDemand ?? 0) > 0 && pressureScore > 1.5 && !isAlgoActive) {
      action = "Net Buy Pressure - Squeeze Potential";
    } else if ((netDemand ?? 0) < 0) {
      action = "Net Sell Pressure - Avoid";
    } else {
      action = "Neutral Migration - Watch";
    }
  } else {
    action = pressureScore > 2.5 && !isAlgoActive
      ? "High Squeeze Potential"
      : "Watch for Reversal";
  }

  // Format display for migrations vs standard additions
  let requiredSharesDisplay: string;
  if (isMigration && fromIndex) {
    const prefix = requiredShares >= 0 ? "+" : "";
    requiredSharesDisplay = `${prefix}${requiredShares.toLocaleString()} (Net)`;
  } else {
    requiredSharesDisplay = requiredShares.toLocaleString();
  }

  // Generate mock dates for timeline (announcement = today, effective = 7 days out)
  const today = new Date();
  const effectiveDate = new Date(today);
  effectiveDate.setDate(today.getDate() + 7);
  
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return {
    ticker,
    indexTarget,
    pressureScore,
    pressureScoreDisplay: `${pressureScore}x Daily Vol`,
    requiredShares,
    requiredSharesDisplay,
    intensity,
    relativeVolume: rvol,
    relativeVolumeDisplay: `${rvol}x`,
    algoAlert,
    action,
    isAlgoActive,
    isMigration,
    fromIndex,
    buyPressure,
    sellPressure,
    netDemand,
    announcementDate: formatDate(today),
    effectiveDate: formatDate(effectiveDate),
  };
}

export const SUPPORTED_INDICES = Object.keys(INDEX_DATA);
