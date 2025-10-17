'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2 } from 'lucide-react';

import { generateLaborPlan } from '@/ai/flows/generate-labor-plan';
import type { GenerateLaborPlanOutput } from '@/ai/flows/generate-labor-plan';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  forecastedSales: z.coerce.number().min(0, 'Forecasted sales must be positive.'),
  laborPercentage: z.coerce.number().min(0).max(1, 'Labor percentage must be between 0 and 1 (e.g., 0.3 for 30%).'),
  averageWage: z.coerce.number().min(0, 'Average wage must be positive.'),
});

type LaborPlanFormValues = z.infer<typeof formSchema>;

export function LaborPlanGenerator() {
  const [result, setResult] = useState<GenerateLaborPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LaborPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      forecastedSales: 10000,
      laborPercentage: 0.25,
      averageWage: 18.5,
    },
  });

  async function onSubmit(values: LaborPlanFormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const plan = await generateLaborPlan(values);
      setResult(plan);
    } catch (error) {
      console.error('Error generating labor plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate labor plan. Please try again.',
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
              <CardTitle>Labor Plan Calculator</CardTitle>
              <CardDescription>
                Input your forecast details to calculate allowed labor hours and cost.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="forecastedSales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecasted Sales ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="laborPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Labor Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 0.25 for 25%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="averageWage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Hourly Wage ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 18.50" {...field} />
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
                Generate Plan
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generated Plan</CardTitle>
          <CardDescription>
            Your calculated labor targets based on the provided inputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : result ? (
            <div className="grid grid-cols-2 gap-8 text-center w-full">
              <div>
                <p className="text-sm text-muted-foreground">Allowed Labor Hours</p>
                <p className="text-4xl font-bold font-headline">
                  {result.allowedLaborHours.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allowed Labor Cost</p>
                <p className="text-4xl font-bold font-headline">
                  ${result.allowedLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Your generated labor plan will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
