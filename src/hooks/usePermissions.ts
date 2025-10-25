import { useAuth } from './useAuth';

export interface Permissions {
  canAccessPOS: boolean;
  canAccessChats: boolean;
  canAccessOrders: boolean;
  canAccessListings: boolean;
  canAccessInventory: boolean;
  canAccessQueueing: boolean;
  canAccessReservations: boolean;
  canAccessSuppliers: boolean;
  canAccessSales: boolean;
  canAccessUserManagement: boolean;
  canAccessDashboard: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();

  // Superusers have access to everything
  if (user?.is_superuser) {
    return {
      canAccessPOS: true,
      canAccessChats: true,
      canAccessOrders: true,
      canAccessListings: true,
      canAccessInventory: true,
      canAccessQueueing: true,
      canAccessReservations: true,
      canAccessSuppliers: true,
      canAccessSales: true,
      canAccessUserManagement: true,
      canAccessDashboard: true,
    };
  }

  // Regular staff members check their permissions
  if (user?.is_staff && user?.staff_permissions) {
    const perms = user.staff_permissions;
    return {
      canAccessPOS: perms.can_access_pos ?? true,
      canAccessChats: perms.can_access_chats ?? true,
      canAccessOrders: perms.can_access_orders ?? true,
      canAccessListings: perms.can_access_listings ?? true,
      canAccessInventory: perms.can_access_inventory ?? true,
      canAccessQueueing: perms.can_access_queueing ?? true,
      canAccessReservations: perms.can_access_reservations ?? true,
      canAccessSuppliers: perms.can_access_suppliers ?? true,
      canAccessSales: false, // Only superusers
      canAccessUserManagement: false, // Only superusers
      canAccessDashboard: true, // All staff can see dashboard
    };
  }

  // Non-staff users have no access
  return {
    canAccessPOS: false,
    canAccessChats: false,
    canAccessOrders: false,
    canAccessListings: false,
    canAccessInventory: false,
    canAccessQueueing: false,
    canAccessReservations: false,
    canAccessSuppliers: false,
    canAccessSales: false,
    canAccessUserManagement: false,
    canAccessDashboard: false,
  };
};

