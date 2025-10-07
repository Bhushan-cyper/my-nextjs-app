const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = `# MongoDB connection string (replace with your MongoDB URI)
MONGODB_URI=mongodb://localhost:27017/securevault

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# NextAuth.js Secret (generate a secure random string)
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this

# NextAuth.js URL (update if your app is hosted elsewhere)
NEXTAUTH_URL=http://localhost:3000
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('Created .env.local file with default values. Please update the values as needed.');
} else {
  console.log('.env.local already exists. No changes were made.');
}
