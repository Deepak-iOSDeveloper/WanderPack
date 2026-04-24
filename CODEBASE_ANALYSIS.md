# WanderPack Codebase Analysis

**Last Updated:** April 2026  
**Current Version:** 2.0.0 (Frontend), 1.0.0 (Backend)

---

## 1. Overall Architecture

**WanderPack** is a dual-layer travel planning and booking application with a modern, decoupled architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Frontend                        │
│               (Vite + React 18 + TypeScript + Router v6)         │
├─────────────────────────────────────────────────────────────────┤
│  Landing Page → Auth → Dashboard → Multiple Feature Pages       │
│  (Trips, Bookings, Posts, Services, Admin, etc.)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
                    ┌─────────────────────┐
                    │  Vite Dev Server    │
                    │  Proxy: /api/* →    │
                    │  http://127.0.0.1   │
                    │       :5000         │
                    └─────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    Backend / Express Server                      │
│            (Express.js + MongoDB + Mongoose on Node.js)          │
├─────────────────────────────────────────────────────────────────┤
│  Health Check → Users Routes → Trips Routes                     │
│  Connected to MongoDB for persistent data storage               │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│         Real-time Services (Firebase Backend)                    │
│  ✓ Authentication (Email, Password, Google OAuth)               │
│  ✓ Firestore (Real-time database for app state)                 │
│  ✓ Cloud Storage (User avatars, trip images)                    │
└─────────────────────────────────────────────────────────────────┘
```

**Architecture Type:** Hybrid - Full-stack JavaScript with:
- **Frontend:** Client-side React SPA with real-time Firebase integration
- **Backend:** Node.js/Express REST API with MongoDB persistence
- **Migration Path:** Gradual transition from Firebase to MongoDB as the source of truth

---

## 2. Tech Stack

### Frontend Technologies
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | (ES Module) | JavaScript runtime |
| **Framework** | React | 18.3.1 | UI components and state management |
| **Router** | React Router DOM | 6.28.0 | Client-side routing |
| **Build Tool** | Vite | 5.4.10 | Fast bundler and dev server |
| **Language** | TypeScript | 5.6.3 | Type-safe JavaScript |
| **Build Plugin** | @vitejs/plugin-react | 4.3.3 | JSX support for Vite |
| **Backend SDK** | Firebase | 10.12.0 | Auth, Firestore, Storage |
| **CSS** | Vanilla CSS + CSS Modules | (custom) | Styling with modern CSS |

### Backend Technologies
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | (ES Module) | JavaScript runtime |
| **Framework** | Express.js | 4.21.2 | REST API server |
| **Database** | MongoDB | (via Mongoose 8.8.1) | NoSQL document store |
| **ODM** | Mongoose | 8.8.1 | MongoDB object modeling |
| **CORS** | cors | 2.8.5 | Cross-origin request handling |
| **Environment** | dotenv | 16.4.5 | Environment variable management |
| **Dev Tool** | nodemon | 3.1.7 | Auto-reload on file changes |

### Configuration Files
- `vite.config.ts` - Vite configuration with proxy to backend API
- `tsconfig.json` - TypeScript compiler options (ES2020 target)
- `firebase.json` - Firebase Firestore rules deployment config

---

## 3. Frontend Structure

### Entry Point
**File:** `src/main.tsx`
- Creates React root with `ReactDOM.createRoot()`
- Wraps app with provider hierarchy:
  1. `Router` (BrowserRouter or HashRouter based on protocol)
  2. `ToastProvider` - Global toast notifications
  3. `AuthProvider` - Authentication state
  4. `AppDataProvider` - Application data state
  5. Main `App` component

### Main App Component
**File:** `src/App.tsx`
- Defines all routes using React Router v6
- Uses code-splitting with `lazy()` and `Suspense`
- Implements `ProtectedRoute` wrapper for auth-required pages
- Admin-only route protection available

### Pages (src/pages/)
**20 page components implementing different features:**

| Page | Route | Protected | Purpose |
|------|-------|-----------|---------|
| LandingPage | `/` | ❌ | Marketing/onboarding homepage |
| AuthPage | `/auth` | ❌ | Login/registration form |
| AdminAuthPage | `/admin-auth` | ❌ | Admin-specific authentication |
| DashboardPage | `/dashboard` | ✅ | Main app hub - trip overview, stats |
| TripPage | `/trip` or `/trips/:id` | ✅ | Trip detail, itinerary, budget, members |
| ExplorePage | `/explore` | ✅ | Travel feed with posts and stories |
| CreatePostPage | `/posts/create` | ✅ | Create travel updates/posts |
| ProfilePage | `/profile` or `/profile/:uid` | ✅ | User profile and stats |
| BookingsPage | `/bookings` | ✅ | View user bookings |
| BookingVaultPage | `/booking-vault` | ✅ | Saved booking package details |
| WishlistPage | `/wishlist` | ✅ | Saved destinations and items |
| OffersPage | `/offers` | ✅ | Travel deals and promotions |
| IndiaProductPage | `/india/:product` | ✅ | India-specific products (flights, hotels, etc.) |
| ServiceRequestPage | `/services/:service` | ✅ | Request services (visa, insurance, forex) |
| NotificationsPage | `/notifications` | ✅ | User notifications |
| SettingsPage | `/settings` | ✅ | User preferences and theme |
| SupportPage | `/support` | ✅ | Customer support/ticketing |
| AssistantPage | `/assistant` | ✅ | FAQ/travel help assistant |
| AdminPage | `/admin` | ✅ (admin) | Admin control room |
| AdminProfilePage | `/admin/profile` | ✅ (admin) | Admin profile |

### Components (src/components/)
**4 core reusable components:**

1. **AppShell** (`AppShell.tsx`)
   - Layout wrapper with sidebar navigation
   - User profile section with avatar
   - Theme toggle (light/dark mode)
   - Navigation menu items based on user role
   - Unread notification counter
   - Logout functionality
   - Two modes: "traveler" (default) and "admin"

2. **ProtectedRoute** (`ProtectedRoute.tsx`)
   - Route guard component
   - Checks authentication state
   - Supports admin-only routes
   - Redirects unauthenticated users to /auth or /admin-auth

3. **Toast** (`Toast.tsx`)
   - Global notification display
   - 2.8-second auto-dismiss
   - Non-intrusive UI notifications

4. **Navigation** (implicit in AppShell)
   - Global navigation rail with links to all features
   - India travel product shortcuts (flights, hotels, trains, buses, etc.)

### Contexts (src/contexts/)
**3 context providers managing global state:**

1. **AuthContext** (`AuthContext.tsx`)
   - **Manages:** User authentication state
   - **State:**
     - `user` - Current Firebase user (uid, email, displayName, photoURL)
     - `profile` - Extended user profile from Firestore (role, bio, location, etc.)
     - `loading` - Auth initialization loading state
   - **Methods:**
     - `login(email, password, role)` - Email/password login
     - `register(email, password, name, role)` - User registration
     - `loginWithGoogleProvider(role)` - Google OAuth login
     - `logout()` - Sign out
     - `sendReset(email)` - Password reset
     - `refreshProfile()` - Reload user profile from Firestore
   - **Flow:** Listens to Firebase auth changes, loads user profile on auth state change

2. **AppDataContext** (`AppDataContext.tsx`)
   - **Manages:** All application data (trips, posts, bookings, notifications, etc.)
   - **State Structure:**
     ```typescript
     {
       theme: "light" | "dark",
       trips: Trip[],
       posts: Post[],
       users: UserProfile[],
       bookings: BookingItem[],
       wishlist: WishlistItem[],
       notifications: NotificationItem[],
       supportTickets: SupportTicket[],
       activityLog: ActivityLogItem[],
       followedUserIds: string[],
       bookmarkedDestinationIds: string[]
     }
     ```
   - **Key Methods:**
     - Trip operations: `createTrip()`, `updateTrip()`, `deleteTrip()`, `duplicateTrip()`
     - Itinerary: `addDay()`, `addActivity()`, `moveActivity()`, `removeActivity()`, `voteActivity()`
     - Budget: `addExpense()`, `removeExpense()`
     - Members: `inviteMember()`, `updateMemberRole()`, `removeMember()`
     - Posts: `createPost()`, `toggleLikePost()`, `toggleBookmarkPost()`, `addPostComment()`
     - Bookings: `createBooking()`, `updateBookingStatus()`, `cancelBooking()`, `deleteBooking()`
     - Services: `createServiceRequest()`, `updateUserStatus()`
     - Support: `createSupportTicket()`, `sendBroadcast()`, `markNotificationsRead()`
     - User: `updateCurrentUserProfileState()`, `toggleFollow()`, `toggleDestinationBookmark()`
   - **Data Source:** Firestore with real-time listeners
   - **Persistence:** Stores user preferences in localStorage

3. **ToastContext** (`ToastContext.tsx`)
   - **Manages:** Global toast notification messages
   - **State:**
     - `message` - Current toast message
   - **Methods:**
     - `showToast(message)` - Display toast for 2.8 seconds
     - `clearToast()` - Hide toast immediately
   - **Simple pub/sub pattern** for notifications

### Utility Libraries (src/lib/)

1. **firebase.ts** (290+ lines)
   - Firebase SDK initialization with config from env vars
   - Authentication functions:
     - `registerUser()` - Create account with email/password
     - `loginUser()` - Login with email/password
     - `loginWithGoogle()` - Google OAuth (popup with fallback to redirect)
     - `completeGoogleRedirect()` - Handle OAuth redirect
     - `logoutUser()` - Sign out
     - `resetPassword()` - Send password reset email
   - User profile management:
     - `getUserProfile()` - Fetch user doc from Firestore
     - `ensureUserProfile()` - Create or merge user profile
     - Handles role-based profile creation (traveler/admin)
   - Firestore exports: `addDoc`, `collection`, `deleteDoc`, `doc`, `getDoc`, `getDocs`, `query`, `where`, `orderBy`, `onSnapshot`, `setDoc`, `updateDoc`, `serverTimestamp`
   - Storage exports: `ref`, `uploadBytes`, `getDownloadURL`
   - Session persistence: Automatic via `browserLocalPersistence`

2. **api.ts** (10+ lines)
   - Backend health check endpoint
   - `fetchBackendHealth()` - GET /api/health

3. **utils.ts** (50+ lines)
   - `getInitials(name)` - Extract initials for avatars
   - `getFirstName(name)` - Get first name from full name
   - `formatDate(value)` - Format dates consistently
   - `toJsDate(value)` - Convert Firestore timestamps to JS Date
   - `relativeDate(value)` - Human-readable relative dates ("2d ago")

4. **demoData.ts** (Not detailed but referenced)
   - Contains demo state for initial app load
   - Demo users, trips, posts, etc.

5. **indiaTravelData.ts** (Referenced)
   - India-specific travel products and destinations
   - Used by IndiaProductPage and AppShell product rail

6. **travelTools.ts** (Referenced)
   - Travel-related utility functions

### Styling (src/styles/)

**Global stylesheet:** `app.css`
- Modern CSS with CSS variables
- Responsive design
- Light/dark theme support
- Component-based styling
- Animated background blobs
- Custom typography and colors
- Sidebar, modal, and form styles

---

## 4. Backend Structure

### Server Setup
**File:** `server/src/server.js`
- Loads environment variables with `dotenv`
- Connects to MongoDB via `connectToDatabase()`
- Starts Express app on port (default: 5000)
- Error handling with graceful shutdown on connection failure

### Express App
**File:** `server/src/app.js`
```javascript
- CORS middleware: Accepts requests from CLIENT_URL (default: http://127.0.0.1:5173)
- Body parser: JSON with 1MB limit
- Root route: GET / returns health check
- API Routes:
  - GET / → Health status
  - /api/health → Health routes
  - /api/users → User management routes
  - /api/trips → Trip management routes
- Error handler: Centralized error response formatting
```

### Database Configuration
**File:** `server/src/config/db.js`
- Mongoose connection to MongoDB
- Connection string from `MONGODB_URI` environment variable
- Error handling with helpful error messages for missing config

### Data Models

#### 1. **User Model** (`server/src/models/User.js`)
```typescript
{
  firebaseUid: String (optional, for Firebase sync),
  name: String (required),
  email: String (required, unique, lowercase),
  role: "traveler" | "admin" | "superadmin" (default: "traveler"),
  status: "active" | "pending" | "banned" (default: "active"),
  avatar: String (URL),
  bio: String,
  location: String,
  notifications: "on" | "off" (default: "on"),
  style: "adventure" | "relaxation" | "culture" | "food" (default: "adventure"),
  timestamps: true (createdAt, updatedAt auto-generated)
}
```

#### 2. **Trip Model** (`server/src/models/Trip.js`)
```typescript
{
  name: String (required),
  destination: String (required),
  startDate: String (ISO date format),
  endDate: String (ISO date format),
  vibe: String ("Relaxed", etc.),
  category: String ("Leisure", etc.),
  groupSize: Number (default: 4),
  currency: String (default: "USD"),
  budgetTotal: Number (default: 0),
  coverImage: String (URL),
  status: "draft" | "planning" | "confirmed" | "completed" (default: "planning"),
  progress: Number (0-100, default: 0),
  adminId: String (required - creator's ID),
  shareCode: String (required, uppercase - unique trip code),
  members: TripMember[] (embedded),
  itinerary: ItineraryDay[] (embedded),
  budget: BudgetItem[] (embedded),
  comments: TripComment[] (embedded),
  packingList: String[],
  notes: String,
  timestamps: true
}
```

**Nested Schemas:**

- **TripMember:**
  ```typescript
  { uid, name, email, role: "admin"|"member"|"pending", joinedAt }
  ```

- **ItineraryDay:**
  ```typescript
  { id, label, date, activities: ActivityItem[] }
  ```

- **ActivityItem:**
  ```typescript
  { id, name, type: "flight"|"hotel"|"food"|"tour"|"transport"|"experience", 
    time, icon, notes, location, votes: ActivityVote[] }
  ```

- **BudgetItem:**
  ```typescript
  { id, label, amount, category: "flights"|"hotels"|"food"|"activities"|"transport"|"misc",
    currency, paidBy, splitBetween: String[], actual, emoji }
  ```

- **TripComment:**
  ```typescript
  { id, userId, authorName, text, createdAt }
  ```

### Backend Routes

#### 1. **Health Routes** (`server/src/routes/health.routes.js`)
```
GET /api/health
  Response: { ok, service, database: "connected"|"disconnected", timestamp }
```

#### 2. **Users Routes** (`server/src/routes/users.routes.js`)
```
GET /api/users
  - Fetch all users, sorted by createdAt descending
  - Response: User[]

POST /api/users
  - Create new user
  - Body: Partial<User>
  - Response: User (with generated _id and timestamps)
```

#### 3. **Trips Routes** (`server/src/routes/trips.routes.js`)
```
GET /api/trips
  - Fetch all trips, sorted by createdAt descending
  - Response: Trip[]

POST /api/trips
  - Create new trip
  - Body: Partial<Trip>
  - Response: Trip (with generated _id and timestamps)
```

**Current State:** Backend is in foundational stage with basic CRUD endpoints. No authentication middleware, filtering, or advanced query support yet.

---

## 5. Configuration Files

### Vite Config
**File:** `vite.config.ts`
```typescript
- Plugins: React JSX support
- Dev Server:
  - Host: 127.0.0.1
  - Port: 5173
  - Proxy: /api/* → http://127.0.0.1:5000 (backend)
```

### TypeScript Config
**File:** `tsconfig.json`
```json
- Target: ES2020
- Modules: ESNext
- JSX: react-jsx (automatic)
- Strict mode: Enabled (strict: true)
- Module resolution: Bundler
- Source: src/
```

### Firebase Config
**File:** `firebase.json`
```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

**Deployment Target:** Firestore rules are configured in `firestore.rules` (see section 8)

### Environment Variables

**Frontend** (`.env` or `.env.example`)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**Backend** (`server/.env` or `server/.env.example`)
```
PORT=5000
CLIENT_URL=http://127.0.0.1:5173
MONGODB_URI=mongodb://127.0.0.1:27017/wanderpack
```

---

## 6. Key Features

### Core Features by Category

#### **Authentication & Authorization**
- ✅ Email/Password registration with role selection (Traveler/Trip Organizer)
- ✅ Email/Password login with session persistence
- ✅ Google OAuth (with popup fallback to redirect for popup-blocked scenarios)
- ✅ Password reset via email
- ✅ Automatic session persistence across browser refreshes
- ✅ Role-based access control (Traveler, Admin, Superadmin)
- ✅ Admin-only route protection
- ✅ Email verification (sent but not enforced)

#### **Trip Planning**
- ✅ Create, read, update, delete trips
- ✅ Trip sharing via share code
- ✅ Trip members management (invite, roles, removal)
- ✅ Multi-day itinerary building with activities
- ✅ Activity voting system (upvotes)
- ✅ Activity types: Flights, Hotels, Food, Tours, Transport, Experiences
- ✅ Trip comments for collaboration
- ✅ Budget tracking with category breakdown
- ✅ Expense splitting between members
- ✅ Packing lists
- ✅ Trip progress tracking
- ✅ Trip status: Draft, Planning, Confirmed, Completed

#### **Social Features**
- ✅ Travel posts/feed with captions, images, tags, emojis
- ✅ Post likes and bookmarks
- ✅ Post comments
- ✅ User profiles with bio, location, travel style
- ✅ Follow system
- ✅ User activity visible in feed
- ✅ Story items/cards for destinations

#### **Booking & Services**
- ✅ Booking management system with multiple products:
  - Flights, Hotels, Homestays, Holiday Packages, Trains, Buses, Cabs, Visa, Insurance, Forex
- ✅ Booking vault for saving package details
- ✅ Booking status tracking (Draft, Confirmed, Completed, Cancelled)
- ✅ Payment tracking (UPI, Card, NetBanking, Cash)
- ✅ Discount codes and coupon support
- ✅ Traveler details for group bookings
- ✅ Service requests (Visa, Insurance, Forex)

#### **Wishlist & Offers**
- ✅ Destination wishlist with categories
- ✅ Bookmarkable destinations
- ✅ Bookmarkable posts
- ✅ Promotional offers feed

#### **India-Specific Features**
- ✅ India travel products pages (flights, hotels, trains, buses, visa, insurance, forex)
- ✅ Destination cards with region, budget, season, best-for info
- ✅ India travel data library

#### **Support & Admin**
- ✅ Support ticket system with status tracking
- ✅ Admin panel for user/trip/post/booking management
- ✅ User status management (active, pending, banned)
- ✅ Platform-wide broadcasts
- ✅ Activity logging (read-only)
- ✅ Admin profile customization

#### **User Experience**
- ✅ Light/Dark theme toggle
- ✅ Real-time notifications
- ✅ Toast notifications for actions
- ✅ Responsive design
- ✅ User preferences persistence
- ✅ FAQ/Assistant page for help

---

## 7. Data Flow

### Authentication Flow
```
1. User submits login/register form in AuthPage
   ↓
2. Auth context calls Firebase function (loginUser/registerUser)
   ↓
3. Firebase authenticates and returns user object
   ↓
4. ensureUserProfile() called to create/update Firestore user doc
   ↓
5. Auth context updates local state (user, profile)
   ↓
6. onAuthStateChanged listener triggers auto-refresh on reload
   ↓
7. ProtectedRoute checks state and allows/denies access
   ↓
8. User redirected to dashboard or landing page
```

### Trip Creation & Management Flow
```
1. User creates trip in DashboardPage via AppData context
   ↓
2. AppDataContext.createTrip() called with trip data
   ↓
3. Data stored in Firestore (collection: trips)
   ↓
4. Real-time listener (onSnapshot) updates local state
   ↓
5. TripPage displays trip data from context
   ↓
6. User adds activities/budget via context methods
   ↓
7. Each update sent to Firestore and synced immediately
   ↓
8. Trip data can be queried from MongoDB backend (POST /api/trips stores copy)
```

### Post Creation & Feed Flow
```
1. User creates post in CreatePostPage
   ↓
2. AppDataContext.createPost() stores in Firestore
   ↓
3. ExplorePage listens to posts collection
   ↓
4. User can like/bookmark/comment on posts
   ↓
5. Actions update Firestore in real-time
   ↓
6. Feed refreshes automatically
```

### Booking Flow
```
1. User creates booking via BookingsPage
   ↓
2. AppDataContext.createBooking() stores in Firestore (bookings collection)
   ↓
3. Booking appears in BookingsPage list
   ↓
4. User updates status or cancels
   ↓
5. Data synced to Firestore and UI updates
   ↓
6. Optional: Backend API can sync to MongoDB later
```

### Backend Integration Flow (Current & Future)
```
Current (Firebase-first):
Frontend → Firebase SDK → Firestore & Auth

Planned (MongoDB-first):
Frontend → Vite Proxy → Express Backend → MongoDB
         ↓
      Firebase (auth only)
```

**Note:** Backend is in scaffolding phase. Current data flow is Firebase-only. Backend endpoints exist but aren't actively used by frontend yet.

---

## 8. Authentication

### Authentication Architecture

**Current Implementation:**
- **Primary:** Firebase Authentication (Email/Password, Google OAuth)
- **Session:** Browser local persistence (automatic)
- **User Data:** Firestore document per user
- **Role Management:** Stored in Firestore user doc

### Authentication Methods

#### 1. **Email/Password**
```typescript
// Registration
registerUser(email, password, displayName, role)
  → Creates Firebase auth account
  → Updates profile with displayName
  → Creates Firestore user doc with role

// Login
loginUser(email, password, role?)
  → Authenticates with Firebase
  → Ensures Firestore user doc exists
  → Sets role if admin/superadmin
```

#### 2. **Google OAuth**
```typescript
loginWithGoogle(role)
  → Saves role to localStorage
  → Opens Google popup (with redirect fallback)
  → Creates Firebase user
  → Creates Firestore user doc with role
  → Handles popup-blocked scenario
```

#### 3. **Password Reset**
```typescript
resetPassword(email)
  → Sends password reset email via Firebase
  → User clicks link and resets password
```

### Session Management
- **Type:** Persistent client-side session
- **Storage:** Browser localStorage (via Firebase SDK)
- **Persistence:** Automatic across page reloads
- **Expiry:** Session lasts until user logs out or token expires
- **Provider:** Firebase `browserLocalPersistence`

### Authorization

#### Role-Based Access Control (RBAC)
```typescript
Roles:
  - traveler (default) - Regular users
  - admin - Platform moderators
  - superadmin - Full system access

Admin Routes:
  - /admin (admin-only)
  - /admin-auth (special admin login)
  - /admin/profile (admin profile)

Protected Routes:
  - All routes except /auth, /admin-auth, / require authentication
  - Admin routes check role === "admin" || role === "superadmin"
```

#### Firestore Security Rules
See section 8 (Database).

---

## 9. Database

### Primary Database: Firestore (Firebase)

**Connection Type:** Real-time listeners with REST API fallback

**Collections:**

1. **users/{uid}** (User profiles)
   ```typescript
   {
     uid: string,
     name: string,
     email: string,
     role: "traveler" | "admin" | "superadmin",
     status: "active" | "pending" | "banned",
     avatar?: string,
     bio?: string,
     location?: string,
     trips?: string[],
     notifications: "on" | "off",
     style: "adventure" | "relaxation" | "culture" | "food",
     createdAt: Timestamp,
     updatedAt: Timestamp
   }
   ```

2. **trips/{tripId}** (Trip details)
   ```typescript
   {
     id: string,
     name: string,
     destination: string,
     startDate?: string,
     endDate?: string,
     vibe?: string,
     category?: string,
     groupSize?: number,
     currency?: string,
     budgetTotal?: number,
     coverImage?: string,
     status: "draft" | "planning" | "confirmed" | "completed",
     progress: number (0-100),
     members: TripMember[],
     adminId: string,
     shareCode: string,
     itinerary: ItineraryDay[],
     budget: BudgetItem[],
     comments: TripComment[],
     packingList?: string[],
     notes?: string,
     createdAt: Timestamp,
     updatedAt: Timestamp
   }
   ```

3. **posts/{postId}** (Travel posts)
   ```typescript
   {
     id: string,
     authorId: string,
     authorName: string,
     destination: string,
     caption: string,
     image?: string,
     tags?: string[],
     emoji?: string,
     likes: number,
     likedBy: string[],
     comments: number,
     commentItems: PostComment[],
     bookmarkedBy: string[],
     category?: string,
     createdAt: Timestamp
   }
   ```

4. **bookings/{bookingId}** (Booking records)
   ```typescript
   {
     id: string,
     userId: string,
     product: BookingProduct,
     title: string,
     from?: string,
     to?: string,
     city?: string,
     travelDate?: string,
     travelers?: number,
     amount?: number,
     currency?: string,
     status: "draft" | "confirmed" | "completed" | "cancelled",
     paymentMethod: "upi" | "card" | "netbanking" | "cash",
     paymentStatus: "pending" | "paid",
     couponCode?: string,
     discountAmount?: number,
     createdAt: Timestamp
   }
   ```

5. **wishlist/{wishlistId}** (Saved items)
6. **supportTickets/{ticketId}** (Support requests)
7. **notifications/{notificationId}** (User notifications)
8. **activityLog/{logId}** (Read-only activity log)

### Secondary Database: MongoDB

**Connection String:** Via Mongoose (see Backend Configuration section)

**Models:** User and Trip models mirroring Firestore (see Backend Structure section 4)

**Current Use:** Optional persistence layer for gradual Firebase → MongoDB migration

**Future Role:** Primary data source (planned)

### Firestore Security Rules

**File:** `firestore.rules`

**Security Functions:**
```javascript
signedIn() - User is authenticated
isOwner(uid) - User owns the document
isPlatformAdmin() - User has admin/superadmin role in users doc
isTripAdmin() - User created the trip (adminId matches)
```

**Rules Summary:**

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| users/{uid} | Signed in | Own doc | Own doc | Own doc |
| trips/{id} | Signed in | Auth'd user only | Trip admin | Trip admin |
| posts/{id} | Signed in | Auth'd, author=uid | Author only | Author only |
| bookings/{id} | Auth'd user OR admin | Auth'd, user=uid | User OR admin | User OR admin |
| wishlist/{id} | Auth'd, owner OR create | Auth'd, user=uid | Auth'd, user=uid | Auth'd, user=uid |
| supportTickets/{id} | User OR admin | Auth'd, user=uid | User OR admin | User OR admin |
| notifications/{id} | User OR admin | Auth'd user OR admin | User OR admin | User OR admin |
| activityLog/{id} | Signed in | Auth'd only | ❌ | ❌ |

### Data Consistency

**Real-time Sync:**
- Firestore listeners automatically sync data to frontend state
- Changes update instantly across all views
- `onSnapshot()` listeners establish subscriptions

**Offline Support:**
- Firebase SDK has offline persistence enabled
- Data cached locally
- Syncs when connection restored

**Timestamps:**
- `serverTimestamp()` ensures consistent server time
- Clients cannot manipulate timestamps

---

## 10. Key Type Definitions

**File:** `src/types.ts` (200+ lines)

```typescript
// User & Auth
type UserRole = "traveler" | "admin" | "superadmin"
type UserStatus = "active" | "pending" | "banned"
type MemberRole = "admin" | "member" | "pending"

interface UserProfile {
  uid: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatar?: string
  bio?: string
  location?: string
  trips?: string[]
  notifications: "on" | "off"
  style: "adventure" | "relaxation" | "culture" | "food"
  createdAt?: Timestamp | Date | null
  updatedAt?: Timestamp | Date | null
}

// Trips
interface Trip {
  id: string
  name: string
  destination: string
  startDate?: string
  endDate?: string
  vibe?: string
  category?: string
  groupSize?: number
  currency?: string
  budgetTotal?: number
  coverImage?: string
  status: TripStatus
  progress: number
  members: TripMember[]
  adminId: string
  shareCode?: string
  itinerary?: ItineraryDay[]
  budget?: BudgetItem[]
  comments?: TripComment[]
  packingList?: string[]
  notes?: string
  createdAt?: Timestamp | Date | null
  updatedAt?: Timestamp | Date | null
}

type TripStatus = "draft" | "planning" | "confirmed" | "completed"
type ActivityType = "flight" | "hotel" | "food" | "tour" | "transport" | "experience"
type ExpenseCategory = "flights" | "hotels" | "food" | "activities" | "transport" | "misc"

// Posts
interface Post {
  id: string
  authorId?: string
  authorName: string
  authorColor?: string
  destination: string
  caption: string
  image?: string
  tags?: string[]
  emoji?: string
  likes?: number
  likedBy?: string[]
  comments?: number
  commentItems?: PostComment[]
  bookmarkedBy?: string[]
  category?: string
  createdAt?: Timestamp | Date | null
}

// Bookings
interface BookingItem {
  id: string
  userId: string
  product: BookingProduct
  title: string
  from?: string
  to?: string
  city?: string
  travelDate?: string
  travelers?: number
  amount?: number
  // ... 20+ more properties
}

type BookingProduct = "flights" | "hotels" | "homestays" | "holiday-packages" | "trains" | "buses" | "cabs" | "visa" | "insurance" | "forex"
type BookingStatus = "draft" | "confirmed" | "completed" | "cancelled"
type PaymentMethod = "upi" | "card" | "netbanking" | "cash"

// ... 15+ more interfaces for Notifications, Wishlist, Support, etc.
```

---

## 11. Development Setup

### Installation
```bash
# Root level
npm install
npm --prefix server install

# Install dependencies in both directories
```

### Environment Configuration
```bash
# Frontend
cp .env.example .env
# Edit .env with Firebase credentials

# Backend
cp server/.env.example server/.env
# Edit server/.env with MongoDB URI and ports
```

### Development Commands
```bash
# Start frontend (port 5173)
npm run dev:client

# Start backend (port 5000)
npm run dev:server

# Or start both with:
npm run dev (not configured yet)

# Build for production
npm run build

# Type checking
npm run tsc -b
```

### Building
```bash
# Full build (TypeScript check + Vite bundle)
npm run build

# Result: dist/ folder with production-ready frontend
```

---

## 12. Summary & Migration Path

### Current State (v2.0)
- **Frontend:** Fully functional React SPA with Firebase integration
- **Backend:** Scaffolded Express/MongoDB with basic CRUD endpoints
- **Database:** Firestore as primary source of truth
- **Architecture:** Client-side authentication and state management

### Planned Migration (v3.0+)
1. **Phase 1:** Add authentication middleware to backend
2. **Phase 2:** Migrate API calls from Firestore to MongoDB backend
3. **Phase 3:** Implement advanced backend features (filtering, pagination, search)
4. **Phase 4:** Move Firebase to auth-only role
5. **Phase 5:** Complete MongoDB transition

### Strengths
- ✅ Modern React architecture with TypeScript
- ✅ Real-time data sync via Firestore
- ✅ Comprehensive feature set
- ✅ Role-based access control
- ✅ Clean separation of concerns (contexts, components, pages)
- ✅ Responsive design with theme support
- ✅ Security rules in place

### Areas for Improvement
- ⚠️ Backend routes lack authentication middleware
- ⚠️ Backend not fully integrated with frontend
- ⚠️ No API error handling standardization
- ⚠️ No logging/monitoring system
- ⚠️ No image optimization for uploads
- ⚠️ Admin features need more robustness
- ⚠️ No rate limiting or request validation

---

## File Structure Summary

```
WanderPack/
├── Root Config Files
│   ├── vite.config.ts (dev server + proxy)
│   ├── tsconfig.json (TypeScript config)
│   ├── firebase.json (Firestore rules)
│   ├── package.json (frontend dependencies)
│   └── firestore.rules (security rules)
│
├── Frontend (src/)
│   ├── main.tsx (entry point)
│   ├── App.tsx (routing & lazy loading)
│   ├── types.ts (TypeScript definitions)
│   │
│   ├── components/
│   │   ├── AppShell.tsx (layout wrapper)
│   │   ├── ProtectedRoute.tsx (route guard)
│   │   └── Toast.tsx (notifications)
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx (authentication)
│   │   ├── AppDataContext.tsx (app state)
│   │   └── ToastContext.tsx (toasts)
│   │
│   ├── pages/ (20 page components)
│   │   ├── LandingPage, AuthPage, DashboardPage, etc.
│   │
│   ├── lib/
│   │   ├── firebase.ts (Firebase SDK + helpers)
│   │   ├── api.ts (backend health check)
│   │   ├── utils.ts (utility functions)
│   │   ├── demoData.ts (initial state)
│   │   ├── indiaTravelData.ts (India products)
│   │   └── travelTools.ts (travel utilities)
│   │
│   └── styles/
│       └── app.css (global styles)
│
└── Backend (server/)
    ├── package.json (backend dependencies)
    └── src/
        ├── server.js (entry point)
        ├── app.js (Express app setup)
        ├── config/
        │   └── db.js (MongoDB connection)
        ├── models/
        │   ├── User.js (user schema)
        │   └── Trip.js (trip schema)
        └── routes/
            ├── health.routes.js
            ├── users.routes.js
            └── trips.routes.js
```

---

**Analysis Complete!** This comprehensive breakdown covers the entire WanderPack architecture, from frontend React components to backend Express routes, database schemas, authentication flows, and the migration roadmap.
