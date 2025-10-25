import { useState, useEffect, useMemo } from "react";
import { Clock, Package, User, Calendar, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import api from "../../api";

interface Reservation {
  id: number;
  product: {
    id: number;
    name: string;
    variant_attribute: string | null;
    brand: { name: string } | null;
    stock: number;
    price: string;
    product_listing: { name: string; image: string } | null;
  };
  user: {
    id: number;
    username: string;
    email: string;
  };
  status: 'waiting' | 'active' | 'expired' | 'fulfilled' | 'cancelled';
  queue_position: number;
  created_at: string;
  reserved_at: string | null;
  expires_at: string | null;
  fulfilled_at: string | null;
  cancelled_at: string | null;
  time_remaining: {
    days: number;
    hours: number;
    total_seconds: number;
  } | null;
}

function StaffReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/reservations/all/');
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesSearch =
        reservation.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.product.variant_attribute?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting: { color: "badge-info", icon: Clock, text: "Waiting" },
      active: { color: "badge-success", icon: CheckCircle, text: "Active" },
      expired: { color: "badge-warning", icon: AlertCircle, text: "Expired" },
      fulfilled: { color: "badge-success", icon: CheckCircle, text: "Fulfilled" },
      cancelled: { color: "badge-error", icon: XCircle, text: "Cancelled" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <span className="badge">{status}</span>;
    
    const Icon = config.icon;

    return (
      <span className={`badge ${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCounts = () => {
    return {
      total: reservations.length,
      waiting: reservations.filter(r => r.status === 'waiting').length,
      active: reservations.filter(r => r.status === 'active').length,
      expired: reservations.filter(r => r.status === 'expired').length,
      fulfilled: reservations.filter(r => r.status === 'fulfilled').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Reservations</h1>
          <p className="text-base-content/70">
            Manage customer product reservation queue
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchReservations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Status Overview */}
      <div className="stats stats-horizontal shadow w-full bg-base-100">
        <div className="stat">
          <div className="stat-title">Total</div>
          <div className="stat-value text-primary">{statusCounts.total}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Waiting</div>
          <div className="stat-value text-info">{statusCounts.waiting}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Active</div>
          <div className="stat-value text-success">{statusCounts.active}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Expired</div>
          <div className="stat-value text-warning">{statusCounts.expired}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Fulfilled</div>
          <div className="stat-value text-success">{statusCounts.fulfilled}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <div className="flex flex-wrap gap-4">
            <div className="form-control flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by customer, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-base-content/70 mt-2">
            Showing {filteredReservations.length} of {reservations.length} reservations
          </div>
        </div>
      </div>

      {/* Reservations by Product */}
      <div className="space-y-4">
        {Object.entries(
          filteredReservations.reduce((acc, reservation) => {
            const productKey = reservation.product.id;
            if (!acc[productKey]) {
              acc[productKey] = [];
            }
            acc[productKey].push(reservation);
            return acc;
          }, {} as Record<number, Reservation[]>)
        ).map(([productId, productReservations]) => {
          const firstReservation = productReservations[0];
          const product = firstReservation.product;
          
          return (
            <div key={productId} className="card bg-base-100 border border-base-300">
              <div className="card-body">
                {/* Product Header */}
                <div className="flex items-start gap-4 mb-4">
                  {product.product_listing?.image && (
                    <img 
                      src={product.product_listing.image} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {product.product_listing?.name || product.name}
                    </h3>
                    <div className="text-sm text-base-content/70">
                      {product.variant_attribute && <span className="mr-2">• {product.variant_attribute}</span>}
                      {product.brand?.name && <span className="mr-2">• {product.brand.name}</span>}
                      <span>• Stock: {product.stock}</span>
                      <span className="ml-2">• Price: ₱{parseFloat(product.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="badge badge-lg badge-primary">
                    {productReservations.length} {productReservations.length === 1 ? 'Reservation' : 'Reservations'}
                  </div>
                </div>

                {/* Reservation Queue */}
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Queue #</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Reserved/Expires</th>
                        <th>Time Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productReservations
                        .sort((a, b) => a.queue_position - b.queue_position)
                        .map((reservation) => (
                          <tr key={reservation.id} className={reservation.status === 'active' ? 'bg-success/10' : ''}>
                            <td>
                              <div className="font-semibold">#{reservation.queue_position}</div>
                            </td>
                            <td>
                              <div>
                                <div className="font-medium">{reservation.user.username}</div>
                                <div className="text-xs text-base-content/60">{reservation.user.email}</div>
                              </div>
                            </td>
                            <td>{getStatusBadge(reservation.status)}</td>
                            <td className="text-xs">{formatDateTime(reservation.created_at)}</td>
                            <td className="text-xs">
                              {reservation.status === 'active' ? (
                                <div>
                                  <div className="font-semibold text-success">Reserved: {formatDateTime(reservation.reserved_at)}</div>
                                  <div className="text-error">Expires: {formatDateTime(reservation.expires_at)}</div>
                                </div>
                              ) : (
                                <span className="text-base-content/50">-</span>
                              )}
                            </td>
                            <td>
                              {reservation.time_remaining ? (
                                <div className="badge badge-warning">
                                  {reservation.time_remaining.days}d {reservation.time_remaining.hours}h
                                </div>
                              ) : (
                                <span className="text-base-content/50">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No reservations found</h3>
            <p className="text-base-content/70">
              {searchTerm || statusFilter !== "all"
                ? "No reservations match your filters."
                : "No product reservations yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffReservations;
