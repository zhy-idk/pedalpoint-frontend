import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";
import type { Order } from "../../types/order";
import { 
  Eye, 
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

function StaffOrders() {
  const { user } = useAuth();
  const { orders, loading, error, refresh, updateOrderStatus } = useOrders();
  const isSuperuser = user?.is_superuser;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("");
  const [statusReason, setStatusReason] = useState<string>("");

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

  const formatPaymentMethod = (method: string) => {
    const methods: { [key: string]: string } = {
      'cash_on_delivery': 'Cash on Delivery',
      'online_payment': 'Online Payment',
      'gcash': 'GCash',
      'paymaya': 'PayMaya',
      'card': 'Card',
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'dob': 'Digital Banking',
      'qrph': 'QR Ph',
      'grab_pay': 'GrabPay',
    };
    return methods[method] || method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    
    // Check if at least one field has changed
    const statusChanged = newStatus && newStatus !== selectedOrder.status;
    const paymentStatusChanged = newPaymentStatus && newPaymentStatus !== selectedOrder.payment_status;
    
    if (!statusChanged && !paymentStatusChanged) return;
    
    setUpdatingStatus(selectedOrder.id);
    const success = await updateOrderStatus(
      selectedOrder.id, 
      statusChanged ? newStatus : undefined,
      statusReason || undefined,
      paymentStatusChanged ? newPaymentStatus : undefined
    );
    setUpdatingStatus(null);
    
    if (success) {
      // Refresh to get updated order data
      await refresh();
      setSelectedOrder(null);
      setNewStatus("");
      setNewPaymentStatus("");
      setStatusReason("");
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
                <th>Payment Method</th>
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
                    <div className="text-sm">
                      {formatPaymentMethod(order.payment_method)}
                    </div>
                    <div className={`badge badge-xs ${
                      order.payment_status === 'paid' ? 'badge-success' : 
                      order.payment_status === 'failed' ? 'badge-error' : 
                      'badge-warning'
                    }`}>
                      {order.payment_status}
                    </div>
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
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                        setNewPaymentStatus(order.payment_status);
                        setStatusReason("");
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
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
          <div className="modal-box max-w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <p>
                  <strong>Payment Method:</strong> {formatPaymentMethod(selectedOrder.payment_method)}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Payment Status:</strong>
                  <span className={`badge badge-sm ${
                    selectedOrder.payment_status === 'paid' ? 'badge-success' : 
                    selectedOrder.payment_status === 'failed' ? 'badge-error' : 
                    'badge-warning'
                  }`}>
                    {selectedOrder.payment_status}
                  </span>
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

            <div className="bg-base-200 mb-4 rounded-lg p-4">
              <h4 className="mb-3 font-semibold">Update Order Status</h4>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Order Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={updatingStatus === selectedOrder.id}
                >
                  <option value="to_pay">To Pay</option>
                  <option value="to_ship">To Ship</option>
                  <option value="to_deliver">To Deliver</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Payment Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  disabled={updatingStatus === selectedOrder.id}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Show reason box for cancelled or returned */}
              {(newStatus === "cancelled" || newStatus === "returned") && (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">
                      {newStatus === "cancelled" ? 'Cancellation Reason' : 'Return Reason'}
                      {newStatus === "returned" && selectedOrder.return_reason ? ' (Read-only - from customer)' : ''}
                    </span>
                  </label>
                  {newStatus === "returned" && selectedOrder.return_reason ? (
                    <div className="bg-base-100 p-3 rounded border border-base-300">
                      {selectedOrder.return_reason}
                    </div>
                  ) : newStatus === "cancelled" && selectedOrder.cancel_reason ? (
                    <div className="bg-base-100 p-3 rounded border border-base-300">
                      {selectedOrder.cancel_reason}
                    </div>
                  ) : (
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={3}
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder={
                        newStatus === "returned" 
                          ? "Leave empty to auto-fill: Order status override by staff [username]"
                          : "Enter reason for cancellation"
                      }
                      disabled={updatingStatus === selectedOrder.id}
                    />
                  )}
                  {newStatus === "returned" && !selectedOrder.return_reason && (
                    <label className="label">
                      <span className="label-text-alt text-warning">
                        ⚠️ Staff override: Will be recorded as "Order status override by staff {user?.username}"
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={handleUpdateOrderStatus}
                disabled={updatingStatus === selectedOrder.id || (newStatus === selectedOrder.status && newPaymentStatus === selectedOrder.payment_status)}
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
              <button 
                className="btn" 
                onClick={() => {
                  setSelectedOrder(null);
                  setNewStatus("");
                  setNewPaymentStatus("");
                  setStatusReason("");
                }}
                disabled={updatingStatus === selectedOrder.id}
              >
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
