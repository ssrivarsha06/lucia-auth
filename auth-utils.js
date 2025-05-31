// auth-utils.js
import crypto from 'crypto';

export function generate2FACode() {
  return {
    code: crypto.randomInt(100_000, 999_999).toString(), // 6-digit code
    expiresAt: Date.now() + 300_000, // 5 minutes expiry
  };
}
