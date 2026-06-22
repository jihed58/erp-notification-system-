import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute with optional role-based access control.
 * Usage:
 *   <ProtectedRoute>               — any authenticated user
 *   <ProtectedRoute roles={['erp_manager']}>  — ERP Manager only
 *   <ProtectedRoute roles={['erp_manager', 'admin']}> — Manager or Admin
 */
function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check that the user has one of the required roles
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;