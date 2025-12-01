import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import VisitorCheckInForm from "./components/VisitorCheckInForm";
import VirtualVisitorPass from "./components/VirtualVisitorPass";
import AdminDashboardLayout from "./components/AdminDashboardLayout";
import PendingApprovalsTable from "./components/PendingApprovalsTable";
import AdminLoginModal from "./components/AdminLoginModal";
import Reports from "./components/Reports";
import SecurityConsole from "./components/SecurityConsole";
import DashboardHome from "./components/DashboardHome";
import Settings from "./components/Settings";



function App() {
  return (
    <Router>
      <Routes>

        {/* Public */}
        <Route path="/" element={<VisitorCheckInForm />} />
        <Route path="/pass" element={<VirtualVisitorPass />} />

        {/* Admin Login Modal Route */}
        <Route
          path="/admin-login"
          element={
            <AdminLoginModal
              isOpen={true}
              onClose={() => (window.location.href = "/")}
              onLoginSuccess={() => (window.location.href = "/admin")}
            />
          }
        />

        {/* Protected Admin Section */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="approvals" element={<PendingApprovalsTable />} />
            <Route path="security" element={<SecurityConsole />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* If unknown → go home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
