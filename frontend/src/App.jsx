
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Vehicles from "./pages/Vehicles";
import Services from "./pages/Services";
import Mechanics from "./pages/Mechanics";
import SpareParts from "./pages/SpareParts";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CustomerPortal from "./pages/CustomerPortal";

function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="auth-loading">Checking your session...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/dashboard" : "/customer-portal"} replace />;
  }

  return children;
}

function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="auth-loading">Checking your session...</div>;
  if (!user) return <Login />;
  return <Navigate to={user.role === "admin" ? "/dashboard" : "/customer-portal"} replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/dashboard" element={<RoleRoute role="admin"><Dashboard /></RoleRoute>} />
        <Route path="/customers" element={<RoleRoute role="admin"><Customers /></RoleRoute>} />
        <Route path="/vehicles" element={<RoleRoute role="admin"><Vehicles /></RoleRoute>} />
        <Route path="/services" element={<RoleRoute role="admin"><Services /></RoleRoute>} />
        <Route path="/mechanics" element={<RoleRoute role="admin"><Mechanics /></RoleRoute>} />
        <Route path="/spare-parts" element={<RoleRoute role="admin"><SpareParts /></RoleRoute>} />
        <Route path="/billing" element={<RoleRoute role="admin"><Billing /></RoleRoute>} />
        <Route path="/reports" element={<RoleRoute role="admin"><Reports /></RoleRoute>} />
        <Route path="/settings" element={<RoleRoute role="admin"><Settings /></RoleRoute>} />
        <Route path="/customer-portal" element={<RoleRoute role="customer"><CustomerPortal /></RoleRoute>} />
        <Route path="*" element={<HomeRoute />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
