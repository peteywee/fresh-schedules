'use server';

/**
 * @fileOverview A flow that provides AI-driven forecast recommendations, including suggestions
 * for incorporating additional data to improve forecast accuracy.
 *
 * - getForecastRecommendations - A function that returns forecast recommendations.
 * - GetForecastRecommendationsInput - The input type for the getForecastRecommendations function.
 * - GetForecastRecommendationsOutput - The return type for the getForecastRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetForecastRecommendationsInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical sales data as a JSON string, including date, sales, and any other relevant factors like weather or events.'
    ),
  forecastParameters: z
    .string()
    .describe(
      'Forecast parameters as a JSON string, including average wage, labor percentage, and any other relevant constraints.'
    ),
});
export type GetForecastRecommendationsInput = z.infer<
  typeof GetForecastRecommendationsInputSchema
>;

const GetForecastRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'AI-driven forecast recommendations, including suggested labor hours and dollars.'
    ),
  suggestionsForImprovement: z
    .string()
    .describe(
      'Suggestions for incorporating additional data to improve forecast accuracy.'
    ),
});
export type GetForecastRecommendationsOutput = z.infer<
  typeof GetForecastRecommendationsOutputSchema
>;

export async function getForecastRecommendations(
  input: GetForecastRecommendationsInput
): Promise<GetForecastRecommendationsOutput> {
  return getForecastRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getForecastRecommendationsPrompt',
  input: {schema: GetForecastRecommendationsInputSchema},
  output: {schema: GetForecastRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide forecast recommendations to managers, including suggestions for incorporating additional data to improve forecast accuracy.

  Based on the historical sales data:
  {{historicalData}}

  And the following forecast parameters:
  {{forecastParameters}}

  Provide forecast recommendations, including suggested labor hours and dollars. Also, provide suggestions for incorporating additional data to improve forecast accuracy.  If you cannot make a good recommendation, say so, and why.
  `,
});

const getForecastRecommendationsFlow = ai.defineFlow(
  {
    name: 'getForecastRecommendationsFlow',
    inputSchema: GetForecastRecommendationsInputSchema,
    outputSchema: GetForecastRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

