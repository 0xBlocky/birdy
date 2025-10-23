@echo off
echo 🚀 Setting up Birdy Trading App...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install
echo.

REM Build shared package first
echo 🔨 Building shared package...
cd shared
npm install
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build shared package. Check errors above.
    pause
    exit /b 1
)
cd ..
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install
cd ..
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..
echo.

REM Install mock publisher dependencies
echo 📦 Installing mock publisher dependencies...
cd scripts
npm install
cd ..
echo.

echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo 1. Start Redis: docker-compose up -d
echo 2. Start development: npm run dev
echo 3. Start mock data (new terminal): cd scripts ^&^& npm start
echo.
echo 📱 App will be available at:
echo    Frontend: http://localhost:3000
echo    Backend: ws://localhost:3001
echo    Redis Commander: http://localhost:8081
echo.
pause
