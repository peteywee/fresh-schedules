'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2 } from 'lucide-react';

import { getForecastRecommendations } from '@/ai/flows/get-forecast-recommendations';
import type { GetForecastRecommendationsOutput } from '@/ai/flows/get-forecast-recommendations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const historicalDataPlaceholder = JSON.stringify(
  [
    { date: '2023-10-01', sales: 5000, event: 'Local Festival' },
    { date: '2023-10-02', sales: 4500, weather: 'Rainy' },
    { date: '2023-10-03', sales: 4800, weather: 'Sunny' },
  ],
  null,
  2
);

const forecastParametersPlaceholder = JSON.stringify(
  {
    averageWage: 18.5,
    laborPercentage: 0.25,
    projectedEvents: ['Holiday Weekend'],
  },
  null,
  2
);

const formSchema = z.object({
  historicalData: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Must be valid JSON.' }),
  forecastParameters: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Must be valid JSON.' }),
});

type ForecastFormValues = z.infer<typeof formSchema>;

export function ForecastRecommender() {
  const [result, setResult] = useState<GetForecastRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForecastFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalData: historicalDataPlaceholder,
      forecastParameters: forecastParametersPlaceholder,
    },
  });

  async function onSubmit(values: ForecastFormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const recommendation = await getForecastRecommendations(values);
      setResult(recommendation);
    } catch (error) {
      console.error('Error getting forecast recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>AI Forecast Assistant</CardTitle>
              <CardDescription>
                Provide historical data and parameters to get AI-powered forecast recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea className="h-48 font-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="forecastParameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecast Parameters (JSON)</FormLabel>
                    <FormControl>
                      <Textarea className="h-32 font-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Get Recommendations
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>
            Suggestions from our AI to help you build a better forecast.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : result ? (
            <div className="space-y-4 text-sm w-full">
              <div>
                <h3 className="font-semibold font-headline text-lg mb-2">Forecast Recommendations</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.recommendations}</p>
              </div>
              <div>
                <h3 className="font-semibold font-headline text-lg mb-2">Suggestions for Improvement</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.suggestionsForImprovement}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Your AI-generated forecast recommendations will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
