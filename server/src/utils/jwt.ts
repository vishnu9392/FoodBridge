import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthUserPayload } from '../types';

export { AuthUserPayload };

export function generateToken(payload: AuthUserPayload): string {
  // Signs JWT token with configured secret, expires in 7 days
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): AuthUserPayload {
  return jwt.verify(token, config.jwtSecret) as AuthUserPayload;
}
