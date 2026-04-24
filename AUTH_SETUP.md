# WanderPack – Firebase Authentication Setup Guide

## ✅ What's Been Implemented

Your WanderPack app now has **full Firebase authentication** with the following features:

### Core Features
- ✅ **Email/Password Registration** - Users can create accounts with name, email, password, and role selection
- ✅ **Email/Password Login** - Existing users can log in securely
- ✅ **Google OAuth** - Sign in with Google (requires Firebase Console setup)
- ✅ **Password Reset** - Users can request password reset emails
- ✅ **Session Persistence** - Users stay logged in across browser sessions
- ✅ **Auth Guards** - All pages (except landing and auth) require login
- ✅ **Role-Based Users** - Support for "Traveler" and "Trip Organizer" roles

### Files Modified/Created

1. **firebase.js** - Enhanced with:
   - Proper initialization with all required modules
   - Helper functions: `registerUser()`, `loginUser()`, `logoutUser()`, `resetPassword()`, `getCurrentUser()`, `onAuthChange()`
   - Session persistence enabled automatically
   - Exported all necessary Firebase functions and modules

2. **auth.html** - Complete authentication page with:
   - Login tab with email/password form
   - Registration tab with name, email, password, role selector
   - Error/success message display
   - Google login button (ready to use)
   - Password reset functionality
   - Input validation

3. **auth-guard.js** - Helper module for protecting pages:
   - `setupAuthGuard()` - Automatic page protection
   - `getUser()` - Get current user
   - `isAuthenticated()` - Check login status
   - `getFirstName()` - Extract first name
   - `getInitials()` - Get user initials for avatars

4. **dashboard.html** - Updated with:
   - Auth state checking (redirects to auth.html if not logged in)
   - User name and avatar display
   - Trip management (create, view, filter)
   - Stats calculation

5. **index.html** - New landing page with:
   - Feature showcase
   - Call-to-action buttons
   - Professional design matching the app theme

## 🚀 Quick Start

### 1. **Test Email/Password Authentication**

```javascript
// Registration Flow (happens in auth.html)
// User fills form and clicks "Create Account 🎒"
// Backend: Creates Firebase user + Firestore document

// Login Flow (happens in auth.html)
// User fills email and password, clicks "Log In 🚀"
// Backend: Authenticates and redirects to dashboard
```

### 2. **Enable Google OAuth (Optional)**

To enable Google sign-in:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your "wanderpack" project
3. Go to Authentication → Sign-in method → Google
4. Enable it
5. Add authorized domains (your domain or localhost)
6. Google login button will now work!

### 3. **Test All Features**

#### Sign Up:
```
1. Open http://localhost/WanderPack/auth.html (or your domain)
2. Click "Sign Up" tab
3. Enter: Name, Email, Password
4. Select role: "Traveler" or "Trip Organizer"
5. Click "Create Account 🎒"
6. Should redirect to dashboard.html
```

#### Log In:
```
1. Open http://localhost/WanderPack/auth.html
2. Enter registered email and password
3. Click "Log In 🚀"
4. Should redirect to dashboard.html
```

#### Password Reset:
```
1. On login page, click in email field
2. Run: window.doForgotPassword()
3. Check email for reset link
```

#### Logout:
```
1. On any authenticated page, click "Log Out"
2. Should redirect to auth.html
```

## 📚 Architecture Overview

```
┌─────────────────────────────────────────┐
│         Browser / Frontend              │
├─────────────────────────────────────────┤
│ index.html (landing)                    │
│ auth.html (login/signup)                │
│ dashboard.html (main app - protected)   │
│ profile.html (user profile - protected) │
│ trip.html (trip detail - protected)     │
│ explore.html (feed - protected)         │
│ admin.html (admin panel - protected)    │
└──────────────┬──────────────────────────┘
               │ (imports)
┌──────────────▼──────────────────────────┐
│      firebase.js (Firebase SDK)         │
│  - Authentication (Email, Google, etc)  │
│  - Firestore (User documents)           │
│  - Storage (Profile pictures, etc)      │
│  - Session persistence                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Firebase Backend (wanderpack)         │
│  - Authentication service               │
│  - Firestore database                   │
│  - Cloud Storage                        │
│  - Google Identity service              │
└─────────────────────────────────────────┘
```

## 🔐 Security Features

1. **Session Persistence**: Users automatically stay logged in
2. **Auth Guards**: Unauthenticated users redirected to login
3. **Firestore Rules** (Configure in Firebase Console):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       
       // Trips: Can read if member, write if admin
       match /trips/{tripId} {
         allow read: if request.auth.uid in resource.data.members;
         allow write: if request.auth.uid == resource.data.adminId;
       }
     }
   }
   ```

## 📁 File Structure

```
WanderPack/
├── firebase.js              ← Firebase config & functions
├── auth-guard.js            ← Auth protection utilities
├── shared.css               ← Shared styles
├── index.html               ← Landing page
├── auth.html                ← Login/Signup page
├── dashboard.html           ← Main app (protected)
├── profile.html             ← User profile (protected)
├── trip.html                ← Trip details (protected)
├── explore.html             ← Social feed (protected)
├── admin.html               ← Admin panel (protected)
└── README.md                ← Project documentation
```

## 🔧 Configuration & Customization

### Change Firebase Project
Edit `firebase.js` - replace the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

### Add More Authentication Methods
Extend `firebase.js` to support:
- Facebook login
- GitHub login
- Phone number authentication
- SAML/Enterprise SSO

### Customize User Profile Fields
Edit `registerUser()` in `firebase.js` to add custom fields:

```javascript
await setDoc(doc(db, 'users', user.uid), {
  // Existing fields...
  customField: value,  // Add here
});
```

## 🐛 Troubleshooting

### "User not found" error
- Make sure user account exists in Firebase
- Check email spelling
- Clear browser cache and cookies

### "Too many requests" error
- User tried logging in too many times
- Wait 30 minutes or use password reset link

### Google login shows error
- Google OAuth not enabled in Firebase Console
- Authorized domain not whitelisted
- Check browser console for specific error

### Session not persisting
- Browser localStorage disabled
- Incognito/Private browsing mode
- Clear browser cache

### Can't access protected pages
- Not authenticated - go to auth.html first
- Session expired - log in again
- Browser cookies disabled

## 📊 User Data Structure (Firestore)

```javascript
// Collection: users/{userId}
{
  uid: "firebase-user-id",
  name: "John Doe",
  email: "john@example.com",
  avatar: "url-to-profile-pic",
  bio: "Adventure seeker",
  role: "traveler",  // or "admin"
  status: "active",  // or "pending" for admins
  trips: ["trip-id-1", "trip-id-2"],
  createdAt: Timestamp
}

// Collection: trips/{tripId}
{
  name: "Summer in Greece",
  destination: "Athens, Greece",
  startDate: "2024-07-01",
  endDate: "2024-07-15",
  status: "planning",  // planning, confirmed, completed
  progress: 45,
  vibe: "🏖️",
  members: ["user-id-1", "user-id-2"],
  adminId: "user-id-1",
  itinerary: [...],
  createdAt: Timestamp
}
```

## ✨ Next Steps

1. **Test the authentication flow** - Create accounts, log in, log out
2. **Enable Google OAuth** - Follow setup in Firebase Console
3. **Customize user profiles** - Add additional fields as needed
4. **Set up Firestore Rules** - Secure your database
5. **Deploy** - Host on Firebase Hosting or your own server

## 📞 Support

For Firebase documentation and help:
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com)

---

**Your WanderPack app is now fully authenticated and ready to use! 🚀✈️**
