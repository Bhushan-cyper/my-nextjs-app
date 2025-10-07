import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface AuthUser {
  userId: string;
  email: string;
}

export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & AuthUser;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch {

    return null;
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = verifyToken(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
