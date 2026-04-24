import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import type { UserProfile, UserRole } from "../types";

type FirebaseUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase environment variables for: ${missingConfig.join(", ")}. ` +
      "Create a .env file from .env.example before starting WanderPack.",
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
const GOOGLE_ROLE_KEY = "wanderpack-google-role";

googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope("email");
googleProvider.addScope("profile");

setPersistence(auth, browserLocalPersistence).catch((error: unknown) => {
  console.warn("Unable to enable auth persistence:", error);
});

function buildUserProfile(user: FirebaseUser, overrides: Partial<UserProfile> = {}): UserProfile {
  const role = overrides.role || "traveler";
  return {
    uid: user.uid,
    name: overrides.name || user.displayName || "Traveler",
    email: user.email || overrides.email || "",
    role,
    status: overrides.status || (role === "admin" ? "pending" : "active"),
    avatar: overrides.avatar ?? user.photoURL ?? "",
    bio: overrides.bio ?? "",
    location: overrides.location ?? "",
    trips: overrides.trips ?? [],
    notifications: overrides.notifications ?? "on",
    style: overrides.style ?? "adventure",
    createdAt: overrides.createdAt ?? null,
    updatedAt: overrides.updatedAt ?? null,
  };
}

export async function ensureUserProfile(user: FirebaseUser, overrides: Partial<UserProfile> = {}) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  const baseProfile = buildUserProfile(user, overrides);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      ...baseProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return baseProfile;
  }

  const currentProfile = snapshot.data() as Partial<UserProfile>;
  const hasRoleOverride = overrides.role !== undefined;
  const hasStatusOverride = overrides.status !== undefined;
  const mergedProfile = {
    ...baseProfile,
    ...currentProfile,
    role: hasRoleOverride ? overrides.role : currentProfile.role || baseProfile.role,
    status: hasStatusOverride ? overrides.status : currentProfile.status || baseProfile.status,
    name: currentProfile.name || baseProfile.name,
    email: currentProfile.email || baseProfile.email,
    avatar: currentProfile.avatar || baseProfile.avatar,
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, mergedProfile, { merge: true });
  return mergedProfile as UserProfile;
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function registerUser(email: string, password: string, displayName: string, role: UserRole = "traveler") {
  const credentials = await createUserWithEmailAndPassword(auth, email, password);
  const user = credentials.user;
  await updateProfile(user, { displayName });
  await ensureUserProfile(user, { name: displayName, role, email });

  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.warn("Email verification could not be sent:", error);
  }

  return user;
}

export async function loginUser(email: string, password: string, role?: UserRole) {
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  if (role === "admin" || role === "superadmin") {
    await ensureUserProfile(credentials.user, { role, status: "active" });
  } else {
    await ensureUserProfile(credentials.user);
  }
  return credentials.user;
}

function savePendingGoogleRole(role: UserRole) {
  try {
    window.localStorage.setItem(GOOGLE_ROLE_KEY, role);
  } catch (error) {
    console.warn("Unable to save Google auth role:", error);
  }
}

function consumePendingGoogleRole() {
  try {
    const storedRole = window.localStorage.getItem(GOOGLE_ROLE_KEY) as UserRole | null;
    window.localStorage.removeItem(GOOGLE_ROLE_KEY);
    return storedRole || "traveler";
  } catch (error) {
    console.warn("Unable to read Google auth role:", error);
    return "traveler";
  }
}

export async function completeGoogleRedirect() {
  const credentials = await getRedirectResult(auth);
  if (!credentials) {
    return null;
  }

  const role = consumePendingGoogleRole();
  await ensureUserProfile(credentials.user, { role, status: "active" });
  return credentials.user;
}

export async function loginWithGoogle(role: UserRole = "traveler") {
  savePendingGoogleRole(role);

  try {
    const credentials = await signInWithPopup(auth, googleProvider);
    consumePendingGoogleRole();
    await ensureUserProfile(credentials.user, { role, status: "active" });
    return credentials.user;
  } catch (error) {
    const authError = error as { code?: string; message?: string };
    const shouldFallbackToRedirect =
      authError.code === "auth/popup-blocked" ||
      authError.code === "auth/cancelled-popup-request" ||
      authError.code === "auth/popup-closed-by-user" ||
      authError.message?.includes("Cross-Origin-Opener-Policy") ||
      authError.message?.includes("popup");

    if (shouldFallbackToRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onAuthStateChanged,
  onSnapshot,
  orderBy,
  query,
  ref,
  serverTimestamp,
  setDoc,
  signOut,
  updateDoc,
  updateProfile,
  uploadBytes,
  where,
  getDownloadURL,
};
