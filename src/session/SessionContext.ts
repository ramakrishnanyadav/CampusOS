import { createContext, useContext } from 'react';
import { ActiveSession } from '../auth/SessionManager';

export interface ReadonlySessionState {
  readonly session: ActiveSession | null;
  readonly isAuthenticated: boolean;
  readonly isTrustedDevice: boolean;
}

export interface SessionActions {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  reauthenticate: (password: string) => Promise<boolean>;
}

export interface SessionContextType {
  state: ReadonlySessionState;
  actions: SessionActions;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
};
