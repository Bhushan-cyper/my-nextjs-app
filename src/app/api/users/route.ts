import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email } = await request.json();
    
    const user = await User.create({ name, email });
    
    return NextResponse.json(
      { message: 'User created successfully', data: user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating user', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    
    return NextResponse.json(
      { data: users },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching users', error: error.message },
      { status: 500 }
    );
  }
}
