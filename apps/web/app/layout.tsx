import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Fresh Schedules',
  description: 'Scheduling PWA',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <div className="fs-container">{children}</div>
        </main>
      </body>
    </html>
  );
}
