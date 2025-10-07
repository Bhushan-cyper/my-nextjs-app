import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const vaultItems = await VaultItem.find({ userId: user.userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      { data: vaultItems },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Vault fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const { encryptedData } = await request.json();

    if (!encryptedData) {
      return NextResponse.json(
        { message: 'Encrypted data is required' },
        { status: 400 }
      );
    }

    const vaultItem = await VaultItem.create({
      userId: user.userId,
      encryptedData,
    });

    return NextResponse.json(
      { 
        message: 'Vault item created successfully',
        data: vaultItem
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Vault creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
