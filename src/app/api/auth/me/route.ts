import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { user: { id: user.userId, email: user.email } },
      { status: 200 }
    );
  } catch {

    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 401 }
    );
  }
}
