import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Helper to mask sensitive information in connection strings
function maskConnectionString(uri: string): string {
  if (!uri) return 'Not provided';
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.hostname}${url.pathname}?***`;
  } catch {
    return 'Invalid connection string';
  }
}

export async function GET() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const connectionInfo = {
    env: {
      MONGODB_URI: MONGODB_URI ? maskConnectionString(MONGODB_URI) : 'Not found in .env.local',
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    status: 'testing',
    error: null as any
  };

  if (!MONGODB_URI) {
    return NextResponse.json(
      {
        ...connectionInfo,
        status: 'error',
        error: {
          message: 'MONGODB_URI is not defined in environment variables',
          suggestion: 'Please add MONGODB_URI to your .env.local file'
        }
      },
      { status: 500 }
    );
  }

  try {
    // Test connection with a simple ping
    const connection = await mongoose.createConnection(MONGODB_URI);
    
    try {
      await connection.db.admin().ping();
      
      // Get database info
      const dbInfo = {
        dbName: connection.db.databaseName,
        collections: await connection.db.listCollections().toArray(),
        serverInfo: await connection.db.admin().serverInfo()
      };

      return NextResponse.json({
        ...connectionInfo,
        status: 'success',
        message: 'Successfully connected to MongoDB!',
        connection: {
          host: connection.host,
          port: connection.port,
          name: connection.name,
          dbInfo
        }
      });
    } finally {
      await connection.close();
    }
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    
    // Enhanced error information
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      ...(error.errorResponse && { mongoError: error.errorResponse }),
      connectionString: maskConnectionString(MONGODB_URI)
    };

    let suggestion = 'Please check your MongoDB Atlas connection settings.';
    
    if (error.code === 'ECONNREFUSED') {
      suggestion = 'Connection refused. Check if MongoDB is running and accessible.';
    } else if (error.code === 'ENOTFOUND') {
      suggestion = 'Could not resolve the hostname. Check your internet connection and DNS settings.';
    } else if (error.code === 8000) { // MongoDB Atlas auth error
      suggestion = 'Authentication failed. Please verify your username and password in the connection string.';
    } else if (error.code === 13) { // Unauthorized
      suggestion = 'Authentication failed. Check your username and password, and ensure the database user has the correct permissions.';
    }

    return NextResponse.json(
      {
        ...connectionInfo,
        status: 'error',
        error: errorInfo,
        suggestion,
        troubleshooting: [
          '1. Verify your MongoDB Atlas connection string',
          '2. Check if your IP is whitelisted in MongoDB Atlas',
          '3. Verify your database user has the correct permissions',
          '4. Check if your MongoDB Atlas cluster is running',
          '5. Try connecting with MongoDB Compass using the same connection string'
        ]
      },
      { status: 500 }
    );
  }
}
