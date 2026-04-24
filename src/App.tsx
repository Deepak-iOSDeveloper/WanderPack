import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LandingPage = lazy(async () => import("./pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const AuthPage = lazy(async () => import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const AdminAuthPage = lazy(async () =>
  import("./pages/AdminAuthPage").then((module) => ({ default: module.AdminAuthPage })),
);
const AssistantPage = lazy(async () =>
  import("./pages/AssistantPage").then((module) => ({ default: module.AssistantPage })),
);
const DashboardPage = lazy(async () =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const ExplorePage = lazy(async () => import("./pages/ExplorePage").then((module) => ({ default: module.ExplorePage })));
const CreatePostPage = lazy(async () =>
  import("./pages/CreatePostPage").then((module) => ({ default: module.CreatePostPage })),
);
const IndiaProductPage = lazy(async () =>
  import("./pages/IndiaProductPage").then((module) => ({ default: module.IndiaProductPage })),
);
const OffersPage = lazy(async () => import("./pages/OffersPage").then((module) => ({ default: module.OffersPage })));
const BookingsPage = lazy(async () =>
  import("./pages/BookingsPage").then((module) => ({ default: module.BookingsPage })),
);
const BookingVaultPage = lazy(async () =>
  import("./pages/BookingVaultPage").then((module) => ({ default: module.BookingVaultPage })),
);
const WishlistPage = lazy(async () =>
  import("./pages/WishlistPage").then((module) => ({ default: module.WishlistPage })),
);
const SupportPage = lazy(async () => import("./pages/SupportPage").then((module) => ({ default: module.SupportPage })));
const ServiceRequestPage = lazy(async () =>
  import("./pages/ServiceRequestPage").then((module) => ({ default: module.ServiceRequestPage })),
);
const ProfilePage = lazy(async () => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const TripPage = lazy(async () => import("./pages/TripPage").then((module) => ({ default: module.TripPage })));
const NotificationsPage = lazy(async () =>
  import("./pages/NotificationsPage").then((module) => ({ default: module.NotificationsPage })),
);
const SettingsPage = lazy(async () =>
  import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);
const AdminPage = lazy(async () => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const AdminProfilePage = lazy(async () =>
  import("./pages/AdminProfilePage").then((module) => ({ default: module.AdminProfilePage })),
);

export default function App() {
  return (
    <Suspense fallback={<div className="page-loader">Loading WanderPack...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin-auth" element={<AdminAuthPage />} />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/india/:product"
          element={
            <ProtectedRoute>
              <IndiaProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedRoute>
              <OffersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-vault"
          element={
            <ProtectedRoute>
              <BookingVaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/:service"
          element={
            <ProtectedRoute>
              <ServiceRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:uid"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip"
          element={
            <ProtectedRoute>
              <TripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <TripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute adminOnly>
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
