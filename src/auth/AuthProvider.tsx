import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserIdentity } from '../identity/UserIdentity';
import { EnterpriseCapability, PolicyEngine } from '../authorization/PolicyEngine';
import { CapabilityResolver } from '../authorization/CapabilityResolver';
import { SessionManager, ActiveSession } from './SessionManager';
import { AuthService } from './AuthService';

export type AuthStage =
  | 'SPLASH'
  | 'SIGN_IN'
  | 'AUTHENTICATING'
  | 'LOADING_ORGANIZATION'
  | 'LOADING_PERMISSIONS'
  | 'PREPARING_WORKSPACE'
  | 'AUTHENTICATED';

interface AuthContextType {
  stage: AuthStage;
  identity: UserIdentity | null;
  capabilities: Set<EnterpriseCapability>;
  hasCapability: (cap: EnterpriseCapability) => boolean;
  login: (email: string, pass: string, targetType?: UserIdentity['userType']) => Promise<void>;
  logout: () => Promise<void>;
  switchIdentityType: (type: UserIdentity['userType']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<AuthStage>('SPLASH');
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [capabilities, setCapabilities] = useState<Set<EnterpriseCapability>>(new Set());

  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    // Initial session restoration with smooth enterprise transition
    const active = sessionManager.getSession();
    if (active) {
      runAuthSequence(active.identity);
    } else {
      setStage('SIGN_IN');
    }

    const unsub = sessionManager.onSessionExpired(() => {
      setIdentity(null);
      setCapabilities(new Set());
      setStage('SIGN_IN');
    });

    return () => unsub();
  }, []);

  const runAuthSequence = async (targetIdentity: UserIdentity) => {
    setStage('AUTHENTICATING');
    await new Promise((r) => setTimeout(r, 200));

    setStage('LOADING_ORGANIZATION');
    await new Promise((r) => setTimeout(r, 200));

    setStage('LOADING_PERMISSIONS');
    const caps = CapabilityResolver.resolveCapabilities(targetIdentity);
    setCapabilities(caps);
    setIdentity(targetIdentity);
    await new Promise((r) => setTimeout(r, 200));

    setStage('PREPARING_WORKSPACE');
    await new Promise((r) => setTimeout(r, 200));

    setStage('AUTHENTICATED');
  };

  const login = async (email: string, pass: string, targetType?: UserIdentity['userType']) => {
    setStage('AUTHENTICATING');
    const resolvedIdentity = await AuthService.authenticate(email, pass, targetType);
    await runAuthSequence(resolvedIdentity);
  };

  const switchIdentityType = async (type: UserIdentity['userType']) => {
    await login('user@centralhigh.edu', 'pass123', type);
  };

  const logout = async () => {
    await AuthService.logout();
    setIdentity(null);
    setCapabilities(new Set());
    setStage('SIGN_IN');
  };

  const hasCapability = (cap: EnterpriseCapability): boolean => {
    if (!identity) return false;
    return PolicyEngine.evaluate({
      identity,
      resource: { type: 'SYSTEM', organizationId: identity.organizationId },
      action: cap,
    }).allowed;
  };

  return (
    <AuthContext.Provider
      value={{
        stage,
        identity,
        capabilities,
        hasCapability,
        login,
        logout,
        switchIdentityType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
