import Link from 'next/link';

const heroStats = [
  { label: 'Setup time', value: '< 15 min', hint: 'New org onboarding' },
  { label: 'Publish time', value: '< 5 min', hint: 'Manager to live schedule' },
  { label: 'Coverage score', value: '100%', hint: 'Auto gap detection' },
];

export default function HomePage() {
  return (
    <>
      <section className="fs-card">
        <header style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="fs-tag">Fresh Schedules</div>
          <h1 style={{ fontSize: '2.5rem', lineHeight: 1.1 }}>Build and publish a perfect week in minutes.</h1>
          <p>
            Track staffing needs, publish shifts, and keep teams aligned with instant notifications. Fresh Schedules keeps
            managers productive and crews informed.
          </p>
        </header>
        <footer>
          <Link href="/schedule" className="fs-button">
            View schedule demo
          </Link>
          <Link href="/signin" className="fs-button secondary">
            Sign in / Request access
          </Link>
        </footer>
      </section>

      <section className="fs-grid fs-grid-two" style={{ gap: '1.5rem' }}>
        <div className="fs-card">
          <h2>Speed is the KPI</h2>
          <p>
            Our CEO metric: a manager should create, review, and publish an entire week in less than five minutes. Review the
            dashboard walkthrough to see how the workflow keeps everything in one tab.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
            {heroStats.map((stat) => (
              <li key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#cbd5f5', fontSize: '0.95rem' }}>{stat.label}</span>
                <span style={{ fontWeight: 600 }}>{stat.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="fs-card">
          <h2>What&apos;s included</h2>
          <p>Next.js App Router, an Express API, Firebase Auth + Firestore, and Zod-validated schemas across the stack.</p>
          <p>
            Follow the Copilot Project Pack to generate features safely. Every config value uses env variables and
            placeholders so secrets never leak into git.
          </p>
          <Link href="/schedule" className="fs-button secondary" style={{ width: 'fit-content' }}>
            Explore weekly planner
          </Link>
        </div>
      </section>
    </>
  );
}
