import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  requiredPermission?: string;
}

export function ProtectedRoute({ 
  children, 
  requiresAuth = true, 
  requiresAdmin = false,
  requiredPermission
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, hasPermission, user } = useAuth() as any;
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication required but user not authenticated
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Redirect to login if admin access required but user is not admin
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this resource.</p>
        </div>
      </div>
    );
  }

  // Render the protected component
  return <>{children}</>;
}

// Higher-order component for admin routes
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiresAuth={true} requiresAdmin={true}>
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for super admin routes
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiresAuth={true} requiresAdmin={true} requiredPermission="*">
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for permission-based routes
export function PermissionRoute({ 
  children, 
  permission 
}: { 
  children: ReactNode; 
  permission: string; 
}) {
  return (
    <ProtectedRoute requiresAuth={true} requiresAdmin={true} requiredPermission={permission}>
      {children}
    </ProtectedRoute>
  );
}