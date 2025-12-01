import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/authService"; // import the default export

export default function ProtectedRoute() {
  
  const isAuthenticated = authService.isAuthenticated();

  return isAuthenticated 
    ? <Outlet /> 
    : <Navigate to="/admin-login" replace />;  // redirect admin to login page
}
