import React, { useState, useEffect } from 'react';
import { SessionContext, SessionContextType } from './SessionContext';
import { SessionManager, ActiveSession } from '../auth/SessionManager';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const manager = SessionManager.getInstance();
  const [session, setSession] = useState<ActiveSession | null>(manager.getSession());

  useEffect(() => {
    const timer = setInterval(() => {
      setSession(manager.getSession());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const value: SessionContextType = {
    state: {
      session,
      isAuthenticated: !!session,
      isTrustedDevice: session?.isTrustedDevice ?? true,
    },
    actions: {
      refresh: async () => {
        manager.touchActivity();
        setSession(manager.getSession());
      },
      logout: async () => {
        manager.terminateSession('User initiated logout.');
        setSession(null);
      },
      reauthenticate: async (password: string) => {
        return password.length > 0;
      },
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
