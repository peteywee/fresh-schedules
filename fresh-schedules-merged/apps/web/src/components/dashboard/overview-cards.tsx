import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Clock, Zap } from 'lucide-react';

const kpiData = [
  {
    title: 'Today\'s Sales',
    value: '$12,345',
    change: '+5.2%',
    icon: DollarSign,
  },
  {
    title: 'Labor Cost',
    value: '$3,123',
    change: '25.3%',
    icon: Users,
  },
  {
    title: 'Scheduled Hours',
    value: '145.5',
    change: '-2.1%',
    icon: Clock,
  },
  {
    title: 'Sales per Labor Hour',
    value: '$84.84',
    change: '+8.3%',
    icon: Zap,
  },
];

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.change} from last period</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
