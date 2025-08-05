@echo off
setlocal enabledelayedexpansion

REM 🚀 GitHub Repository Setup Script for Windows
REM Real-time Order Management System

echo 🎯 Real-time Order Management System - GitHub Setup
echo ==================================================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Step 1: Initialize Git Repository
echo 📋 Step 1: Initialize Git Repository
if not exist ".git" (
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Step 2: Check for GitHub remote
echo 📋 Step 2: Check for GitHub remote
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  No GitHub remote configured
    set /p REPO_URL="Enter your GitHub repository URL: "
    git remote add origin "!REPO_URL!"
    echo ✅ GitHub remote added: !REPO_URL!
) else (
    for /f "tokens=*" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
    echo ✅ GitHub remote already configured: !REMOTE_URL!
)

REM Step 3: Install Dependencies
echo 📋 Step 3: Install Dependencies

if exist "order-service\package.json" (
    echo Installing backend dependencies...
    cd order-service
    call npm install
    if !errorlevel! == 0 (
        echo ✅ Backend dependencies installed
    ) else (
        echo ⚠️  Backend dependency installation failed
    )
    cd ..
)

if exist "order-ui\package.json" (
    echo Installing frontend dependencies...
    cd order-ui
    call npm install
    if !errorlevel! == 0 (
        echo ✅ Frontend dependencies installed
    ) else (
        echo ⚠️  Frontend dependency installation failed
    )
    cd ..
)

REM Step 4: Build Project
echo 📋 Step 4: Build Project

if exist "order-service\package.json" (
    cd order-service
    call npm run build >nul 2>&1
    if !errorlevel! == 0 (
        echo ✅ Backend built successfully
    ) else (
        echo ⚠️  Backend build failed or not configured
    )
    cd ..
)

if exist "order-ui\package.json" (
    cd order-ui
    call npm run build >nul 2>&1
    if !errorlevel! == 0 (
        echo ✅ Frontend built successfully
    ) else (
        echo ⚠️  Frontend build failed or not configured
    )
    cd ..
)

REM Step 5: Commit and Push
echo 📋 Step 5: Commit and Push to GitHub

git add .
git diff --staged --quiet
if !errorlevel! == 0 (
    echo ⚠️  No changes to commit
) else (
    for /f "tokens=2 delims= " %%i in ('date /t') do set DATE=%%i
    for /f "tokens=1 delims= " %%i in ('time /t') do set TIME=%%i
    git commit -m "🚀 Deploy: Real-time Order Management System - !DATE! !TIME!"
    echo ✅ Changes committed
    
    git push -u origin main
    if !errorlevel! == 0 (
        echo ✅ Code pushed to GitHub successfully!
    ) else (
        echo ❌ Failed to push to GitHub
    )
)

REM Step 6: Show GitHub Secrets Configuration
echo.
echo 📋 Step 6: GitHub Secrets Configuration
echo ========================================
echo 🔐 IMPORTANT: Configure these GitHub Secrets
echo Go to: GitHub Repository → Settings → Secrets and variables → Actions
echo.
echo Required Secrets:
echo ├── AWS_ACCESS_KEY_ID
echo ├── AWS_SECRET_ACCESS_KEY  
echo ├── AWS_REGION (e.g., us-east-1)
echo ├── DYNAMODB_TABLE_NAME (e.g., orders)
echo ├── S3_BUCKET_NAME (e.g., order-management-invoices-unique)
echo └── SNS_TOPIC_ARN (optional)
echo.

REM AWS Configuration Check
echo 📋 Step 7: AWS Configuration Check
aws sts get-caller-identity >nul 2>&1
if !errorlevel! == 0 (
    echo ✅ AWS credentials configured
    aws sts get-caller-identity --query Account --output text 2>nul
) else (
    echo ⚠️  AWS credentials not configured
    echo Please run: aws configure
)

echo.
echo ✅ Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Configure GitHub Secrets (see above)
echo 2. Push changes to trigger deployment  
echo 3. Monitor GitHub Actions for deployment status
echo 4. Access your application once deployed
echo.
echo Happy coding! 🚀
echo.
pause
