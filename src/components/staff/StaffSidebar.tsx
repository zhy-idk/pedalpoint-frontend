import { NavLink } from "react-router-dom";
import DashboardSVG from "../../assets/dashboard_24dp.svg?react";
import PosSVG from "../../assets/point_of_sale_24dp.svg?react";
import ChatsSVG from "../../assets/chat_24dp.svg?react";
import OrdersSVG from "../../assets/orders_24dp.svg?react";
import ListingsSVG from "../../assets/storefront_24dp.svg?react";
import InventorySVG from "../../assets/inventory_24dp.svg?react";
import QueueSVG from "../../assets/queue.svg?react";
import UserSVG from "../../assets/manage_accounts_24dp.svg?react";
import ReturnSVG from "../../assets/undo_24dp.svg?react";
import { useAuth } from "../../hooks/useAuth";

function StaffSidebar() {
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser;

  return (
    <div className="bg-base-200 flex h-screen w-20 flex-shrink-0 flex-col items-center">
      <ul className="menu rounded-box flex-1 gap-1">
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
        {isSuperuser && (
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
        {isSuperuser && (
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

      {/* Return to User UI Button */}
    </div>
  );
}
export default StaffSidebar;
