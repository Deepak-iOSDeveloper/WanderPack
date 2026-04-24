# WanderPack - Setup & Deployment Guide

**Last Updated**: April 23, 2026  
**Version**: 2.0.0

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm --prefix server install
```

### 2. Configure Environment

```bash
# Copy frontend config from example
cp .env.example .env

# Configure backend
cp server/.env.example server/.env
```

**Fill in `.env`:**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Fill in `server/.env`:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wanderpack
CLIENT_URL=http://127.0.0.1:5173
```

### 3. Start Development Servers

```bash
# Terminal 1: Start frontend (port 5173)
npm run dev

# Terminal 2: Start backend (port 5000)
npm run dev:server
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
WanderPack/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/               # Reusable React components
│   ├── contexts/                 # Context providers (Auth, AppData, Toast)
│   ├── hooks/                    # Custom React hooks
│   ├── constants/                # App-wide constants
│   ├── lib/                      # Firebase & API utilities
│   ├── pages/                    # Page components (20 pages)
│   ├── services/                 # Business logic (placeholder)
│   ├── styles/                   # CSS stylesheets
│   ├── utils/                    # Helpers & validators
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
│
├── server/                       # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── models/               # MongoDB schemas
│   │   ├── middleware/           # Express middleware
│   │   ├── validators/           # Input validation
│   │   ├── services/             # Business logic (placeholder)
│   │   ├── utils/                # Backend helpers
│   │   ├── constants/            # Server constants
│   │   ├── config/               # Configuration
│   │   ├── app.js                # Express app
│   │   └── server.js             # Server entry point
│   ├── .env.example              # Example environment
│   └── package.json              # Dependencies
│
├── .env.example                  # Frontend env example
├── .gitignore                    # Git configuration
├── index.html                    # HTML entry point
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
│
├── RESTRUCTURE_SUMMARY.md        # What changed
├── CODEBASE_ANALYSIS.md          # Architecture overview
└── STRUCTURE_ISSUES.md           # Issues found & fixed
```

---

## 🔌 API Endpoints

### Health Check
```
GET /api/health
Response: { ok: true, service: "wanderpack-server", database: "connected", timestamp: "..." }
```

### Users API
```
GET    /api/users              # List users (paginated)
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Trips API
```
GET    /api/trips              # List trips (paginated)
GET    /api/trips/:id          # Get trip by ID
POST   /api/trips              # Create trip
PUT    /api/trips/:id          # Update trip
DELETE /api/trips/:id          # Delete trip
```

---

## 📚 Key Features

### Frontend
- ✅ React 18 + TypeScript
- ✅ Firebase Authentication (Email + Google OAuth)
- ✅ Real-time Firestore database
- ✅ Role-based access control (Traveler/Admin/Superadmin)
- ✅ 20+ page components
- ✅ Global state management (Context API)
- ✅ Toast notifications
- ✅ Dark/Light theme toggle

### Backend
- ✅ Express.js REST API
- ✅ MongoDB + Mongoose ODM
- ✅ Input validation on all endpoints
- ✅ Comprehensive error handling
- ✅ Request logging & monitoring
- ✅ Pagination support
- ✅ User data sanitization
- ✅ Graceful error recovery

---

## 🔐 Authentication

### Frontend Flow
1. User enters credentials
2. Firebase Authentication validates
3. User profile loaded from Firestore
4. Token stored in localStorage (persistent)
5. Protected routes check authentication

### Backend Integration (Future)
- [ ] JWT token validation middleware
- [ ] MongoDB user sessions
- [ ] Role-based route protection
- [ ] API key management

---

## 📝 Development Workflow

### Code Organization

#### Frontend
```typescript
// components/
// - Reusable UI components
// - Should be pure/stateless where possible

// pages/
// - Full page components
// - May contain page-specific logic

// contexts/
// - Global state management
// - AuthContext, AppDataContext, ToastContext

// hooks/
// - Custom React hooks
// - useAuth(), useToast(), useAppData()

// services/
// - Business logic / API calls
// - TODO: Extract from components

// utils/
// - Helper functions
// - Validators, formatters, etc.
```

#### Backend
```javascript
// routes/
// - API endpoint definitions
// - Call validators then handlers

