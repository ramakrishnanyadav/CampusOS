import { UserIdentity } from '../identity/UserIdentity';
import { DeviceManager } from './DeviceManager';

export interface ActiveSession {
  sessionId: string;
  identity: UserIdentity;
  accessToken: string;
  refreshToken: string;
  issuedAt: number;
  expiresAt: number;
  lastActiveAt: number;
  deviceId: string;
  isTrustedDevice: boolean;
}

const LOCAL_SESSION_KEY = 'campusos_active_session_v1';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes Idle Timeout
const SESSION_MAX_AGE_MS = 8 * 3600 * 1000; // 8 Hours Max Session

export class SessionManager {
  private static instance: SessionManager;
  private activeSession: ActiveSession | null = null;
  private idleTimer: any = null;
  private onSessionExpiredCallbacks: Set<() => void> = new Set();

  private constructor() {
    this.restoreSession();
    this.setupActivityListeners();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public createSession(identity: UserIdentity, accessToken: string, refreshToken: string): ActiveSession {
    const now = Date.now();
    const session: ActiveSession = {
      sessionId: `sess_${identity.uid}_${now}`,
      identity,
      accessToken,
      refreshToken,
      issuedAt: now,
      expiresAt: now + SESSION_MAX_AGE_MS,
      lastActiveAt: now,
      deviceId: DeviceManager.getDeviceFingerprint(),
      isTrustedDevice: true,
    };

    this.activeSession = session;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    }
    DeviceManager.recordLogin('SUCCESS', 5);
    this.resetIdleTimer();
    return session;
  }

  public getSession(): ActiveSession | null {
    if (!this.activeSession) return null;

    const now = Date.now();

    // Session Expiry Check
    if (now > this.activeSession.expiresAt) {
      this.terminateSession('Session expired (max age exceeded).');
      return null;
    }

    // Idle Timeout Check
    if (now - this.activeSession.lastActiveAt > IDLE_TIMEOUT_MS) {
      this.terminateSession('Session expired due to inactivity idle timeout.');
      return null;
    }

    return this.activeSession;
  }

  public touchActivity(): void {
    if (this.activeSession) {
      this.activeSession.lastActiveAt = Date.now();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(this.activeSession));
      }
      this.resetIdleTimer();
    }
  }

  public terminateSession(reason: string = 'User initiated logout.'): void {
    console.log(`[SessionManager] Terminating session: ${reason}`);
    this.activeSession = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }

    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.onSessionExpiredCallbacks.forEach((cb) => cb());
  }

  public terminateAllSessions(): void {
    this.terminateSession('Logged out everywhere.');
  }

  public onSessionExpired(callback: () => void): () => void {
    this.onSessionExpiredCallbacks.add(callback);
    return () => this.onSessionExpiredCallbacks.delete(callback);
  }

  private restoreSession(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const cached = localStorage.getItem(LOCAL_SESSION_KEY);
    if (cached) {
      try {
        const session: ActiveSession = JSON.parse(cached);
        if (Date.now() < session.expiresAt) {
          this.activeSession = session;
        } else {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
      } catch {}
    }
  }


  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => {
      window.addEventListener(evt, () => this.touchActivity(), { passive: true });
    });
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.activeSession) {
        this.terminateSession('Idle timeout triggered');
      }
    }, IDLE_TIMEOUT_MS);
  }
}
