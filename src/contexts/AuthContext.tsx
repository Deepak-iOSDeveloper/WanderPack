import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  auth,
  completeGoogleRedirect,
  getUserProfile,
  loginUser,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  registerUser,
  resetPassword,
} from "../lib/firebase";
import { getUserByFirebaseUid, upsertUser } from "../lib/api";
import type { UserProfile, UserRole } from "../types";

type FirebaseUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
};

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  loginWithGoogleProvider: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfileForUser(nextUser: FirebaseUser | null) {
    if (!nextUser) {
      setProfile(null);
      return;
    }

    try {
      let nextProfile = await getUserProfile(nextUser.uid);

      if (nextProfile) {
        nextProfile = await upsertUser({
          ...nextProfile,
          firebaseUid: nextUser.uid,
          email: nextProfile.email || nextUser.email || "",
          name: nextProfile.name || nextUser.displayName || nextUser.email?.split("@")[0] || "Traveler",
          avatar: nextProfile.avatar || nextUser.photoURL || "",
        });
      } else {
        nextProfile = await getUserByFirebaseUid(nextUser.uid);
      }

      if (!nextProfile && nextUser.email) {
        nextProfile = await upsertUser({
          firebaseUid: nextUser.uid,
          email: nextUser.email,
          name: nextUser.displayName || nextUser.email.split("@")[0] || "Traveler",
          avatar: nextUser.photoURL || "",
        });
      }
      setProfile(nextProfile);
    } catch (error) {
      console.warn("Failed to load user profile:", error);
      setProfile(null);
    }
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await completeGoogleRedirect();
      } catch (error) {
        console.warn("Google redirect sign-in could not be completed:", error);
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, async (nextUser: FirebaseUser | null) => {
      if (!active) {
        return;
      }
      setUser(nextUser);
      await refreshProfileForUser(nextUser);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    login: async (email, password, role) => {
      const nextUser = await loginUser(email, password, role);
      setUser(nextUser);
      await refreshProfileForUser(nextUser);
    },
    register: async (email, password, displayName, role) => {
      const nextUser = await registerUser(email, password, displayName, role);
      setUser(nextUser);
      await refreshProfileForUser(nextUser);
    },
    loginWithGoogleProvider: async (role = "traveler") => {
      const nextUser = await loginWithGoogle(role);
      if (nextUser) {
        setUser(nextUser);
        await refreshProfileForUser(nextUser);
      }
    },
    logout: async () => {
      await logoutUser();
      setUser(null);
      setProfile(null);
    },
    sendReset: async (email) => {
      await resetPassword(email);
    },
    refreshProfile: async () => {
      await refreshProfileForUser(auth.currentUser);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
