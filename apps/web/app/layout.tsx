import type { ReactNode } from 'react';

export const metadata = {
  title: 'Fresh Schedules',
  description: 'Scheduling PWA',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
