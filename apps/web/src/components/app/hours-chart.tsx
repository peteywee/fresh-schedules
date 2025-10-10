export type HoursBreakdown = {
  label: string;
  hours: number;
};

export function HoursChart({ data }: { data: HoursBreakdown[] }) {
  if (data.length === 0) {
    return null;
  }

  const maxHours = Math.max(...data.map((item) => item.hours));

  return (
    <section className="fs-card">
      <header style={{ marginBottom: '1.25rem' }}>
        <div className="fs-tag">Manager hours</div>
        <h2 style={{ margin: '0.75rem 0 0' }}>Coverage snapshot</h2>
        <p style={{ color: '#cbd5f5', margin: '0.75rem 0 0' }}>
          Visual reference to ensure no one is over-allocated before publishing the schedule.
        </p>
      </header>
      <div className="fs-grid" style={{ gap: '1rem' }}>
        {data.map((item) => {
          const percentage = maxHours === 0 ? 0 : Math.round((item.hours / maxHours) * 100);
          return (
            <div key={item.label} className="hours-bar">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{item.label}</span>
                <span>{item.hours.toFixed(1)}h</span>
              </div>
              <div className="hours-bar-track">
                <div className="hours-bar-fill" style={{ width: `${percentage}%`, minWidth: '4%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
