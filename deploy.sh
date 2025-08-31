#!/bin/bash

echo "🚀 Setting up RepoDeploy - Real Deployment Infrastructure"
echo "=========================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI already installed"
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase..."
    firebase login
else
    echo "✅ Already logged in to Firebase"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up Firebase Functions..."
cd functions
npm install
npm run build
cd ..

echo ""
echo "🌐 Deploying Firebase Functions..."
firebase deploy --only functions

echo ""
echo "🏗️ Building Next.js app..."
npm run build

echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Setup complete! Your RepoDeploy is now live!"
echo ""
echo "📝 Next steps:"
echo "1. Copy env.example to .env.local"
echo "2. Add your Firebase configuration"
echo "3. Start development: npm run dev"
echo ""
echo "🌐 Your app will be available at the Firebase Hosting URL shown above"
