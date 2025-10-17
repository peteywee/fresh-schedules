'use client';

import { useMemo } from 'react';
import { calculateAllowedLabor, calculateLaborPercentage } from '@/lib/utils/labor';
import { calculateDuration } from '@/lib/utils/time';

interface BudgetPanelProps {
  forecastSales: number;
  laborPct: number;
  avgWage: number;
  shifts: Array<{ start: string; end: string }>;
}

export function BudgetPanel({ forecastSales, laborPct, avgWage, shifts }: BudgetPanelProps) {
  const budget = useMemo(
    () => calculateAllowedLabor({ forecastSales, laborPct, avgWage }),
    [forecastSales, laborPct, avgWage]
  );

  const scheduledHours = useMemo(
    () => shifts.reduce((sum, shift) => sum + calculateDuration(shift.start, shift.end), 0),
    [shifts]
  );

  const scheduledCost = scheduledHours * avgWage;
  const actualLaborPct = calculateLaborPercentage(scheduledHours, avgWage, forecastSales);
  const isOverBudget = scheduledHours > budget.allowedHours;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Labor Budget</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Forecast Sales</span>
          <span className="font-medium">${forecastSales.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Target Labor %</span>
          <span className="font-medium">{laborPct}%</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Allowed Hours</span>
            <span className="font-medium">{budget.allowedHours.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Scheduled Hours</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {scheduledHours.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
              {(budget.allowedHours - scheduledHours).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Allowed Cost</span>
            <span className="font-medium">${budget.allowedDollars.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Scheduled Cost</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
              ${scheduledCost.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Actual Labor %</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {actualLaborPct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      
      {isOverBudget && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ Over budget by {(scheduledHours - budget.allowedHours).toFixed(2)} hours
          </p>
        </div>
      )}
    </div>
  );
}
