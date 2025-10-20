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
  return Promise.reject(new Error("Secure token redemption is not yet implemented."));
}