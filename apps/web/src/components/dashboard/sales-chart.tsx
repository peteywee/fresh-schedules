'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const data = [
  { name: 'Mon', sales: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Tue', sales: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Wed', sales: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Thu', sales: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Fri', sales: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sat', sales: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sun', sales: Math.floor(Math.random() * 5000) + 1000 },
];

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Sales</CardTitle>
        <CardDescription>A summary of this week's sales performance.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', radius: 'var(--radius)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
