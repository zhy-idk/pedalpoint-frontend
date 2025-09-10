import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";
import { 
  Eye, 
  MoreVertical, 
  AlertCircle,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  XCircle
} from "lucide-react";

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number | string;
    variant_attribute: string;
    images?: Array<{
      image: string;
      alt_text?: string;
    }>;
  };
  quantity: number;
}

interface Order {
  id: number;
  user: {
    username: string;
  };
  created_at: string;
  status: 'to_pay' | 'to_ship' | 'to_deliver' | 'completed' | 'cancelled' | 'returned';
  shipping_address?: string;
  contact_number?: string;
  notes?: string;
  items: OrderItem[];
}

function StaffOrders() {
  const { user } = useAuth();
  const { orders, loading, error, refresh, updateOrderStatus } = useOrders();
  const isSuperuser = user?.is_superuser;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      to_pay: "badge-warning",
      to_ship: "badge-info",
      to_deliver: "badge-primary",
      completed: "badge-success",
      cancelled: "badge-error",
      returned: "badge-secondary",
    };
    return `badge ${statusClasses[status as keyof typeof statusClasses]}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'to_pay':
        return <AlertCircle className="h-4 w-4" />;
      case 'to_ship':
        return <Package className="h-4 w-4" />;
      case 'to_deliver':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'returned':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
  };

  const calculateOrderItems = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      (order.shipping_address && order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    const success = await updateOrderStatus(orderId, newStatus);
    setUpdatingStatus(null);
    
    if (success) {
      // Update the selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
      }
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-base-200 min-h-screen p-6">
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Loading Orders...</h1>
          <p className="text-base-content/70">Please wait while we fetch your orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base-content mb-2 text-3xl font-bold">
              Order Management
            </h1>
            <p className="text-base-content/70">
              Manage and track all customer orders
            </p>
          </div>
          <button
            onClick={refresh}
            className="btn btn-outline btn-sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="alert alert-error mt-4">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load orders: {error}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value text-primary">{orders.length}</div>
          <div className="stat-desc">All time orders</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">To Pay</div>
          <div className="stat-value text-warning">
            {orders.filter((o) => o.status === "to_pay").length}
          </div>
          <div className="stat-desc">Awaiting payment</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">To Ship</div>
          <div className="stat-value text-info">
            {orders.filter((o) => o.status === "to_ship").length}
          </div>
          <div className="stat-desc">Ready to ship</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">To Deliver</div>
          <div className="stat-value text-primary">
            {orders.filter((o) => o.status === "to_deliver").length}
          </div>
          <div className="stat-desc">Out for delivery</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-success">
            {orders.filter((o) => o.status === "completed").length}
          </div>
          <div className="stat-desc">Successfully delivered</div>
        </div>
        {isSuperuser && (
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Revenue</div>
            <div className="stat-value text-success">
              ${orders.reduce((sum, o) => sum + calculateOrderTotal(o.items), 0).toFixed(2)}
            </div>
            <div className="stat-desc">Total earnings</div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-base-100 rounded-box mb-6 p-4 shadow">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
            <div className="form-control">
              <input
                type="text"
                placeholder="Search orders..."
                className="input input-bordered w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select select-bordered w-full max-w-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="to_pay">To Pay</option>
              <option value="to_ship">To Ship</option>
              <option value="to_deliver">To Deliver</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Export Orders
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-base-100 rounded-box overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="table-zebra table w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                {isSuperuser && <th>Total</th>}
                <th>Status</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover">
                  <td>
                    <div className="font-bold">#{order.id}</div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content h-8 w-8 rounded-full">
                          <span className="text-xs">
                            {order.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{order.user.username}</div>
                        {order.contact_number && (
                          <div className="text-sm opacity-50">{order.contact_number}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{calculateOrderItems(order.items)} items</td>
                  {isSuperuser && (
                    <td className="font-semibold">${calculateOrderTotal(order.items).toFixed(2)}</td>
                  )}
                  <td>
                    <span className={`${getStatusBadge(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.contact_number ? (
                      <span className="text-sm">{order.contact_number}</span>
                    ) : (
                      <span className="text-sm opacity-50">No contact</span>
                    )}
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-sm btn-ghost"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                        >
                          {order.status !== "to_ship" && (
                            <li>
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "to_ship")
                                }
                                disabled={updatingStatus === order.id}
                                className="w-full text-left"
                              >
                                {updatingStatus === order.id ? (
                                  <div className="loading loading-spinner loading-xs"></div>
                                ) : (
                                  "Mark as To Ship"
                                )}
                              </button>
                            </li>
                          )}
                          {order.status !== "to_deliver" && (
                            <li>
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "to_deliver")
                                }
                                disabled={updatingStatus === order.id}
                                className="w-full text-left"
                              >
                                {updatingStatus === order.id ? (
                                  <div className="loading loading-spinner loading-xs"></div>
                                ) : (
                                  "Mark as To Deliver"
                                )}
                              </button>
                            </li>
                          )}
                          {order.status !== "completed" && (
                            <li>
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "completed")
                                }
                                disabled={updatingStatus === order.id}
                                className="w-full text-left"
                              >
                                {updatingStatus === order.id ? (
                                  <div className="loading loading-spinner loading-xs"></div>
                                ) : (
                                  "Mark as Completed"
                                )}
                              </button>
                            </li>
                          )}
                          {(order.status === "to_pay" || order.status === "to_ship") && (
                            <li>
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "cancelled")
                                }
                                disabled={updatingStatus === order.id}
                                className="w-full text-left text-error"
                              >
                                Cancel Order
                              </button>
                            </li>
                          )}
                          <li>
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "returned")
                              }
                              disabled={updatingStatus === order.id}
                              className="w-full text-left"
                            >
                              Mark as Returned
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl opacity-20">📦</div>
            <h3 className="mb-2 text-lg font-semibold">No orders found</h3>
            <p className="text-base-content/60">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <div className="btn-group">
          <button className="btn">«</button>
          <button className="btn btn-active">1</button>
          <button className="btn">2</button>
          <button className="btn">3</button>
          <button className="btn">»</button>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </form>

            <h3 className="mb-4 text-lg font-bold">
              Order Details - #{selectedOrder.id}
            </h3>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="mb-2 font-semibold">Customer Information</h4>
                <p>
                  <strong>Username:</strong> {selectedOrder.user.username}
                </p>
                {selectedOrder.contact_number && (
                  <p>
                    <strong>Contact:</strong> {selectedOrder.contact_number}
                  </p>
                )}
                {selectedOrder.shipping_address && (
                  <p>
                    <strong>Address:</strong> {selectedOrder.shipping_address}
                  </p>
                )}
                {selectedOrder.notes && (
                  <p>
                    <strong>Notes:</strong> {selectedOrder.notes}
                  </p>
                )}
              </div>

              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="mb-2 font-semibold">Order Summary</h4>
                <p>
                  <strong>Items:</strong> {calculateOrderItems(selectedOrder.items)}
                </p>
                {isSuperuser && (
                  <p>
                    <strong>Total:</strong> ${calculateOrderTotal(selectedOrder.items).toFixed(2)}
                  </p>
                )}
                <p>
                  <strong>Date:</strong> {formatDate(selectedOrder.created_at)}
                </p>
                <div className="mt-2">
                  <span className={`${getStatusBadge(selectedOrder.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {isSuperuser && (
              <div className="bg-base-200 mb-4 rounded-lg p-4">
                <h4 className="mb-3 font-semibold">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="bg-base-100 flex items-center justify-between rounded p-2">
                      <div className="flex items-center gap-3">
                        {item.product.images && item.product.images.length > 0 && (
                          <div className="avatar">
                            <div className="w-8 h-8 rounded">
                              <img 
                                src={item.product.images[0].image} 
                                alt={item.product.images[0].alt_text || item.product.name}
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{item.product.name}</span>
                          {item.product.variant_attribute && (
                            <div className="text-xs text-base-content/70">
                              {item.product.variant_attribute}
                            </div>
                          )}
                        </div>
                      </div>
                      <span>Qty: {item.quantity} × ${Number(item.product.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-action">
              <select
                className="select select-bordered mr-4"
                value={selectedOrder.status}
                onChange={(e) =>
                  handleUpdateOrderStatus(selectedOrder.id, e.target.value)
                }
                disabled={updatingStatus === selectedOrder.id}
              >
                <option value="to_pay">To Pay</option>
                <option value="to_ship">To Ship</option>
                <option value="to_deliver">To Deliver</option>
                <option value="completed">Completed</option>
                {(selectedOrder.status === "to_pay" || selectedOrder.status === "to_ship") && (
                  <option value="cancelled">Cancelled</option>
                )}
                <option value="returned">Returned</option>
              </select>
              <button 
                className="btn btn-primary"
                disabled={updatingStatus === selectedOrder.id}
              >
                {updatingStatus === selectedOrder.id ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
              <button className="btn" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffOrders;
