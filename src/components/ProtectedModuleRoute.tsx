import { usePermissions } from '../hooks/usePermissions';
import { LockKeyhole } from 'lucide-react';

interface ProtectedModuleRouteProps {
  children: React.ReactNode;
  module: 'pos' | 'chats' | 'orders' | 'listings' | 'inventory' | 'queueing' | 'reservations' | 'suppliers' | 'sales' | 'users' | 'audit';
  fallbackPath?: string;
}

function ProtectedModuleRoute({ children, module, fallbackPath = '/manage' }: ProtectedModuleRouteProps) {
  const permissions = usePermissions();

  // Map module names to permission checks
  const hasAccess = (() => {
    switch (module) {
      case 'pos': return permissions.canAccessPOS;
      case 'chats': return permissions.canAccessChats;
      case 'orders': return permissions.canAccessOrders;
      case 'listings': return permissions.canAccessListings;
      case 'inventory': return permissions.canAccessInventory;
      case 'queueing': return permissions.canAccessQueueing;
      case 'reservations': return permissions.canAccessReservations;
      case 'suppliers': return permissions.canAccessSuppliers;
      case 'sales': return permissions.canAccessSales;
      case 'users': return permissions.canAccessUserManagement;
      case 'audit': return permissions.canAccessAuditLog;
      default: return false;
    }
  })();

  if (!hasAccess) {
    return (
      <div className="bg-base-200 min-h-screen flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-error/20 rounded-full p-4">
                <LockKeyhole className="h-12 w-12 text-error" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl mb-2">
              Access Denied
            </h2>
            <p className="text-base-content/70">
              You don't have permission to access this module.
            </p>
            <p className="text-sm text-base-content/60 mt-2">
              Contact your administrator if you believe this is an error.
            </p>
            <div className="card-actions justify-center mt-6">
              <button 
                onClick={() => window.location.href = fallbackPath}
                className="btn btn-primary"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedModuleRoute;

