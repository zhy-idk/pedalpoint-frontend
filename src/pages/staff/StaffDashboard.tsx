import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";
import {
  MessageCircle,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
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

  // Sample data for charts
  const salesData = [
    { name: "Jan", sales: 8500, orders: 35, visits: 12500 },
    { name: "Feb", sales: 6200, orders: 28, visits: 11200 },
    { name: "Mar", sales: 12800, orders: 52, visits: 18500 },
    { name: "Apr", sales: 9600, orders: 41, visits: 15800 },
    { name: "May", sales: 15200, orders: 63, visits: 22300 },
    { name: "Jun", sales: 11800, orders: 48, visits: 19600 },
  ];

  const topProducts = [
    { name: "Mountain Bike Pro", sales: 28 },
    { name: "Road Bike Elite", sales: 24 },
    { name: "Electric Bike City", sales: 19 },
    { name: "BMX Freestyle", sales: 15 },
    { name: "Hybrid Commuter", sales: 12 },
  ];

  const categoryData = [
    { name: "Mountain Bikes", value: 450, color: "#8884d8" },
    { name: "Road Bikes", value: 320, color: "#82ca9d" },
    { name: "Electric Bikes", value: 280, color: "#ffc658" },
    { name: "BMX & Kids", value: 180, color: "#ff7c7c" },
    { name: "Accessories", value: 220, color: "#8dd1e1" },
  ];

  const recentOrders = [
    {
      id: "#BK-001",
      customer: "Sarah Connor",
      amount: 1299.99,
      status: "completed",
      item: "Mountain Bike Pro",
    },
    {
      id: "#BK-002",
      customer: "Mike Johnson",
      amount: 899.5,
      status: "processing",
      item: "Road Bike Elite",
    },
    {
      id: "#BK-003",
      customer: "Emma Davis",
      amount: 1899.0,
      status: "shipped",
      item: "Electric Bike City",
    },
    {
      id: "#BK-004",
      customer: "Alex Chen",
      amount: 567.25,
      status: "pending",
      item: "BMX Freestyle",
    },
    {
      id: "#BK-005",
      customer: "Lisa Wilson",
      amount: 1156.8,
      status: "completed",
      item: "Hybrid Commuter",
    },
  ];

  const lowStockItems = [
    { name: "Mountain Bike Pro", stock: 3, threshold: 10 },
    { name: "Bike Helmet Premium", stock: 5, threshold: 20 },
    { name: "Carbon Fiber Wheels", stock: 2, threshold: 8 },
    { name: "Electric Battery Pack", stock: 4, threshold: 15 },
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: "badge-success",
      processing: "badge-info",
      shipped: "badge-primary",
      pending: "badge-warning",
    };
    return `badge ${statusClasses[status as keyof typeof statusClasses]} badge-sm`;
  };

  return (
    <div className="bg-base-200 h-full space-y-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base-content text-3xl font-bold">
            PedalPoint Dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Staff Alerts Section - Only for Staff Users */}
      {isStaff && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* New Chat Alerts */}
            <div className="card bg-base-100 border-l-primary border-l-4 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 rounded-full p-2">
                      <MessageCircle className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">New Chats</h3>
                      <p className="text-base-content/70 text-sm">
                        Unread messages
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary text-2xl font-bold">
                      {dashboardLoading ? (
                        <div className="loading loading-spinner loading-sm"></div>
                      ) : (
                        dashboardData?.new_chats || 0
                      )}
                    </div>
                    {dashboardData?.new_chats &&
                      dashboardData.new_chats > 0 && (
                        <div className="badge badge-primary badge-sm">
                          <Bell className="mr-1 h-3 w-3" />
                          New
                        </div>
                      )}
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/manage/chats")}
                  >
                    View Chats
                  </button>
                </div>
              </div>
            </div>

            {/* New Order Alerts */}
            <div className="card bg-base-100 border-l-secondary border-l-4 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary/20 rounded-full p-2">
                      <ShoppingCart className="text-secondary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">New Orders</h3>
                      <p className="text-base-content/70 text-sm">
                        Pending processing
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-secondary text-2xl font-bold">
                      {dashboardLoading ? (
                        <div className="loading loading-spinner loading-sm"></div>
                      ) : (
                        dashboardData?.new_orders || 0
                      )}
                    </div>
                    {dashboardData?.new_orders &&
                      dashboardData.new_orders > 0 && (
                        <div className="badge badge-secondary badge-sm">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Urgent
                        </div>
                      )}
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/manage/orders")}
                  >
                    View Orders
                  </button>
                </div>
              </div>
            </div>

            {/* Service Queue Today */}
            <div className="card bg-base-100 border-l-accent border-l-4 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/20 rounded-full p-2">
                      <Clock className="text-accent h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Service Queue</h3>
                      <p className="text-base-content/70 text-sm">
                        Today's schedule
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-2">
                      <div className="text-center">
                        <div className="text-warning text-lg font-bold">
                          {dashboardLoading ? (
                            <div className="loading loading-spinner loading-xs"></div>
                          ) : (
                            dashboardData?.service_queue_today?.pending || 0
                          )}
                        </div>
                        <div className="text-base-content/70 text-xs">
                          Pending
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-success text-lg font-bold">
                          {dashboardLoading ? (
                            <div className="loading loading-spinner loading-xs"></div>
                          ) : (
                            dashboardData?.service_queue_today?.completed || 0
                          )}
                        </div>
                        <div className="text-base-content/70 text-xs">Done</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => navigate("/manage/queueing")}
                  >
                    View Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Stats */}
      <div className="stats stats-vertical lg:stats-horizontal bg-base-100 w-full shadow">
        {isSuperuser && (
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value text-primary">$64,100</div>
            <div className="stat-desc">↗︎ $5,400 (9.2%) this month</div>
          </div>
        )}

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="stat-title">Bikes Sold</div>
          <div className="stat-value text-secondary">267</div>
          <div className="stat-desc">↗︎ 28 (11.7%) from last month</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <div className="stat-title">Website Visits</div>
          <div className="stat-value text-info">99,400</div>
          <div className="stat-desc">↗︎ 8,200 (9.0%) unique visitors</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="stat-title">Active Customers</div>
          <div className="stat-value text-accent">1,284</div>
          <div className="stat-desc">↗︎ 86 (7.2%) new this month</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div className="stat-title">Bikes in Stock</div>
          <div className="stat-value text-warning">356</div>
          <div className="stat-desc">↘︎ 8 bikes need restocking</div>
        </div>
      </div>

      {/* Charts Section - Only for Superusers */}
      {isSuperuser && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales & Visits Chart */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Sales & Website Traffic</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Sales ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="visits"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Website Visits"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bike Category Distribution */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Sales by Bike Category</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section - Only for Superusers */}
      {isSuperuser && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="card bg-base-100 shadow-lg lg:col-span-2">
            <div className="card-body">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="card-title">Recent Bike Orders</h2>
                <button className="btn btn-ghost btn-sm">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="table-zebra table w-full">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Bike Model</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-mono">{order.id}</td>
                        <td>{order.customer}</td>
                        <td className="text-sm">{order.item}</td>
                        <td className="font-semibold">${order.amount}</td>
                        <td>
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Low Stock Alert
              </h2>
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-base-200 flex items-center justify-between rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-base-content/60 text-sm">
                        {item.stock} left (min: {item.threshold})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="badge badge-warning badge-sm">
                        {item.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-actions mt-4 justify-end">
                <button className="btn btn-warning btn-sm">
                  Reorder Bikes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Products - Only for Superusers */}
      {isSuperuser && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Top Selling Bikes</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
