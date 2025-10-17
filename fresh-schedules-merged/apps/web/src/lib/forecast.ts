export type ForecastInputs = {
  lastYearSameDaySales: number;
  recentTrendPct: number;   // -100..+100
  blendRatio: number;       // 0..1
  laborPct: number;         // 0..100
  avgWage: number;          // > 0
};

export function computeForecastSales(inp: ForecastInputs): number {
  const baseA = Math.max(0, inp.lastYearSameDaySales);
  const baseB = baseA * (1 + (inp.recentTrendPct / 100));
  const blended = (inp.blendRatio * baseB) + ((1 - inp.blendRatio) * baseA);
  return Math.round(Math.max(0, blended));
}

export function computeAllowedBudget(forecastSales: number, laborPct: number) {
  return Math.round(Math.max(0, forecastSales * (laborPct / 100)));
}

export function computeAllowedHours(allowedDollars: number, avgWage: number) {
  if (avgWage <= 0) return 0;
  return Math.round(Math.max(0, allowedDollars / avgWage));
}
