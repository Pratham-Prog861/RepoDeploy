# RepoDeploy - Real Deployment Infrastructure

A Vercel-like deployment platform built with Next.js and Firebase that actually deploys your GitHub repositories.

## 🚀 Features

- **Real Deployment**: Actually clones, builds, and deploys GitHub repositories
- **Live URLs**: Generates working live URLs for your deployed projects
- **Real-time Status**: Track deployment progress with live updates
- **Build Logs**: See detailed build process logs
- **Firebase Backend**: Scalable cloud functions and database

## 🛠️ Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Cloud Functions
5. Enable Hosting

### 2. Install Dependencies

```bash
npm install
cd functions && npm install
```

### 3. Firebase Configuration

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

4. Select:
   - Firestore
   - Functions
   - Hosting

### 4. Environment Variables

Copy `env.example` to `.env.local` and fill in your Firebase config:

```bash
cp env.example .env.local
```

Get your Firebase config from Project Settings > General > Your Apps > Web App.

### 5. Deploy Firebase Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### 6. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## 🔧 How It Works

1. **Repository Input**: User provides GitHub repository URL
2. **Firebase Function**: Cloud function clones the repository
3. **Build Process**: Installs dependencies and builds the project
4. **Deployment**: Creates deployment package and deploys to hosting
5. **Live URL**: Generates working URL for the deployed site

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/
│   │   ├── actions.ts      # Server actions
│   │   └── firebase.ts     # Firebase client config
├── functions/               # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts        # Deployment logic
├── firebase.json            # Firebase configuration
├── firestore.rules          # Database security rules
└── firestore.indexes.json   # Database indexes
```

## 🌐 Deployment Domains

By default, deployments use Firebase Hosting domains:
- `https://{deploymentId}.{projectId}.web.app`

To use custom domains:
1. Add your domain in Firebase Hosting
2. Set `NEXT_PUBLIC_DEPLOYMENT_DOMAIN` in environment variables

## 🚀 Usage

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:9002](http://localhost:9002)

3. Paste a GitHub repository URL and deploy!

## 🔒 Security

- Firestore rules ensure only authenticated users can create deployments
- Public read access for deployment status
- Input validation for GitHub URLs

## 📝 Notes

- This is a production-ready deployment infrastructure
- Supports Node.js projects with `package.json`
- Automatically handles build processes
- Real-time deployment status updates
- Working live URLs for deployed projects

## 🆘 Troubleshooting

- Ensure Firebase project is properly configured
- Check environment variables are set correctly
- Verify Firebase Functions are deployed
- Check Firestore rules and indexes

## 🚀 Next Steps

- Add user authentication
- Implement custom domains
- Add deployment analytics
- Support more build tools (Docker, etc.)
- Add team collaboration features
