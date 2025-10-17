export type BrandId = string & { readonly __brand: "BrandId" };
export type OrgId = string & { readonly __brand: "OrgId" };
export type UserId = string & { readonly __brand: "UserId" };

export interface Shift {
  id: string;
  orgId: OrgId;
  userId: UserId;
  role: "manager" | "staff";
  startsAt: string; // ISO
  endsAt: string;   // ISO
}

export interface ForecastInputs {
  avgHourlyWage: number;     // dollars/hour
  laborPercent: number;       // 0-100
  forecastSales: number;      // dollars
}

export function allowedLaborDollars(inputs: ForecastInputs): number {
  return inputs.forecastSales * (inputs.laborPercent / 100);
}

export function allowedLaborHours(inputs: ForecastInputs): number {
  const dollars = allowedLaborDollars(inputs);
  return inputs.avgHourlyWage > 0 ? dollars / inputs.avgHourlyWage : 0;
}
