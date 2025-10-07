# SecureVault - Password Manager

A secure password manager built with Next.js, TypeScript, and MongoDB.

## Features

- 🔒 Secure client-side encryption
- 🔑 Password generator with strength meter
- 🔍 Search and filter vault items
- 📱 Responsive design
- 🔄 Real-time updates
- 🚀 Fast and lightweight

## Prerequisites

- Node.js 16+ and npm
- MongoDB database (local or Atlas)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd securevault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the app in action.

## Security Notes

- All sensitive data is encrypted client-side before being sent to the server
- Master password is never stored or sent to the server
- Uses secure HTTP-only cookies for authentication
- Implements proper password hashing with bcrypt

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Encryption**: AES-256 via crypto-js

## License

MIT
