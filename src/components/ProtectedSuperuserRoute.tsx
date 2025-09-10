import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedSuperuserRouteProps {
  children: React.ReactNode;
}

const ProtectedSuperuserRoute: React.FC<ProtectedSuperuserRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if user is not a superuser
  if (!user.is_superuser) {
    return <Navigate to="/manage" replace />;
  }

  // Render children if user is a superuser
  return <>{children}</>;
};

export default ProtectedSuperuserRoute;
