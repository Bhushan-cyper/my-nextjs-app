import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface AuthUser {
  userId: string;
  email: string;
}

function getTokenFromRequest(request: NextRequest | Request): string | null {
  // NextRequest has a cookies API; Web Request does not.
  // Detect by feature and extract token cookie accordingly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybeNextReq = request as any;
  if (maybeNextReq?.cookies?.get) {
    return maybeNextReq.cookies.get('token')?.value ?? null;
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...rest] = c.split('=');
      return [k.trim(), decodeURIComponent(rest.join('='))];
    })
  );
  return cookies['token'] ?? null;
}

export function verifyToken(request: NextRequest | Request): AuthUser | null {
  try {
    const token = getTokenFromRequest(request);
    
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

export function requireAuth(request: NextRequest | Request): AuthUser {
  const user = verifyToken(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
