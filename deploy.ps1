# RepoDeploy Setup Script for Windows
Write-Host "🚀 Setting up RepoDeploy - Real Deployment Infrastructure" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI already installed (v$firebaseVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Check if user is logged in
try {
    firebase projects:list | Out-Null
    Write-Host "✅ Already logged in to Firebase" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Firebase..." -ForegroundColor Yellow
    firebase login
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

Write-Host ""
Write-Host "🔧 Setting up Firebase Functions..." -ForegroundColor Blue
Set-Location functions
npm install
npm run build
Set-Location ..

Write-Host ""
Write-Host "🌐 Deploying Firebase Functions..." -ForegroundColor Blue
firebase deploy --only functions

Write-Host ""
Write-Host "🏗️ Building Next.js app..." -ForegroundColor Blue
npm run build

Write-Host ""
Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Blue
firebase deploy --only hosting

Write-Host ""
Write-Host "✅ Setup complete! Your RepoDeploy is now live!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy env.example to .env.local" -ForegroundColor White
Write-Host "2. Add your Firebase configuration" -ForegroundColor White
Write-Host "3. Start development: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your app will be available at the Firebase Hosting URL shown above" -ForegroundColor Cyan
