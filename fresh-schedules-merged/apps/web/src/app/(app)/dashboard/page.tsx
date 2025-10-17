import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { FileDown, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Here's a snapshot of your team's performance."
      >
        <Button variant="outline">
            <FileDown className="mr-2" />
            Export
        </Button>
        <Button>
            <PlusCircle className="mr-2" />
            Create Schedule
        </Button>
      </PageHeader>
      <div className="grid gap-6">
        <OverviewCards />
        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <SalesChart />
            </div>
            <div className="lg:col-span-2">
                <RecentActivities />
            </div>
        </div>
      </div>
    </>
  );
}
