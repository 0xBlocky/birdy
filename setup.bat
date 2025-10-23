@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Birdy Trading App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Root dependencies installation had issues, continuing...
)

REM Build shared package first
echo 🔨 Building shared package...
cd shared
call npm install
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Shared package dependencies had issues, continuing...
)
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build shared package. Please check the errors above.
    pause
    exit /b 1
)
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Backend dependencies had issues, continuing...
)
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Frontend dependencies had issues, continuing...
)
cd ..

REM Install mock publisher dependencies
echo 📦 Installing mock publisher dependencies...
cd scripts
call npm install
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Mock publisher dependencies had issues, continuing...
)
cd ..

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