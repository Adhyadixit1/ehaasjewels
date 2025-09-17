import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: Array<'customer' | 'admin' | 'super_admin'>;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export function RouteGuard({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallbackPath = '/admin/login'
}: RouteGuardProps) {
  const { user, isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Insufficient Role</h2>
          <p className="text-muted-foreground">Access denied for your role.</p>
        </div>
      </div>
    );
  }

  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Permission Denied</h2>
            <p className="text-muted-foreground">Insufficient permissions.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export function AdminOnlyRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin', 'super_admin']}>
      {children}
    </RouteGuard>
  );
}