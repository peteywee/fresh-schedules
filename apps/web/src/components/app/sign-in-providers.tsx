/**
 * @fileoverview A component that provides different sign-in methods for the user.
 * It supports sign-in with Google and email link.
 */
"use client";

import { useState, type FormEvent } from 'react';
import { z } from "zod";

import { signInWithGoogle } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Props for the `SignInProviders` component.
 * @property {'idle' | 'sending'} status - The current status of the email submission process.
 * @property {(email: string) => Promise<void>} onEmailSubmit - A callback function to handle email submission.
 * @property {(user: any) => void} onGoogleSignIn - A callback function to handle Google sign-in success.
 */
export type SignInProvidersProps = {
  status: 'idle' | 'sending';
  onEmailSubmit: (email: string) => Promise<void>;
  onGoogleSignIn: (user: any) => void;
};

/**
 * Zod schema for validating an email address.
 */
const emailSchema = z.string().email();

/**
 * A React component that renders sign-in options, including Google OAuth and email link.
 * It handles form submission for the email link, including validation and status updates.
 *
 * @param {SignInProvidersProps} props - The component props.
 * @returns {React.ReactElement} The rendered sign-in providers component.
 */
export function SignInProviders({ status, onEmailSubmit, onGoogleSignIn }: SignInProvidersProps): React.ReactElement {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  /**
   * Handles the form submission for the email sign-in.
   * It validates the email and calls the `onEmailSubmit` callback.
   * @param {FormEvent<HTMLFormElement>} event - The form submission event.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailSchema.safeParse(emailInput).success) {
      setError('Enter a valid work email.');
      return;
    }
    setError(null);
    await onEmailSubmit(emailInput.trim());
  }

  /**
   * Handles the Google sign-in.
   */
  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      onGoogleSignIn(user);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Continue with Google" description="Single tap sign-in for Google Workspace teams.">
        <Button
          variant="primary"
          type="button"
          data-testid="btn-google"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </Card>

      <Card title="Email link" description="Receive a one-time link so you never manage passwords.">
        <form onSubmit={handleSubmit} className="fs-grid" style={{ gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Work email</span>
            <input
              data-testid="input-email"
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
          <Button data-testid="btn-send-link" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending link…' : 'Send sign-in link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
