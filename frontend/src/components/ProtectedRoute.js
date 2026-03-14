import { Navigate } from 'react-router-dom';
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // If content exists redirect to protected content 
  return children;
}
export default ProtectedRoute;