import { z } from 'zod';

/**
 * Strong password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)');

/**
 * Email validation with additional checks
 */
export const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .refine((email) => {
    // Block disposable email domains
    const disposableDomains = [
      'tempmail.com', 'throwaway.email', 'guerrillamail.com',
      'mailinator.com', '10minutemail.com', 'yopmail.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }, 'Please use a valid email address');

/**
 * Auth schema with strong validation
 */
export const authSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
});

/**
 * Simpler login schema (don't enforce password rules on login, just on signup)
 */
export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return false;
    }

    if (now > record.resetTime) {
      this.attempts.delete(key);
      return false;
    }

    return record.count >= this.maxAttempts;
  }

  recordAttempt(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    } else {
      record.count++;
    }
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return 0;
    const remaining = record.resetTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Global rate limiter instance for login attempts
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
