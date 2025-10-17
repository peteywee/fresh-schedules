'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from './AuthProvider';

export function useOrgRole(orgId: string | null) {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orgId) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const memberDoc = await getDoc(
          doc(db, 'orgs', orgId, 'members', user.uid)
        );
        
        if (memberDoc.exists()) {
          setRole(memberDoc.data().role);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, orgId]);

  return { role, loading };
}

export function isManager(role: string | null): boolean {
  return role === 'admin' || role === 'manager';
}

export function isStaff(role: string | null): boolean {
  return role === 'staff';
}
