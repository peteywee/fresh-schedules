"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, Shield } from 'lucide-react';

import { SignInProviders } from '@/components/app/sign-in-providers';

export function SignInExperience() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');
  const [signedInUser, setSignedInUser] = useState<User | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <section className="signin-card">
          <header className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="fs-tag mb-2">Access</div>
            <h1 data-testid="heading-signin" className="text-2xl font-bold text-white mb-2">Sign in to Fresh Schedules</h1>
            <p className="text-slate-300 text-sm">
              Continue with Google for the fastest access. Email link sign-in keeps managers secure without additional passwords.
            </p>
          </header>

          <div className="mb-8">
            <SignInProviders
              onEmailSubmit={async (value: string) => {
                setStatus('sending');
                await new Promise((resolve) => setTimeout(resolve, 750));
                setEmail(value);
                setStatus('idle');
              }}
              onGoogleSignIn={(user) => {
                setSignedInUser(user);
                // TODO: Handle successful sign-in, e.g., redirect or update state
              }}
              status={status}
            />
          </div>

          {signedInUser && (
            <div className="fs-card mb-4 bg-green-900/20 border-green-500/30">
              <h3 className="text-green-400 font-semibold mb-2">Welcome, {signedInUser.displayName}!</h3>
              <p className="text-green-300 text-sm">You have successfully signed in with Google.</p>
            </div>
          )}

          {email && (
            <div className="fs-card mb-4" data-testid="confirmation-card">
              <h3 data-testid="confirmation-heading" className="text-lg font-semibold text-white mb-2">Check your inbox</h3>
              <p data-testid="confirmation-body" className="text-slate-300 text-sm">We sent a magic link to {email}. Open it on the device where you want to manage schedules.</p>
            </div>
          )}

          <footer className="text-center">
            <Link href="/" className="fs-button secondary text-sm">
              Return home
            </Link>
          </footer>
        </section>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-xs text-slate-400">Secure</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-xs text-slate-400">Team Ready</span>
          </div>
          <div className="flex flex-col items-center">
            <Calendar className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-xs text-slate-400">Easy Scheduling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
