// Replace this with your real post-sign-in routing guard.
// For now we read from localStorage set after onboarding.
export function getCurrentOrgId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('primaryOrgId');
}
