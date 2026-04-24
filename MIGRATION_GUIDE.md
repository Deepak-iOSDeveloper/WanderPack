# 📋 Migration Checklist - Code Changes

**Purpose**: Help developers understand and adapt to the new structure  
**Date**: April 23, 2026  
**Version**: 2.0.0

---

## 🎯 Quick Migration Guide

If you have **existing code** or are **familiar with the old structure**, use this checklist to understand changes.

---

## Frontend Changes

### ✅ Import Statements - What Changed

#### Constants
```typescript
// OLD (scattered across files)
const ROUTES = { HOME: '/', AUTH: '/auth', ... };
const USER_ROLES = { TRAVELER: 'traveler', ... };

// NEW (centralized)
import { ROUTES, USER_ROLES } from '../constants';
```

#### Utilities
```typescript
// OLD (from src/lib/utils.ts)
import { getInitials, formatDate } from '../lib/utils';

// NEW (from src/utils/index.ts)
import { getInitials, formatDate, validateEmail } from '../utils';
```

#### Validators
```typescript
// OLD (no validators, inline validation)
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { ... }

// NEW (imported validators)
import { validateEmail, validatePassword } from '../utils/validators';
const validation = validateEmail(email);
if (!validation.valid) { ... }
```

### ✅ Hooks - New Pattern

#### Using Context (NEW)
```typescript
// OLD (direct useContext)
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
const { user } = useContext(AuthContext);

// NEW (custom hooks)
import { useAuth } from '../hooks';
const { user } = useAuth();
```

#### Check User Role (NEW)
```typescript
// OLD (manual check)
const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

// NEW (use hook)
import { useIsAdmin } from '../hooks';
const isAdmin = useIsAdmin();
```

### ✅ Services Folder (NEW - Placeholder)

```typescript
// This folder is ready for business logic extraction
// Currently business logic is in:
// - src/lib/firebase.ts (auth logic)
// - src/lib/api.ts (API calls)
// - Component files (scattered logic)

// Plan: Move to src/services/
// src/services/authService.ts     <- Auth business logic
// src/services/apiService.ts      <- API business logic
// src/services/dataService.ts     <- Data manipulation logic
```

---

## Backend Changes

### ✅ Request Handlers - New Pattern

#### Error Handling (IMPROVED)
```javascript
// OLD (try-catch in handler)
router.post('/', async (req, res, next) => {
  try {
    const result = await User.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// NEW (asyncHandler wrapper)
import { asyncHandler, ApiError } from '../middleware/errorHandler';
router.post('/', asyncHandler(async (req, res) => {
  const result = await User.create(req.body);
  res.status(201).json(result);
  // Errors automatically caught and handled
}));
```

#### Input Validation (NEW)
```javascript
// OLD (no validation)
router.post('/', async (req, res) => {
  const user = await User.create(req.body); // Any data accepted
  res.json(user);
});

// NEW (validation required)
import { validateUserRegistration } from '../validators/schemas';
import { ApiError } from '../middleware/errorHandler';

router.post('/', asyncHandler(async (req, res) => {
  const validation = validateUserRegistration(req.body);
  if (!validation.isValid) {
    throw new ApiError(400, 'Validation failed');
  }
  const user = await User.create(req.body);
  res.json(user);
}));
```

#### Response Format (STANDARDIZED)
```javascript
// OLD (inconsistent)
res.json(user);
res.status(201).json(user);
res.json({ message: 'Success' });

// NEW (consistent)
import { successResponse } from '../utils/helpers';
res.json(successResponse(user, 'User created'));
// Returns: { ok: true, message: 'User created', data: user }
```

#### User Data Security (IMPROVED)
```javascript
// OLD (exposed passwords)
const user = await User.findById(id);
res.json(user); // Contains password field

// NEW (sanitized)
import { sanitizeUser } from '../utils/helpers';
const user = await User.findById(id);
res.json(sanitizeUser(user)); // Password removed
```

### ✅ Constants - New Location

```javascript
// OLD (scattered)
const HTTP_STATUS = 200; // scattered in code
const ROLES = ['traveler', 'admin']; // repeated

// NEW (centralized)
import { HTTP_STATUS, USER_ROLES } from '../constants';
res.status(HTTP_STATUS.CREATED).json(...);
if (!USER_ROLES.includes(req.body.role)) { ... }
```

### ✅ Middleware - New Organization

```javascript
// OLD (error handling in app.js)
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message });
});

// NEW (separate middleware)
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

app.use(requestLogger);      // Log requests
app.use(notFoundHandler);    // Handle 404s
app.use(errorHandler);       // Handle errors (last)
```

