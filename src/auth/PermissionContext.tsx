import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Capability } from './Capability';
export { Capability };
import { PermissionService, FirebaseCustomClaims } from '../services/PermissionService';
import { useAuth } from './AuthProvider';

export type UserRole = 'ADMIN' | 'STAFF' | 'PARENT_STUDENT';

export interface UserSession {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceName: string;
  claims?: FirebaseCustomClaims;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface PermissionContextType {
  session: UserSession;
  authStatus: AuthStatus;
  capabilities: Set<Capability | string>;
  hasCapability: (cap: Capability | string) => boolean;
  switchWorkspaceRole: (newRole: UserRole) => boolean;
  requestElevatedAccess: (requiredCapability: Capability | string) => boolean;
  logout: () => Promise<void>;
  isElevatedAccessOpen: boolean;
  setIsElevatedAccessOpen: (open: boolean) => void;
  pendingCapability: Capability | string | null;
  setPendingCapability: (cap: Capability | string | null) => void;
}

export function purgeSensitiveLocalStorageOnLogout() {
  localStorage.removeItem('campusos_elevation_token');
  localStorage.removeItem('campusos_extracted_documents');
  localStorage.removeItem('campusos_teacher_leaves');
  localStorage.removeItem('campusos_students_roster');
  localStorage.removeItem('campusos_audit_logs_cache');
}

const DEFAULT_SESSION: UserSession = {
  uid: 'user-001',
  name: 'Dr. Aris Vance (Principal)',
  email: 'admin@centralhigh.edu',
  role: 'ADMIN',
  workspaceName: 'Central High (Main Campus)',
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { identity } = useAuth();
  const [session, setSession] = useState<UserSession>(DEFAULT_SESSION);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('authenticated');
  const [isElevatedAccessOpen, setIsElevatedAccessOpen] = useState(false);
  const [pendingCapability, setPendingCapability] = useState<Capability | string | null>(null);

  // Sync session whenever Enterprise AuthProvider identity updates
  useEffect(() => {
    if (identity) {
      const targetRole: UserRole =
        identity.userType === 'PARENT' || identity.userType === 'STUDENT'
          ? 'PARENT_STUDENT'
          : identity.userType === 'HOD' || identity.userType === 'TEACHER'
          ? 'STAFF'
          : 'ADMIN';

      setSession({
        uid: identity.uid,
        name: identity.displayName || identity.email,
        email: identity.email,
        role: targetRole,
        workspaceName: identity.organizationId || 'Central High (Main Campus)',
        claims: {
          role: targetRole,
          orgId: identity.organizationId || 'org-central-high',
        },
      });
      setAuthStatus('authenticated');
    }
  }, [identity]);

  // Wire Firebase Auth Listener & Custom Claims Decoding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idTokenResult = await fbUser.getIdTokenResult();
          const claimsRole = idTokenResult.claims.role as UserRole | undefined;
          const claimsOrgId = (idTokenResult.claims.orgId as string) || 'org-central-high';

          const effectiveRole = claimsRole || 'ADMIN';
          setSession({
            uid: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Dr. Aris Vance (Principal)',
            email: fbUser.email || 'admin@centralhigh.edu',
            role: effectiveRole,
            workspaceName: 'Central High (Main Campus)',
            claims: {
              role: effectiveRole,
              orgId: claimsOrgId,
            },
          });
          setAuthStatus('authenticated');
        } catch (err) {
          console.warn('Error resolving ID token claims:', err);
          setAuthStatus('authenticated');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // O(1) Capability Checking via PermissionService - Zero trust when not authenticated
  const hasCapability = (cap: Capability | string) => {
    if (authStatus !== 'authenticated') return false;
    return PermissionService.hasCapability(session.role, cap as Capability, session.claims);
  };

  const switchWorkspaceRole = (newRole: UserRole): boolean => {
    setSession((prev) => ({
      ...prev,
      role: newRole,
      name:
        newRole === 'STAFF'
          ? 'Prof. Elena Rostova (Faculty)'
          : newRole === 'PARENT_STUDENT'
          ? 'Aarav Sharma (Student / Parent)'
          : 'Dr. Aris Vance (Principal)',
      email:
        newRole === 'STAFF'
          ? 'faculty@centralhigh.edu'
          : newRole === 'PARENT_STUDENT'
          ? 'student@centralhigh.edu'
          : 'admin@centralhigh.edu',
    }));
    return true;
  };

  const requestElevatedAccess = (requiredCapability: Capability | string): boolean => {
    if (hasCapability(requiredCapability)) return true;
    setPendingCapability(requiredCapability);
    setIsElevatedAccessOpen(true);
    return false;
  };

  const logout = async () => {
    purgeSensitiveLocalStorageOnLogout();
    await auth.signOut();
    setAuthStatus('unauthenticated');
  };

  const capabilitiesSet = new Set(session.claims?.capabilities || []);

  return (
    <PermissionContext.Provider
      value={{
        session,
        authStatus,
        capabilities: capabilitiesSet,
        hasCapability,
        switchWorkspaceRole,
        requestElevatedAccess,
        logout,
        isElevatedAccessOpen,
        setIsElevatedAccessOpen,
        pendingCapability,
        setPendingCapability,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
