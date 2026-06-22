import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import DashboardPage from './pages/DashboardPage';
import CreateAlertPage from './pages/CreateAlertPage';
import UserManagementPage from './pages/UserManagementPage';
import DepartmentPage from './pages/DepartmentPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          {/* Routes protégées — tous les utilisateurs authentifiés */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts/create"
            element={
              <ProtectedRoute>
                <CreateAlertPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts/edit/:id"
            element={
              <ProtectedRoute>
                <CreateAlertPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
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

          {/* Routes Admin (Department Chef) */}
          <Route
            path="/admin/department"
            element={
              <ProtectedRoute roles={['erp_manager', 'admin']}>
                <DepartmentPage />
              </ProtectedRoute>
            }
          />

          {/* Routes ERP Manager uniquement */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['erp_manager']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;