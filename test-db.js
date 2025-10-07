const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found (hidden for security)' : 'Not found');
  
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables');
    console.log('Please add MONGODB_URI to your .env.local file');
    process.exit(1);
  }

  try {
    console.log('\nAttempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('\n✅ Successfully connected to MongoDB!');
    console.log('\nConnection details:');
    console.log('- Host:', conn.connection.host);
    console.log('- Database:', conn.connection.name);
    console.log('- Collections:', (await conn.connection.db.listCollections().toArray()).map(c => c.name).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed with error:');
    console.error('- Message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Code name:', error.codeName);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Suggestion: Connection was refused. Check if MongoDB is running and accessible.');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔍 Suggestion: Could not resolve the hostname. Check your internet connection.');
    } else if (error.code === 8000 || error.code === 18) {
      console.log('\n🔍 Suggestion: Authentication failed. Please check your username and password.');
    } else if (error.code === 13) {
      console.log('\n🔍 Suggestion: Unauthorized. Check if the database user has the correct permissions.');
    }
    
    process.exit(1);
  }
}

testConnection();