### ✅ Validators - New Module

```javascript
// OLD (validation scattered)
if (!data.email) throw new Error('Email required');
if (!/^[...]$/.test(data.email)) throw new Error('Invalid');

// NEW (centralized)
import { validateUserRegistration } from '../validators/schemas';
const validation = validateUserRegistration(data);
if (!validation.isValid) {
  // validation.errors contains all error messages
}
```

### ✅ Logging - New Approach

```javascript
// OLD (no logging)
// No visibility into API requests

// NEW (automatic logging)
// Every request logged with:
// ✅ [200] GET /api/users - 5ms
// ❌ [400] POST /api/users - 12ms
// ⚠️  [500] PUT /api/users/123 - 8ms
```

---

## How to Update Existing Code

### Step 1: Update Imports
Replace old imports with new ones:
```javascript
// Before
import { formatDate } from '../lib/utils';

// After
import { formatDate } from '../utils';
```

### Step 2: Use New Hooks
```typescript
// Before
const { user } = useContext(AuthContext);

// After
const { user } = useAuth();
```

### Step 3: Add Validation
```javascript
// Before
router.post('/', async (req, res) => {
  // No validation

// After
router.post('/', asyncHandler(async (req, res) => {
  const validation = validateUserRegistration(req.body);
  if (!validation.isValid) throw new ApiError(400, 'Invalid');
```

### Step 4: Use Response Helpers
```javascript
// Before
res.json(user);

// After
res.json(successResponse(sanitizeUser(user), 'User created'));
```

---

## Breaking Changes Summary

| Item | Before | After | Impact |
|------|--------|-------|--------|
| Constants location | Scattered | src/constants/ | Import path change |
| Validators | None | In validators/ | New validation required |
| Error handling | try-catch | asyncHandler | Error caught automatically |
| Response format | Inconsistent | Standardized | Update response code |
| Middleware order | Basic | Proper order | Errors handled correctly |
| User endpoints | No CRUD | Full CRUD + pagination | More endpoints available |

---

## Testing After Migration

### Frontend
```typescript
// Test hook usage
import { useAuth } from '../hooks';

function TestComponent() {
  const { user } = useAuth(); // Should work without error
  return <div>{user?.name}</div>;
}
```

### Backend
```bash
# Test new endpoints
curl http://localhost:5000/api/users
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'

# Test validation
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" \
  -d '{"email":"invalid"}' # Should return 400 with validation error
```

---

## Deprecation Notice

### Deprecated Patterns
These patterns should NOT be used in new code:

#### Frontend
```typescript
// ❌ AVOID: Direct context import
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
const auth = useContext(AuthContext);

// ✅ USE: Hook instead
import { useAuth } from '../hooks';
const auth = useAuth();
```

#### Backend
```javascript
// ❌ AVOID: try-catch in every route
router.post('/', async (req, res, next) => {
  try { ... } catch (error) { next(error); }
});

// ✅ USE: asyncHandler wrapper
import { asyncHandler } from '../middleware/errorHandler';
router.post('/', asyncHandler(async (req, res) => { ... }));
```

---

## FAQ

### Q: Do I need to update all files at once?
**A**: No, gradual migration is fine. Old patterns still work, new patterns are better.

### Q: Can I use both old and new patterns?
**A**: Yes, but standardize new code on new patterns for consistency.

### Q: Where should I put new validation?
**A**: In `server/src/validators/schemas.js` or a new file for complex validators.

### Q: How do I add a new API endpoint?
**A**: 
1. Create route in `routes/`
2. Add validation in `validators/`
3. Use `asyncHandler` wrapper
4. Use `successResponse` helper
5. Sanitize sensitive data

### Q: What about the `services` folders?
**A**: They're placeholders for future extraction. Don't use yet.

---

## Success Indicators

After migration, you should see:
- ✅ No import errors
- ✅ Type checking works properly
- ✅ API endpoints return consistent format
- ✅ Validation errors are helpful
- ✅ Server logs show request timing
- ✅ Sensitive data is hidden
- ✅ Code is easier to find
- ✅ New features are faster to add

---

## Getting Help

1. **Compilation errors**: Check import paths
2. **Runtime errors**: Check error message in logs
3. **Validation errors**: Review validator schema
4. **Type errors**: Check TypeScript console
5. **Not found errors**: Check .gitignore and folder structure

---

**Good luck with the migration! 🚀**
