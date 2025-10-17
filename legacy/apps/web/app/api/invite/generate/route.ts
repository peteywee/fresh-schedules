import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { parentId, type, role, maxUses } = await req.json();
  const uid = req.headers.get('x-user-id');
  
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify user has admin/manager role
  const memberDoc = await adminDb.collection(type === 'corp' ? 'corps' : 'orgs')
    .doc(parentId)
    .collection('members')
    .doc(uid!)
    .get();
  
  if (!memberDoc.exists() || !['owner', 'corpManager', 'admin', 'manager'].includes(memberDoc.data()!.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Generate 8-char code
  const code = Array.from({ length: 8 }, () => 
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
  ).join('');
  
  await adminDb.collection(type === 'corp' ? 'corps' : 'orgs')
    .doc(parentId)
    .collection('invites')
    .doc(code)
    .set({
      code,
      role,
      maxUses,
      remaining: maxUses,
      createdBy: uid,
      createdAt: new Date()
    });
  
  return NextResponse.json({ code });
}
