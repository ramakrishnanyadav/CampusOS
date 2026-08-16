export interface PasswordPolicyResult {
  isValid: boolean;
  errors: string[];
  strengthScore: number; // 0 to 100
}

export class PasswordPolicy {
  public static validate(password: string): PasswordPolicyResult {
    const errors: string[] = [];
    let score = 0;

    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 15;
    else errors.push('Password must be at least 12 characters in length.');

    if (/[A-Z]/.test(password)) score += 20;
    else errors.push('Password must contain at least one uppercase letter (A-Z).');

    if (/[a-z]/.test(password)) score += 20;
    else errors.push('Password must contain at least one lowercase letter (a-z).');

    if (/[0-9]/.test(password)) score += 15;
    else errors.push('Password must contain at least one numeric digit (0-9).');

    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    else errors.push('Password must contain at least one special character (!@#$%^&*).');

    return {
      isValid: errors.length === 0,
      errors,
      strengthScore: Math.min(100, score),
    };
  }
}
