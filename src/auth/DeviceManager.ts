export interface LoginHistoryRecord {
  id: string;
  timestamp: string;
  browser: string;
  device: string;
  ip: string;
  location: string;
  result: 'SUCCESS' | 'MFA_REQUIRED' | 'FAILED_PASSWORD' | 'SUSPICIOUS_BLOCK';
  riskScore: number; // 0 (Trusted) to 100 (High Risk)
}

const LOCAL_DEVICE_KEY = 'campusos_device_fingerprint';
const LOCAL_LOGIN_HISTORY_KEY = 'campusos_login_history';

export class DeviceManager {
  public static getDeviceFingerprint(): string {
    if (typeof localStorage === 'undefined' || typeof navigator === 'undefined') return 'dev_test_environment';
    let fp = localStorage.getItem(LOCAL_DEVICE_KEY);
    if (!fp) {
      fp = `dev_${(navigator.platform || 'node').replace(/\s+/g, '')}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem(LOCAL_DEVICE_KEY, fp);
    }
    return fp;
  }

  public static getLoginHistory(): LoginHistoryRecord[] {
    if (typeof localStorage === 'undefined') return [];
    const cached = localStorage.getItem(LOCAL_LOGIN_HISTORY_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    const initial: LoginHistoryRecord[] = [
      {
        id: 'lh-1',
        timestamp: new Date().toISOString(),
        browser: 'Chrome 122.0 (Windows 11)',
        device: 'Workstation Laptop',
        ip: '192.168.1.104',
        location: 'Navi Mumbai, IN',
        result: 'SUCCESS',
        riskScore: 5,
      },
      {
        id: 'lh-2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        browser: 'Safari Mobile (iOS 17.4)',
        device: 'iPhone 15 Pro',
        ip: '103.22.45.12',
        location: 'Mumbai, IN',
        result: 'SUCCESS',
        riskScore: 12,
      },
    ];
    localStorage.setItem(LOCAL_LOGIN_HISTORY_KEY, JSON.stringify(initial));
    return initial;
  }

  public static recordLogin(result: LoginHistoryRecord['result'], riskScore: number = 10): LoginHistoryRecord {
    const history = this.getLoginHistory();
    const isBrowser = typeof navigator !== 'undefined';
    const record: LoginHistoryRecord = {
      id: `lh-${Date.now()}`,
      timestamp: new Date().toISOString(),
      browser: isBrowser ? `${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'} (${navigator.platform})` : 'Node.js Test Runner',
      device: isBrowser && navigator.maxTouchPoints > 0 ? 'Mobile Device' : 'Desktop Workstation',
      ip: '192.168.1.104',
      location: 'Main Campus (Local Subnet)',
      result,
      riskScore,
    };
    if (typeof localStorage !== 'undefined') {
      history.unshift(record);
      localStorage.setItem(LOCAL_LOGIN_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    }
    return record;
  }
}

