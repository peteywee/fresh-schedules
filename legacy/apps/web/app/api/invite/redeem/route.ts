import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { code, type } = await req.json(); // type: 'corp' | 'org'
  const uid = req.headers.get('x-user-id'); // From middleware
  
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const collection = type === 'corp' ? 'corps' : 'orgs';
  
  // Find invite
  const inviteSnap = await adminDb.collectionGroup('invites')
    .where('code', '==', code)
    .limit(1)
    .get();
  
  if (inviteSnap.empty) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
  }
  
  const inviteDoc = inviteSnap.docs[0];
  const invite = inviteDoc.data();
  const parentId = inviteDoc.ref.parent.parent!.id; // corpId or orgId
  
  // Check remaining uses
  if (invite.remaining <= 0) {
    return NextResponse.json({ error: 'Invite exhausted' }, { status: 400 });
  }
  
  // Check expiration
  if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
  }
  
  // Add member
  await adminDb.collection(collection).doc(parentId).collection('members').doc(uid).set({
    role: invite.role,
    joinedAt: new Date(),
    invitedBy: invite.createdBy
  });
  
  // Decrement remaining
  await inviteDoc.ref.update({
    remaining: invite.remaining - 1
  });
  
  // Update user profile
  if (type === 'org') {
    await adminDb.collection('users').doc(uid).update({
      primaryOrgId: parentId
    });
  } else {
    // This is not quite right, but we'll fix it later.
    // await adminDb.collection('users').doc(uid).update({
    //   corpIds: admin.firestore.FieldValue.arrayUnion(parentId)
    // });
  }
  
  return NextResponse.json({ success: true, parentId, role: invite.role });
}
