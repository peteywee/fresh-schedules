"use client";

import { useState } from 'react';
import Link from 'next/link';

import { SignInProviders } from '@/components/app/sign-in-providers';

export function SignInExperience() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');

  return (
    <section className="fs-card">
      <header style={{ display: 'grid', gap: '0.75rem' }}>
        <div className="fs-tag">Access</div>
        <h1 style={{ margin: 0 }}>Sign in to Fresh Schedules</h1>
        <p style={{ color: '#cbd5f5', maxWidth: '48ch' }}>
          Continue with Google for the fastest access. Email link sign-in keeps managers secure without additional
          passwords.
        </p>
      </header>

      <SignInProviders
        onEmailSubmit={async (value: string) => {
          setStatus('sending');
          await new Promise((resolve) => setTimeout(resolve, 750));
          setEmail(value);
          setStatus('idle');
        }}
        status={status}
      />

      {email && (
        <div className="fs-card" style={{ marginTop: '1.5rem' }}>
          <h3>Check your inbox</h3>
          <p>We sent a magic link to {email}. Open it on the device where you want to manage schedules.</p>
        </div>
      )}

      <footer style={{ marginTop: '2rem' }}>
        <Link href="/" className="fs-button secondary">
          Return home
        </Link>
      </footer>
    </section>
  );
}
