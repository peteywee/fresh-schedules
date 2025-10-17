import { PageHeader } from '@/components/page-header';
import { LaborPlanGenerator } from '@/components/labor/labor-plan-generator';

export default function LaborPage() {
  return (
    <>
      <PageHeader
        title="Labor Planning"
        description="Use AI to calculate your optimal labor budget based on sales forecasts."
      />
      <LaborPlanGenerator />
    </>
  );
}