// validators/
// - Input validation schemas
// - Consistent error responses

// middleware/
// - Express middleware
// - Error handling, logging, CORS

// utils/
// - Helper functions
// - Response builders, sanitizers

// models/
// - MongoDB schemas
// - Validation at schema level

// services/
// - Business logic
// - TODO: Extract from routes
```

### Best Practices

#### Frontend
```typescript
// ✅ DO: Use hooks for context access
const { user } = useAuth();

// ❌ DON'T: Import context directly
// const auth = useContext(AuthContext);

// ✅ DO: Use validators
const validation = validateEmail(email);
if (!validation.valid) {
  setError(validation.error);
}

// ❌ DON'T: Inline regex validation
// if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ...
```

#### Backend
```javascript
// ✅ DO: Use asyncHandler for routes
router.post('/', asyncHandler(async (req, res) => {
  // ...
}));

// ✅ DO: Use validation schemas
const validation = validateUserRegistration(req.body);
if (!validation.isValid) {
  throw new ApiError(400, "Validation failed");
}

// ❌ DON'T: Use try-catch in routes
// The asyncHandler wraps it automatically

// ✅ DO: Use sanitizeUser() before responding
res.json(sanitizeUser(user));

// ❌ DON'T: Return raw user objects with passwords
```

---

## 🧪 Testing (TODO)

```bash
# Frontend tests
npm run test

# Backend tests
npm --prefix server run test

# All tests
npm run test:all
```

---

## 🏗️ Building for Production

### Frontend Build
```bash
npm run build
# Output: dist/
```

### Backend Build
```bash
# Backend is not built, runs Node.js directly
# For production: npm run start in server/
```

### Environment Setup for Production
```env
# Frontend
VITE_FIREBASE_API_KEY=production_key
...

# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://prod_user:prod_pass@cluster.mongodb.net/wanderpack
CLIENT_URL=https://wanderpack.com
```

---

## 🚨 Troubleshooting

### MongoDB Connection Fails
```
❌ Error: Failed to connect to MongoDB
```

**Solution**:
1. Check MONGODB_URI in `server/.env`
2. Ensure MongoDB is running locally: `mongod`
3. For MongoDB Atlas, verify IP whitelist

### Port Already in Use
```
❌ Error: Port 5000 already in use
```

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Firebase Auth Not Working
```
❌ Error: Missing Firebase environment variables
```

**Solution**:
1. Check `.env` has all Firebase variables
2. Verify values from Firebase console
3. Restart dev server: `npm run dev`

### Validation Errors on API
```
❌ 400 Bad Request: Validation failed
```

**Solution**:
1. Check request body matches schema
2. Review error message in response
3. Test with Postman/curl

---

## 📊 Monitoring

### Frontend
- Check browser console for errors
- Check network tab for API calls
- Use React DevTools for component inspection

### Backend
```
✅ Server is listening
✅ Database connection established
[200] GET /api/health - 5ms
[201] POST /api/users - 45ms
[404] GET /api/unknown - 2ms
```

---

## 🔄 Continuous Integration (TODO)

Recommended CI/CD setup:
- [ ] GitHub Actions
- [ ] Run tests on push
- [ ] Build production bundle
- [ ] Deploy to hosting service

---

## 📞 Support

For issues or questions:
1. Check STRUCTURE_ISSUES.md for known issues
2. Review CODEBASE_ANALYSIS.md for architecture
3. Check source code comments
4. Review error messages carefully

---

## 📈 Next Phase Goals

### High Priority
- [ ] Add TypeScript to backend
- [ ] Implement API authentication middleware
- [ ] Add comprehensive error logging
- [ ] Write API documentation (Swagger)
- [ ] Add input rate limiting

### Medium Priority
- [ ] Set up CI/CD pipeline
- [ ] Add unit tests (Frontend + Backend)
- [ ] Add integration tests
- [ ] Database query optimization
- [ ] Add API versioning

### Low Priority
- [ ] Add caching layer (Redis)
- [ ] Implement WebSockets for real-time
- [ ] Add APM/monitoring tools
- [ ] Set up CDN for static assets
- [ ] Implement background jobs

---

**Happy Coding! 🚀**
