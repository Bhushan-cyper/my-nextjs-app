import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    const vaultItem = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      { encryptedData },
      { new: true }
    );

    if (!vaultItem) {
      return NextResponse.json(
        { message: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Vault item updated successfully',
        data: vaultItem
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Vault update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = requireAuth(request);
    await connectDB();

    const vaultItem = await VaultItem.findOneAndDelete({
      _id: params.id,
      userId: user.userId,
    });

    if (!vaultItem) {
      return NextResponse.json(
        { message: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Vault item deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Vault deletion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
