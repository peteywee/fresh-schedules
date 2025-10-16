"use client";

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type SignInProvidersProps = {
  status: 'idle' | 'sending';
  onEmailSubmit: (email: string) => Promise<void>;
};

import { z } from "zod";

const emailSchema = z.string().email();

export function SignInProviders({ status, onEmailSubmit }: SignInProvidersProps) {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailSchema.safeParse(emailInput).success) {
      setError('Enter a valid work email.');
      return;
    }
    setError(null);
    await onEmailSubmit(emailInput.trim());
  }

  return (
    <div className="space-y-4">
      <Card title="Continue with Google" description="Single tap sign-in for Google Workspace teams.">
        {/* TODO: Implement Google OAuth flow here */}
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            // Placeholder for Google OAuth sign-in
            // Implement Google sign-in logic here
          }}
        >
          Continue with Google
        </Button>
      </Card>

      <Card title="Email link" description="Receive a one-time link so you never manage passwords.">
        <form onSubmit={handleSubmit} className="fs-grid" style={{ gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Work email</span>
            <input
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="manager@fresh.co"
              required
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(148,163,184,0.4)',
                padding: '0.65rem 0.85rem',
                background: 'rgba(15,23,42,0.65)',
                color: '#f8fafc',
              }}
            />
          </label>
          {error && <span style={{ color: '#f97316', fontSize: '0.8rem' }}>{error}</span>}
          <Button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending link…' : 'Send sign-in link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
