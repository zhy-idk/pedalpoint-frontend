import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useSales } from "../../hooks/useSales";
import { useOrders } from "../../hooks/useOrders";
import { useServiceQueue } from "../../hooks/useServiceQueue";
import { useInventoryWebSocket } from "../../hooks/useInventoryWebSocket";
import {
  MessageCircle,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Activity,
  RefreshCw,
  LockKeyhole,
} from "lucide-react";

function StaffDashboard() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();
  
  // Real-time data hooks - only fetch data for modules the user can access
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboardData();
  const { sales, loading: salesLoading, refresh: refreshSales } = permissions.canAccessSales ? useSales() : { sales: [], loading: false, refresh: async () => {} };
  const { orders, loading: ordersLoading, refresh: refreshOrders } = permissions.canAccessOrders ? useOrders() : { orders: [], loading: false, refresh: async () => {} };
  const { queueItems, loading: queueLoading, refresh: refreshQueue } = permissions.canAccessQueueing ? useServiceQueue() : { queueItems: [], loading: false, refresh: async () => {} };
  const { inventory, isConnected: inventoryConnected, refreshInventory } = permissions.canAccessInventory ? useInventoryWebSocket() : { inventory: [], isConnected: false, refreshInventory: () => {} };
  
  const isSuperuser = user?.is_superuser;
  const isStaff = user?.is_staff;

  // Real-time data for immediate dashboard
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Filter today's sales
  const todaySales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.sale_date).toISOString().split('T')[0];
      return saleDate === todayString;
    }).slice(0, 5); // Show latest 5
  }, [sales, todayString]);

  // Calculate today's revenue
  const todayRevenue = useMemo(() => {
    return todaySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  }, [todaySales]);

  // Filter pending orders (to_pay, to_ship statuses)
  const pendingOrders = useMemo(() => {
    return orders.filter(order => 
      order.status === 'to_pay' || order.status === 'to_ship' || order.status === 'to_deliver'
    ).slice(0, 5); // Show latest 5
  }, [orders]);

  // Today's service queue
  const todayQueue = useMemo(() => {
    return queueItems.filter(item => {
      const queueDate = new Date(item.queue_date).toISOString().split('T')[0];
      return queueDate === todayString;
    });
  }, [queueItems, todayString]);

  // Low stock items (threshold: 5 or less)
  const LOW_STOCK_THRESHOLD = 5;
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.stock <= LOW_STOCK_THRESHOLD && item.available);
  }, [inventory]);

  // Build recent activity from sales and orders
  const recentActivity = useMemo(() => {
    const activities: any[] = [];
    
    // Add recent sales
    todaySales.slice(0, 3).forEach(sale => {
      activities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        description: `New sale to ${sale.user?.username || 'Walk-in Customer'}`,
        time: new Date(sale.sale_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        amount: Number(sale.total_amount)
      });
    });
    
    // Add recent orders
    pendingOrders.slice(0, 2).forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        description: `Order #${order.id} - ${order.status}`,
        time: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        amount: 0
      });
    });
    
    return activities.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 4);
  }, [todaySales, pendingOrders]);

  // Build urgent tasks
  const urgentTasks = useMemo(() => {
    const tasks: any[] = [];
    
    // Add low stock alerts
    lowStockItems.slice(0, 3).forEach(item => {
      tasks.push({
        id: `stock-${item.id}`,
        type: 'Low Stock Alert',
        item: item.name,
        stock: item.stock,
        threshold: LOW_STOCK_THRESHOLD,
        priority: item.stock === 0 ? 'urgent' : item.stock <= 2 ? 'high' : 'medium'
      });
    });
    
    // Add pending queue items
    todayQueue.filter(q => q.status === 'pending').slice(0, 2).forEach(item => {
      tasks.push({
        id: `queue-${item.id}`,
        type: 'Service Queue',
        customer: item.user ? (`${item.user.first_name} ${item.user.last_name}`.trim() || item.user.username) : 'Unknown Customer',
        service: item.info.substring(0, 30) + (item.info.length > 30 ? '...' : ''),
        time: new Date(item.queue_date).toLocaleDateString(),
        priority: 'high'
      });
    });
    
    return tasks.slice(0, 5);
  }, [lowStockItems, todayQueue, LOW_STOCK_THRESHOLD]);

  // Refresh all data
  const handleRefreshAll = async () => {
    await Promise.all([
      refreshDashboard(),
      refreshSales(),
      refreshOrders(),
      refreshQueue(),
      refreshInventory()
    ]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      urgent: "badge-error",
      high: "badge-warning", 
      medium: "badge-info",
      low: "badge-neutral"
    };
    return `badge ${priorityClasses[priority as keyof typeof priorityClasses]} badge-sm`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign className="h-4 w-4 text-success" />;
      case 'order': return <Package className="h-4 w-4 text-info" />;
      case 'service': return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <Activity className="h-4 w-4 text-base-content/70" />;
    }
  };

  return (
    <div className="bg-base-200 h-full space-y-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base-content text-3xl font-bold">
            PedalPoint Dashboard
          </h1>
          <p className="text-base-content/70 text-sm">
            {today.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {inventoryConnected && (
            <div className="badge badge-success gap-1">
              <div className="w-2 h-2 rounded-full bg-success-content animate-pulse"></div>
              Real-time
            </div>
          )}
          <button 
            className="btn btn-sm btn-outline gap-2"
            onClick={handleRefreshAll}
            disabled={dashboardLoading || salesLoading || ordersLoading || queueLoading}
          >
            <RefreshCw className={`h-4 w-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {(dashboardError || !isStaff) && (
        <div className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <span>{dashboardError || 'You need staff permissions to view this dashboard'}</span>
        </div>
      )}

      {/* Today's Immediate Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales - Only for users with sales access */}
        {permissions.canAccessSales && (
          <div className="card bg-base-100 border-l-success border-l-4 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-success/20 rounded-full p-2">
                  <ShoppingCart className="text-success h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Today's Sales</h3>
                  <p className="text-base-content/70 text-sm">
                    {todaySales.length} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-success text-2xl font-bold">
                  {salesLoading ? '...' : formatPrice(todayRevenue)}
                </div>
                <div className="text-sm text-base-content/70">
                  {todaySales.length} sales
                </div>
              </div>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-success btn-sm"
                onClick={() => navigate("/manage/sales")}
              >
                View Sales
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Pending Orders - Only for users with orders access */}
        {permissions.canAccessOrders && (
          <div className="card bg-base-100 border-l-warning border-l-4 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-warning/20 rounded-full p-2">
                  <Clock className="text-warning h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Pending Orders</h3>
                  <p className="text-base-content/70 text-sm">
                    Needs attention
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-warning text-2xl font-bold">
                  {ordersLoading ? '...' : pendingOrders.length}
                </div>
                <div className="text-sm text-base-content/70">
                  Pending action
                </div>
              </div>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-warning btn-sm"
                onClick={() => navigate("/manage/orders")}
              >
                View Orders
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Service Queue - Only for users with queueing access */}
        {permissions.canAccessQueueing && (
          <div className="card bg-base-100 border-l-info border-l-4 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-info/20 rounded-full p-2">
                  <CheckCircle className="text-info h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Service Queue</h3>
                  <p className="text-base-content/70 text-sm">
                    Active services
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-info text-2xl font-bold">
                  {queueLoading ? '...' : todayQueue.filter(q => q.status === 'pending').length}
                </div>
                <div className="text-sm text-base-content/70">
                  Pending today
                </div>
              </div>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-info btn-sm"
                onClick={() => navigate("/manage/queueing")}
              >
                View Queue
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Low Stock Alerts - Only for users with inventory access */}
        {permissions.canAccessInventory && (
          <div className="card bg-base-100 border-l-error border-l-4 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-error/20 rounded-full p-2">
                  <AlertCircle className="text-error h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Low Stock</h3>
                  <p className="text-base-content/70 text-sm">
                    Restock needed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-error text-2xl font-bold">
                  {lowStockItems.length}
                </div>
                <div className="text-sm text-base-content/70">
                  Items low
                </div>
              </div>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-error btn-sm"
                onClick={() => navigate("/manage/inventory")}
              >
                View Inventory
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* No Access Message */}
      {!permissions.canAccessSales && !permissions.canAccessOrders && !permissions.canAccessQueueing && !permissions.canAccessInventory && (
        <div className="alert alert-warning">
          <LockKeyhole className="h-5 w-5" />
          <div>
            <div className="font-bold">Limited Access</div>
            <div className="text-sm">You don't have access to view metrics. Contact your administrator for access permissions.</div>
          </div>
        </div>
      )}

      {/* Today's Sales & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sales - Only for sales access */}
        {permissions.canAccessSales && (
          <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Today's Sales</h3>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => navigate("/manage/sales")}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {salesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : todaySales.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  No sales recorded today yet
                </div>
              ) : (
                todaySales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-success text-success-content rounded-full w-8">
                          <span className="text-xs">₱</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{sale.user?.username || 'Walk-in Customer'}</div>
                        <div className="text-sm text-base-content/70">
                          {sale.sales_item.length} item{sale.sales_item.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(Number(sale.total_amount))}</div>
                      <div className="text-sm text-base-content/70">
                        {new Date(sale.sale_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="badge badge-sm badge-success">
                        {sale.payment_method}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        )}

        {/* Recent Activity - Shows if user has any access */}
        {(permissions.canAccessSales || permissions.canAccessOrders) && (
          <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Recent Activity</h3>
              <button className="btn btn-sm btn-outline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {(salesLoading || ordersLoading) ? (
                <div className="flex items-center justify-center p-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.description}</div>
                      <div className="text-xs text-base-content/70">{activity.time}</div>
                    </div>
                    {activity.amount > 0 && (
                      <div className="text-sm font-semibold text-success">
                        {formatPrice(activity.amount)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Urgent Tasks & Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks - Shows if user has inventory or queueing access */}
        {(permissions.canAccessInventory || permissions.canAccessQueueing) && (
          <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Urgent Tasks</h3>
              <span className="badge badge-error">{urgentTasks.length}</span>
            </div>
            <div className="space-y-3">
              {urgentTasks.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                  All caught up! No urgent tasks
                </div>
              ) : (
                urgentTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 cursor-pointer transition-colors"
                    onClick={() => {
                      if (task.type === 'Low Stock Alert') navigate('/manage/inventory');
                      else if (task.type === 'Service Queue') navigate('/manage/queueing');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'urgent' ? 'bg-error' : 
                        task.priority === 'high' ? 'bg-warning' : 'bg-info'
                      }`}></div>
                      <div>
                        <div className="font-semibold">{task.type}</div>
                        <div className="text-sm text-base-content/70">
                          {task.type === 'Low Stock Alert' ? `${task.item} (${task.stock} left)` :
                           task.type === 'Service Queue' ? `${task.customer} - ${task.service}` :
                           `${task.customer} - ${task.product || ''}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </div>
                      <div className="text-sm text-base-content/70 mt-1">
                        {task.time || task.pickup || ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        )}

        {/* Pending Orders - Only for orders access */}
        {permissions.canAccessOrders && (
          <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Pending Orders</h3>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => navigate("/manage/orders")}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {ordersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  No pending orders at the moment
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 cursor-pointer transition-colors"
                    onClick={() => navigate(`/manage/orders`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-warning text-warning-content rounded-full w-8">
                          <span className="text-xs">📦</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">Order #{order.id}</div>
                        <div className="text-sm text-base-content/70">{order.items.length} items</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(Number(order.total_amount))}</div>
                      <div className="text-sm text-base-content/70">
                        {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`badge badge-sm ${
                        order.status === 'to_pay' ? 'badge-error' :
                        order.status === 'to_ship' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Quick Actions - Adapt to permissions */}
      {(permissions.canAccessPOS || permissions.canAccessOrders || permissions.canAccessQueueing || permissions.canAccessChats) && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {permissions.canAccessPOS && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/manage/pos")}
                >
                  <ShoppingCart className="h-5 w-5" />
                  New Sale
                </button>
              )}
              {permissions.canAccessOrders && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/manage/orders")}
                >
                  <Package className="h-5 w-5" />
                  Process Orders
                </button>
              )}
              {permissions.canAccessQueueing && (
                <button
                  className="btn btn-accent"
                  onClick={() => navigate("/manage/queueing")}
                >
                  <CheckCircle className="h-5 w-5" />
                  Service Queue
                </button>
              )}
              {permissions.canAccessChats && (
                <button
                  className="btn btn-info"
                  onClick={() => navigate("/manage/chats")}
                >
                  <MessageCircle className="h-5 w-5" />
                  Customer Chat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;