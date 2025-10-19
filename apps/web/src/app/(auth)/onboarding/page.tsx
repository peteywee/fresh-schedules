"use client";
import React from "react";
import { useAuthCtx } from "@/lib/auth/context";
import { createOrgAndMembership, redeemJoinToken } from "@/lib/onboarding";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { uid, loading } = useAuthCtx();
  const [orgName, setOrgName] = React.useState("");
  const [token, setToken] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();

  if (loading) return <div className="p-6">Loading…</div>;
  if (!uid) return <div className="p-6">Please sign in first.</div>;

  const createOrg = async () => {
    setBusy(true);
    try {
      await createOrgAndMembership(uid!, orgName || "New Organization");
      router.push("/schedule/month");
    } finally { setBusy(false); }
  };

  const joinOrg = async () => {
    setBusy(true);
    try {
      await redeemJoinToken(uid!, token);
      router.push("/(app)/schedule/month");
    } finally { setBusy(false); }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Onboarding</h1>
      <div className="border rounded-2xl p-4 mb-4">
        <h2 className="font-semibold mb-2">Create Organization</h2>
        <input
          placeholder="Organization name"
          value={orgName}
          onChange={e=>setOrgName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button onClick={createOrg} disabled={busy} className="mt-3 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          {busy ? "Creating…" : "Create & Continue"}
        </button>
      </div>
      <div className="border rounded-2xl p-4">
        <h2 className="font-semibold mb-2">Join with Token</h2>
        <input
          placeholder="Enter join token"
          value={token}
          onChange={e=>setToken(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button onClick={joinOrg} disabled={busy} className="mt-3 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          {busy ? "Joining…" : "Join & Continue"}
        </button>
      </div>
    </div>
  );
}