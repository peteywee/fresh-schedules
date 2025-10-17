export interface LaborBudget {
  forecastSales: number;
  laborPct: number;
  avgWage: number;
}

export function calculateAllowedLabor(budget: LaborBudget) {
  const allowedDollars = budget.forecastSales * (budget.laborPct / 100);
  const allowedHours = allowedDollars / budget.avgWage;
  
  return {
    allowedDollars: Math.round(allowedDollars * 100) / 100,
    allowedHours: Math.round(allowedHours * 100) / 100
  };
}

export function forecastSales(
  lastYearSales: number,
  recentWeeklyAvg: number,
  blendRatio: number = 0.5
): number {
  return Math.round(
    (lastYearSales * blendRatio) + (recentWeeklyAvg * (1 - blendRatio))
  );
}

export function calculateLaborPercentage(
  scheduledHours: number,
  avgWage: number,
  forecastSales: number
): number {
  const laborCost = scheduledHours * avgWage;
  return Math.round((laborCost / forecastSales) * 10000) / 100;
}
