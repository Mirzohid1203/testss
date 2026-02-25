# Deployment Guide: Online Test Platform

Follow these steps to deploy your application to production.

## 1. Firebase Preparation
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g., "Online Test Platform").
3. **Enable Authentication**:
   - Go to Build > Authentication.
   - Click "Get Started" and enable "Email/Password".
4. **Enable Firestore**:
   - Go to Build > Cloud Firestore.
   - Click "Create database" and choose a location.
   - Start in "Production mode".
5. **Apply Security Rules**:
   - Copy the contents of `firestore.rules` from this project.
   - Paste them into the "Rules" tab in the Firestore dashboard and click "Publish".

## 2. Environment Variables
Collect the following configuration from Firebase Project Settings (General > Your apps > Web app):
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId`

## 3. Vercel Deployment
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click "Add New" > "Project".
3. Import your repository.
4. **Configure Environment Variables**:
   Add all variables from your `.env.local` to the Vercel project settings:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - ... and so on.
   - `NEXT_PUBLIC_ADMIN_EMAIL` (Set this to the email you want to have admin privileges).
5. Click **Deploy**.

## 4. Post-Deployment
1. Register an account with the email you specified in `NEXT_PUBLIC_ADMIN_EMAIL`.
2. This user will automatically have access to the `/admin` portal.
3. Start adding subjects and tests!

## 5. (Optional) Analytics
Firebase Analytics is already integrated. It will start collecting data once the app is live on a public domain.
