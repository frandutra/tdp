import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthGetter } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && isAuthGetter) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: 'Debes iniciar sesión para acceder a esta página' }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

