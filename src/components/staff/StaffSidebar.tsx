import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import DashboardSVG from "../../assets/dashboard_24dp.svg?react";
import PosSVG from "../../assets/point_of_sale_24dp.svg?react";
import ChatsSVG from "../../assets/chat_24dp.svg?react";
import OrdersSVG from "../../assets/orders_24dp.svg?react";
import ListingsSVG from "../../assets/storefront_24dp.svg?react";
import InventorySVG from "../../assets/inventory_24dp.svg?react";
import QueueSVG from "../../assets/queue.svg?react";
import UserSVG from "../../assets/manage_accounts_24dp.svg?react";
import ReturnSVG from "../../assets/undo_24dp.svg?react";
import ReserveSVG from "../../assets/bookmarks_24dp.svg?react";
import SalesSVG from "../../assets/finance_24dp.svg?react";
import SupplierSVG from "../../assets/pallet_24dp.svg?react";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

function StaffSidebar() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = (
    <ul className="menu rounded-box flex-1 gap-1">
        {/* Dashboard - Always visible to all staff */}
        {permissions.canAccessDashboard && (
          <li>
            <NavLink
              to="/manage"
              className={({ isActive, isPending }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive && !isPending ? "bg-neutral-400/15" : ""}`
              }
              end
              data-tip="Dashboard"
            >
              <DashboardSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Sales - Superuser only */}
        {permissions.canAccessSales && (
          <li>
            <NavLink
              to="/manage/sales"
              className={({ isActive, isPending }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive && !isPending ? "bg-neutral-400/15" : ""}`
              }
              end
              data-tip="Sales"
            >
              <SalesSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* POS */}
        {permissions.canAccessPOS && (
          <li>
            <NavLink
              to="/manage/pos"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Point Of Sale"
            >
              <PosSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Chats */}
        {permissions.canAccessChats && (
          <li>
            <NavLink
              to="/manage/chats"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Chats"
            >
              <ChatsSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Orders */}
        {permissions.canAccessOrders && (
          <li>
            <NavLink
              to="/manage/orders"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Orders"
            >
              <OrdersSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Listings */}
        {permissions.canAccessListings && (
          <li>
            <NavLink
              to="/manage/listings"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Product Listings"
            >
              <ListingsSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Inventory */}
        {permissions.canAccessInventory && (
          <li>
            <NavLink
              to="/manage/inventory"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Inventory"
            >
              <InventorySVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Suppliers */}
        {permissions.canAccessSuppliers && (
          <li>
            <NavLink
              to="/manage/suppliers"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Suppliers"
            >
              <SupplierSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Reservations */}
        {permissions.canAccessReservations && (
          <li>
            <NavLink
              to="/manage/reservations"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Reservations"
            >
              <ReserveSVG width={35} height={35} />
            </NavLink>
          </li>
        )}
        
        {/* Service Queue */}
        {permissions.canAccessQueueing && (
          <li>
            <NavLink
              to="/manage/queueing"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="Service Queue"
            >
              <QueueSVG
                width={35}
                height={35}
                fill="#e3e3e3"
                stroke="#e3e3e3"
                strokeWidth={5}
              />
            </NavLink>
          </li>
        )}
        
        {/* User Management - Superuser only */}
        {permissions.canAccessUserManagement && (
          <li>
            <NavLink
              to="/manage/users"
              className={({ isActive }) =>
                `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
              }
              data-tip="User Management"
            >
              <UserSVG
                width={35}
                height={35}
                fill="#e3e3e3"
                stroke="#e3e3e3"
                strokeWidth={5}
              />
            </NavLink>
          </li>
        )}
        
        {/* Return to Customer UI - Always visible */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `tooltip tooltip-right flex items-center justify-center ${isActive ? "bg-neutral-400/15" : ""}`
            }
            data-tip="Return to Customer UI"
          >
            <ReturnSVG width={35} height={35} />
          </NavLink>
        </li>
      </ul>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 btn btn-circle btn-primary"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar for desktop (always visible on md and up) */}
      <div className="hidden md:flex bg-base-200 h-screen w-20 flex-shrink-0 flex-col items-center">
        {navItems}
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile drawer sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 h-screen w-64 bg-base-200 z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-20">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          {navItems}
        </div>
      </div>
    </>
  );
}
export default StaffSidebar;
