"use client";

import { useAuth } from "@/lib/auth/AuthProvider";

export function SignInExperience() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.displayName}</h1>
        <p>You are signed in.</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Sign In</h1>
      <p>This is where the sign-in form will go.</p>
    </div>
  );
}
