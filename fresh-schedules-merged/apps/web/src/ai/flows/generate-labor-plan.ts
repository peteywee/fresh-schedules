'use server';

/**
 * @fileOverview Generates a labor plan based on forecasted sales and labor percentage.
 *
 * - generateLaborPlan - A function that generates the labor plan.
 * - GenerateLaborPlanInput - The input type for the generateLaborPlan function.
 * - GenerateLaborPlanOutput - The return type for the generateLaborPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLaborPlanInputSchema = z.object({
  forecastedSales: z
    .number()
    .describe('The forecasted sales for the period.'),
  laborPercentage: z
    .number()
    .describe('The target labor percentage of sales (e.g., 0.30 for 30%).'),
  averageWage: z.number().describe('The average hourly wage of employees.'),
});

export type GenerateLaborPlanInput = z.infer<typeof GenerateLaborPlanInputSchema>;

const GenerateLaborPlanOutputSchema = z.object({
  allowedLaborHours: z
    .number()
    .describe('The calculated allowed labor hours for the period.'),
  allowedLaborCost: z
    .number()
    .describe('The calculated allowed labor cost for the period.'),
});

export type GenerateLaborPlanOutput = z.infer<typeof GenerateLaborPlanOutputSchema>;

export async function generateLaborPlan(
  input: GenerateLaborPlanInput
): Promise<GenerateLaborPlanOutput> {
  return generateLaborPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLaborPlanPrompt',
  input: {schema: GenerateLaborPlanInputSchema},
  output: {schema: GenerateLaborPlanOutputSchema},
  prompt: `Given the following forecasted sales, labor percentage, and average wage, calculate the allowed labor hours and allowed labor cost.

Forecasted Sales: {{{forecastedSales}}}
Labor Percentage: {{{laborPercentage}}}
Average Wage: {{{averageWage}}}

Calculate the allowed labor hours by multiplying the forecasted sales by the labor percentage, and then dividing by the average wage.
Calculate the allowed labor cost by multiplying the forecasted sales by the labor percentage.

Return the allowed labor hours and allowed labor cost. No explanation needed.
`,
});

const generateLaborPlanFlow = ai.defineFlow(
  {
    name: 'generateLaborPlanFlow',
    inputSchema: GenerateLaborPlanInputSchema,
    outputSchema: GenerateLaborPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
