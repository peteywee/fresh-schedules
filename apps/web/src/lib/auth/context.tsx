"use client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { auth, db } from "@/lib/firebase";

export type Role = "owner" | "admin" | "manager" | "staff";
export type AuthCtx = {
  uid: string | null;
  role: Role | null;
  orgId: string | null;
  loading: boolean;
};

const Ctx = React.createContext<AuthCtx>({ uid: null, role: null, orgId: null, loading: true });
export const useAuthCtx = () => React.useContext(Ctx);

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const fromLS = localStorage.getItem("primaryOrgId");
  if (fromLS) return fromLS;
  // During verification runs, default an orgId so the page renders.
  return process.env.NEXT_PUBLIC_E2E === "1" ? "e2e-org" : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthCtx>({ uid: null, role: null, orgId: null, loading: true });

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth(), async (u) => {
      const orgId = getCurrentOrgId();
      if (!u || !orgId) { setState({ uid: u?.uid ?? null, role: null, orgId, loading: false }); return; }
      try {
        const snap = await getDoc(doc(db(), "orgs", orgId, "members", u.uid));
        const role = (snap.exists() ? snap.data()?.role : null) as Role | null;
        setState({ uid: u.uid, role, orgId, loading: false });
      } catch {
        setState({ uid: u.uid, role: null, orgId, loading: false });
      }
    });
    return () => unsub();
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}