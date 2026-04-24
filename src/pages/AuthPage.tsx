import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { UserRole } from "../types";

interface AuthPageProps {
  forcedRole?: UserRole;
  variant?: "traveler" | "admin";
}

const ADMIN_ACCESS_CODE = "985";

function friendlyError(code?: string) {
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
    "auth/account-exists-with-different-credential": "That Gmail address already exists with a different sign-in method. Try email/password first.",
    "auth/invalid-credential": "The email or password looks incorrect.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Authentication yet.",
    "auth/popup-blocked": "The Google login popup was blocked by your browser.",
    "auth/popup-closed-by-user": "The Google sign-in popup closed, so WanderPack will try a full-page Google redirect instead.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase. Add 127.0.0.1 and localhost in Firebase Authentication settings.",
    "auth/configuration-not-found": "Google sign-in is not configured correctly in Firebase Authentication.",
    "auth/too-many-requests": "Too many attempts were made. Please wait and try again.",
    "auth/user-disabled": "This account has been disabled in Firebase Authentication.",
    "auth/weak-password": "Use at least 6 characters for your password.",
  };

  return code ? messages[code] || `Google/Firebase error: ${code}` : "Something went wrong. Please try again.";
}

export function AuthPage({ forcedRole, variant = "traveler" }: AuthPageProps) {
  const { user, profile, loading, login, register, loginWithGoogleProvider, sendReset } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>(forcedRole || "traveler");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  useEffect(() => {
    if (forcedRole) {
      setSelectedRole(forcedRole);
    }
  }, [forcedRole]);

  if (loading && user) {
    return <div className="page-loader">Loading WanderPack...</div>;
  }

  if (user && !profile) {
    return <div className="page-loader">Loading your workspace...</div>;
  }

  if (user) {
    const nextPath = profile?.role === "admin" || profile?.role === "superadmin" ? "/admin" : "/dashboard";
    return <Navigate to={nextPath} replace />;
  }

  async function handleLogin() {
    if (!loginForm.email || !loginForm.password) {
      setError("Please enter both your email and password.");
      return;
    }
    if (selectedRole === "admin" && adminCode.trim() !== ADMIN_ACCESS_CODE) {
      setError("Admin access code is incorrect.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      await login(loginForm.email, loginForm.password, selectedRole);
      setSuccess(
        selectedRole === "admin"
          ? "Admin login successful. Your organizer access is being synced."
          : "Login successful.",
      );
    } catch (authError) {
      setError(friendlyError((authError as { code?: string }).code));
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister() {
    if (!registerForm.name) {
      setError("Please enter your full name.");
      return;
    }
    if (selectedRole === "admin" && adminCode.trim() !== ADMIN_ACCESS_CODE) {
      setError("Admin access code is incorrect.");
      return;
    }
    if (registerForm.password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      await register(registerForm.email, registerForm.password, registerForm.name, selectedRole);
      setSuccess("Account created successfully.");
    } catch (authError) {
      setError(friendlyError((authError as { code?: string }).code));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (selectedRole === "admin" && adminCode.trim() !== ADMIN_ACCESS_CODE) {
      setError("Admin access code is incorrect.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      await loginWithGoogleProvider(selectedRole);
    } catch (authError) {
      setError(friendlyError((authError as { code?: string }).code));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!loginForm.email) {
      setError("Enter your email address first, then request a reset.");
      return;
    }

    try {
      setBusy(true);
      await sendReset(loginForm.email);
      showToast("Password reset email sent.");
      setSuccess("Password reset email sent. Check your inbox and spam folder.");
    } catch (authError) {
      setError(friendlyError((authError as { code?: string }).code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="blob-bg">
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
        <span className="b4" />
      </div>
      <main className="auth-shell">
        <section className="auth-showcase">
          <div>
            <div className="brand-mark">WanderPack</div>
            <div className="eyebrow">{variant === "admin" ? "Organizer control room" : "Travel together, better"}</div>
            <h1>{variant === "admin" ? "Secure admin access for the WanderPack control room." : "Secure access for every trip plan."}</h1>
            <p>
              {variant === "admin"
                ? "Sign in to review travelers, bookings, trips, support requests, and platform activity from one place."
                : "Sign in to manage itineraries, collaborate with your group, and keep every booking and update in one place."}
            </p>
          </div>
          <div className="feature-stack">
            <div className="feature-tile">
              <strong>{variant === "admin" ? "Operator login" : "Fast sign in"}</strong>
              <span>
                {variant === "admin"
                  ? "Admin email login, Google login, and persistent organizer sessions are supported."
                  : "Email/password, Google login, and persistent sessions are built in."}
              </span>
            </div>
            <div className="feature-tile">
              <strong>{variant === "admin" ? "Full data oversight" : "Automatic profiles"}</strong>
              <span>
                {variant === "admin"
                  ? "View platform-wide users, trips, posts, bookings, and activity from the admin workspace."
                  : "Every account gets a Firestore user record for the rest of the app."}
              </span>
            </div>
            <div className="feature-tile">
              <strong>{variant === "admin" ? "Access recovery" : "Clear recovery"}</strong>
              <span>
                {variant === "admin"
                  ? "Password reset and role sync help restore organizer access cleanly."
                  : "Password reset and better errors make auth easier to troubleshoot."}
              </span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-top">
            <h2>
              {mode === "login"
                ? selectedRole === "admin"
                  ? "Admin sign in"
                  : "Traveler sign in"
                : selectedRole === "admin"
                  ? "Create admin account"
                  : "Create traveler account"}
            </h2>
            <p>
              {mode === "login"
                ? selectedRole === "admin"
                  ? "Log in to review all traveler activity, bookings, and platform data."
                  : "Log in to open your dashboard and continue planning."
                : selectedRole === "admin"
                  ? "Set up organizer access for the platform control room."
                  : "Set up secure access and start organizing your next trip."}
            </p>
          </div>

          {!forcedRole ? (
            <div className="form-group">
              <label>{mode === "login" ? "Choose portal" : "I want to use WanderPack as"}</label>
              <div className="role-selector">
                {[
                  ["traveler", "Traveler", "Personal dashboard for trips, bookings, feed, and planning."],
                  ["admin", "Admin / Organizer", "Control room for users, trips, posts, bookings, and moderation."],
                ].map(([role, title, description]) => (
                  <button
                    className={`role-card ${selectedRole === role ? "selected" : ""}`}
                    key={role}
                    onClick={() => setSelectedRole(role as UserRole)}
                    type="button"
                  >
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")} type="button">
              {selectedRole === "admin" ? "Admin Log In" : "Log In"}
            </button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")} type="button">
              {selectedRole === "admin" ? "Admin Sign Up" : "Sign Up"}
            </button>
          </div>

          {error ? <div className="notice error show">{error}</div> : null}
          {success ? <div className="notice success show">{success}</div> : null}

          {mode === "login" ? (
            <div className="auth-panel active">
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
              {selectedRole === "admin" ? (
                <div className="form-group">
                  <label>Admin Access Code</label>
                  <input
                    className="form-control"
                    inputMode="numeric"
                    maxLength={3}
                    type="password"
                    value={adminCode}
                    onChange={(event) => setAdminCode(event.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="Enter 3-digit code"
                  />
                </div>
              ) : null}
              <div className="form-group">
                <div className="field-top">
                  <label>Password</label>
                  <button className="support-link" onClick={handleReset} type="button">
                    Forgot password?
                  </button>
                </div>
                <input
                  className="form-control"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter your password"
                />
              </div>
              <button className="btn btn-primary auth-primary" onClick={handleLogin} type="button" disabled={busy}>
                {busy ? "Logging in..." : selectedRole === "admin" ? "Open Admin Workspace" : "Log In"}
              </button>
              <div className="separator">or continue with</div>
              <button className="google-btn" onClick={handleGoogle} type="button" disabled={busy}>
                {selectedRole === "admin" ? "Continue as Admin with Google" : "Continue with Google"}
              </button>
            </div>
          ) : (
            <div className="auth-panel active">
              <div className="input-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    className="form-control"
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label>Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    placeholder="Repeat your password"
                  />
                </div>
              </div>
              {selectedRole === "admin" ? (
                <div className="form-group">
                  <label>Admin Access Code</label>
                  <input
                    className="form-control"
                    inputMode="numeric"
                    maxLength={3}
                    type="password"
                    value={adminCode}
                    onChange={(event) => setAdminCode(event.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="Enter 3-digit code"
                  />
                </div>
              ) : null}
              <button className="btn btn-primary auth-primary" onClick={handleRegister} type="button" disabled={busy}>
                {busy ? "Creating account..." : selectedRole === "admin" ? "Create Admin Account" : "Create Account"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
