import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";
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
} from "lucide-react";

function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useDashboardData();
  const isSuperuser = user?.is_superuser;
  const isStaff = user?.is_staff;

  // Real-time data for immediate dashboard
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Today's immediate metrics
  const todaySales = [
    { id: "SALE-001", customer: "John Smith", product: "Mountain Bike Pro", amount: 25000, time: "10:30 AM", status: "completed" },
    { id: "SALE-002", customer: "Maria Garcia", product: "Road Bike Elite", amount: 18000, time: "2:15 PM", status: "completed" },
    { id: "SALE-003", customer: "David Johnson", product: "Electric Bike City", amount: 35000, time: "4:45 PM", status: "pending" },
  ];

  const todayRevenue = todaySales
    .filter(sale => sale.status === 'completed')
    .reduce((sum, sale) => sum + sale.amount, 0);

  const pendingOrders = [
    { id: "ORD-001", customer: "Sarah Connor", amount: 12999, items: 2, time: "11:20 AM", priority: "high" },
    { id: "ORD-002", customer: "Mike Johnson", amount: 8995, items: 1, time: "1:30 PM", priority: "medium" },
    { id: "ORD-003", customer: "Emma Davis", amount: 18990, items: 3, time: "3:15 PM", priority: "high" },
  ];

  const urgentTasks = [
    { id: "TASK-001", type: "Low Stock Alert", item: "Mountain Bike Pro", stock: 3, threshold: 10, priority: "urgent" },
    { id: "TASK-002", type: "Service Queue", customer: "Alex Chen", service: "Bike Tune-up", time: "2:00 PM", priority: "high" },
    { id: "TASK-003", type: "Reservation", customer: "Lisa Wilson", product: "Hybrid Commuter", pickup: "4:30 PM", priority: "medium" },
  ];

  const recentActivity = [
    { id: "ACT-001", type: "sale", description: "New sale: Mountain Bike Pro to John Smith", time: "10:30 AM", amount: 25000 },
    { id: "ACT-002", type: "order", description: "Order #ORD-001 marked as shipped", time: "11:45 AM", amount: 0 },
    { id: "ACT-003", type: "service", description: "Service completed for Alex Chen", time: "1:20 PM", amount: 0 },
    { id: "ACT-004", type: "sale", description: "New sale: Road Bike Elite to Maria Garcia", time: "2:15 PM", amount: 18000 },
  ];

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
      </div>

      {/* Today's Immediate Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Today's Sales */}
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
                  {formatPrice(todayRevenue)}
                </div>
                <div className="text-sm text-base-content/70">
                  {todaySales.filter(s => s.status === 'completed').length} completed
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

        {/* Pending Orders */}
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
                  {pendingOrders.length}
                </div>
                <div className="text-sm text-base-content/70">
                  {pendingOrders.filter(o => o.priority === 'high').length} urgent
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

        {/* Service Queue */}
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
                  {urgentTasks.filter(t => t.type === 'Service Queue').length}
                </div>
                <div className="text-sm text-base-content/70">
                  In progress
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

        {/* Low Stock Alerts */}
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
                  {urgentTasks.filter(t => t.type === 'Low Stock Alert').length}
                </div>
                <div className="text-sm text-base-content/70">
                  Items critical
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
      </div>

      {/* Today's Sales & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sales */}
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
              {todaySales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-success text-success-content rounded-full w-8">
                        <span className="text-xs">₱</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">{sale.customer}</div>
                      <div className="text-sm text-base-content/70">{sale.product}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(sale.amount)}</div>
                    <div className="text-sm text-base-content/70">{sale.time}</div>
                    <div className={`badge badge-sm ${
                      sale.status === 'completed' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {sale.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Recent Activity</h3>
              <button className="btn btn-sm btn-outline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Tasks & Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Urgent Tasks</h3>
              <span className="badge badge-error">{urgentTasks.length}</span>
            </div>
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'urgent' ? 'bg-error' : 
                      task.priority === 'high' ? 'bg-warning' : 'bg-info'
                    }`}></div>
                    <div>
                      <div className="font-semibold">{task.type}</div>
                      <div className="text-sm text-base-content/70">
                        {task.type === 'Low Stock Alert' ? `${task.item} (${task.stock}/${task.threshold})` :
                         task.type === 'Service Queue' ? `${task.customer} - ${task.service}` :
                         `${task.customer} - ${task.product}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </div>
                    <div className="text-sm text-base-content/70 mt-1">
                      {task.time || task.pickup}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Orders */}
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
              {pendingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-warning text-warning-content rounded-full w-8">
                        <span className="text-xs">📦</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">{order.customer}</div>
                      <div className="text-sm text-base-content/70">{order.items} items</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(order.amount)}</div>
                    <div className="text-sm text-base-content/70">{order.time}</div>
                    <div className={`badge ${getPriorityBadge(order.priority)}`}>
                      {order.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/manage/pos")}
            >
              <ShoppingCart className="h-5 w-5" />
              New Sale
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/manage/orders")}
            >
              <Package className="h-5 w-5" />
              Process Orders
            </button>
            <button
              className="btn btn-accent"
              onClick={() => navigate("/manage/queueing")}
            >
              <CheckCircle className="h-5 w-5" />
              Service Queue
            </button>
            <button
              className="btn btn-info"
              onClick={() => navigate("/manage/chats")}
            >
              <MessageCircle className="h-5 w-5" />
              Customer Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;