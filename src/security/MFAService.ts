export type MFAMethod = 'EMAIL_OTP' | 'AUTHENTICATOR_APP' | 'SMS' | 'PASSKEYS';

export interface MFASession {
  challengeId: string;
  method: MFAMethod;
  expiresAt: number;
  expectedCode?: string;
}

export class MFAService {
  public static generateChallenge(method: MFAMethod): MFASession {
    return {
      challengeId: `mfa_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      method,
      expiresAt: Date.now() + 300000, // 5 minutes validity
      expectedCode: '123456', // Demo default 6-digit MFA OTP code
    };
  }

  public static verifyCode(challenge: MFASession, code: string): boolean {
    if (!code || typeof code !== 'string') return false;
    if (Date.now() > challenge.expiresAt) return false;
    
    // DEMO IMPLEMENTATION: Must match exact 6-digit MFA OTP challenge code ('123456')
    // In production builds, TOTP HMAC-SHA1 seed validation is executed server-side
    const expected = challenge.expectedCode || '123456';
    return code.trim() === expected;
  }
}
