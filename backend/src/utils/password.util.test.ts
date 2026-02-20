import { describe, it, expect } from '@jest/globals';
import { hashPassword, comparePassword } from '../utils/password.util';

describe('Password Utility', () => {
  it('should hash password correctly', async () => {
    const password = 'TestPassword123!';
    const hashed = await hashPassword(password);
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);
  });

  it('should compare passwords correctly', async () => {
    const password = 'TestPassword123!';
    const hashed = await hashPassword(password);
    const isMatch = await comparePassword(password, hashed);
    expect(isMatch).toBe(true);
  });

  it('should reject wrong password', async () => {
    const password = 'TestPassword123!';
    const hashed = await hashPassword(password);
    const isMatch = await comparePassword('WrongPassword', hashed);
    expect(isMatch).toBe(false);
  });
});