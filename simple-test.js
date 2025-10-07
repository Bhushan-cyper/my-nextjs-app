const { MongoClient } = require('mongodb');

// Using the provided connection string with the correct credentials
const uri = 'mongodb+srv://secure:Bhushan26@securevault.gslzxpv.mongodb.net/securevault?retryWrites=true&w=majority&appName=SecureVault';

console.log('Testing MongoDB connection...');
console.log('Connection string:', uri.replace(/:([^:]+)@/, ':***@'));

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    console.log('\nAttempting to connect to MongoDB...');
    await client.connect();
    
    console.log('✅ Successfully connected!');
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log('\nDatabase info:');
    console.log('- Database name:', db.databaseName);
    console.log('- Collections:', collections.map(c => c.name).join(', '));
    
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('- Error:', error.message);
    console.error('- Code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔍 Cannot resolve the hostname. Check your internet connection.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Connection refused. Check if the server is running and accessible.');
    } else if (error.message.includes('bad auth')) {
      console.log('\n🔍 Authentication failed. Please check your username and password.');
    }
    
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

testConnection();
