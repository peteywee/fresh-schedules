import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function createOrgAndMembership(uid: string, name: string): Promise<{orgId:string}> {
  const orgRef = await addDoc(collection(db(), "orgs"), {
    name, createdAt: serverTimestamp(), createdBy: uid
  });
  await setDoc(doc(db(), "orgs", orgRef.id, "members", uid), {
    role: "owner", status: "active", joinedAt: serverTimestamp()
  });
  if (typeof window !== "undefined") localStorage.setItem("primaryOrgId", orgRef.id);
  return { orgId: orgRef.id };
}

export async function redeemJoinToken(uid: string, token: string): Promise<{orgId:string}> {
  // MVP: interpret token as orgId (replace with secure token service later)
  // SECURITY: This is insecure. A proper one-time token system is required.
  throw new Error("Secure token redemption is not yet implemented.");
  /*
  const orgId = token.trim();
  await setDoc(doc(db(), "orgs", orgId, "members", uid), {
    role: "staff", status: "active", joinedAt: serverTimestamp()
  }, { merge: true });
  if (typeof window !== "undefined") localStorage.setItem("primaryOrgId", orgId);
  return { orgId };
  */
}