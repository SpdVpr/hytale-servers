---
description: How to set up Firebase for the Hytale Servers project
---

# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `hytale-servers` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Choose your preferred region (e.g., `europe-west1` for EU)
5. Click "Enable"

## 3. Set Firestore Security Rules

Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Servers - public read, authenticated write
    match /servers/{serverId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         request.auth.token.admin == true);
    }
    
    // Votes - public read, rate-limited write
    match /votes/{voteId} {
      allow read: if true;
      allow create: if true; // Rate limiting handled in code
    }
    
    // Users - private
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Enable Authentication

1. Go to "Build" > "Authentication"
2. Click "Get started"
3. Enable sign-in providers:
   - Email/Password
   - Google (recommended)

## 5. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register app name: `hytale-servers-web`
5. Copy the configuration object

## 6. Create Environment File

// turbo
Create `.env.local` file in project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

## 7. Add Firebase Configuration

Edit `.env.local` and fill in your values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 8. Generate Service Account Key (for Admin SDK)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content as a single line
5. Add to `.env.local`:

```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

## 9. Test the Connection

// turbo
Restart the development server:

```bash
npm run dev
```

## 10. Verify in Browser

1. Open http://localhost:3000/login
2. Try signing in with Google
3. Check Firebase Console > Authentication > Users

## Firestore Collections Structure

```
servers/
  {serverId}/
    name: string
    ip: string
    port: number
    description: string
    category: string
    votes: number
    isOnline: boolean
    ...

votes/
  {serverId}_{visitorId}/
    serverId: string
    visitorId: string
    votedAt: timestamp

users/
  {userId}/
    email: string
    displayName: string
    servers: array<string>
    createdAt: timestamp
```

## Troubleshooting

### "Firebase not configured" error
- Ensure `.env.local` file exists with correct values
- Restart the dev server after adding environment variables

### Authentication not working
- Check that Email/Password or Google provider is enabled
- Verify the auth domain matches your Firebase config

### Firestore permission denied
- Check security rules are deployed
- Verify user is authenticated for protected operations
