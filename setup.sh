#!/bin/bash

echo "🚀 Setting up Birdy Trading App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build shared package first
echo "🔨 Building shared package..."
cd shared
npm install
npm run build
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install mock publisher dependencies
echo "📦 Installing mock publisher dependencies..."
cd scripts
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start Redis: docker-compose up -d"
echo "2. Start development: npm run dev"
echo "3. Start mock data (new terminal): cd scripts && npm start"
echo ""
echo "📱 App will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: ws://localhost:3001"
echo "   Redis Commander: http://localhost:8081"
