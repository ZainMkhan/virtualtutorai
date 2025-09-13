import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  isAuthenticated, 
  redirectTo = '/login' 
}) => {
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;