import './globals.css';
import type { ReactNode } from 'react';
import { ServiceWorkerRegistration } from './service-worker-registration';

export const metadata = {
  title: 'Fresh Schedules',
  description: 'Scheduling PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fresh Schedules',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fresh Schedules" />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <main>
          <div className="fs-container">{children}</div>
        </main>
      </body>
    </html>
  );
}
