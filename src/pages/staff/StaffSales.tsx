import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
} from "lucide-react";
import { useSales, type Sale as APISale, type TopProduct } from "../../hooks/useSales";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface Sale {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  paymentMethod: 'cash' | 'card' | 'online' | 'installment';
  status: 'completed' | 'pending' | 'refunded' | 'cancelled';
  salesperson: string;
  discount: number;
  tax: number;
  notes?: string;
}

function StaffSales() {
  // Fetch real sales data from API
  const { sales: apiSales, loading: salesLoading, error: salesError, refresh, fetchTopProducts } = useSales();
  
  // State for top products
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  // Transform API sales data to match the component's expected format
  const sales = useMemo(() => {
    return apiSales.map(sale => {
      const firstItem = sale.sales_item[0];
      return {
        id: `SALE-${sale.id.toString().padStart(3, '0')}`,
        customerName: sale.user?.username || 'Walk-in Customer',
        customerEmail: '',
        productName: firstItem?.product?.product_listing?.name || 'Unknown Product',
        productId: firstItem?.product?.id.toString() || '',
        quantity: sale.sales_item.reduce((sum, item) => sum + item.quantity_sold, 0),
        unitPrice: firstItem ? parseFloat(firstItem.product.price) : 0,
        totalAmount: sale.total_amount,
        saleDate: sale.sale_date,
        paymentMethod: sale.payment_method as 'cash' | 'card' | 'online' | 'installment',
        status: 'completed' as const,
        salesperson: sale.user?.username || 'Staff',
        discount: 0,
        tax: 0,
        notes: sale.sales_item.length > 1 ? `${sale.sales_item.length} items sold` : undefined,
        items: sale.sales_item,
      };
    });
  }, [apiSales]);

  // Old mock data (keeping structure for reference, but not used)
  const [oldMockSales] = useState<Sale[]>([
    {
      id: "SALE-001",
      customerName: "John Smith",
      customerEmail: "john.smith@email.com",
      productName: "Mountain Bike Pro 2024",
      productId: "PROD-001",
      quantity: 1,
      unitPrice: 25000,
      totalAmount: 25000,
      saleDate: "2024-01-15T10:30:00Z",
      paymentMethod: "card",
      status: "completed",
      salesperson: "Sarah Johnson",
      discount: 0,
      tax: 3000,
      notes: "Customer preferred morning pickup"
    },
    {
      id: "SALE-002",
      customerName: "Maria Garcia",
      customerEmail: "maria.garcia@email.com",
      productName: "Road Bike Elite",
      productId: "PROD-002",
      quantity: 1,
      unitPrice: 18000,
      totalAmount: 18000,
      saleDate: "2024-01-14T14:20:00Z",
      paymentMethod: "cash",
      status: "completed",
      salesperson: "Mike Wilson",
      discount: 1000,
      tax: 2160,
      notes: "First-time customer, gave discount"
    },
    {
      id: "SALE-003",
      customerName: "David Johnson",
      customerEmail: "david.johnson@email.com",
      productName: "Electric Bike City",
      productId: "PROD-003",
      quantity: 1,
      unitPrice: 35000,
      totalAmount: 35000,
      saleDate: "2024-01-13T09:15:00Z",
      paymentMethod: "installment",
      status: "completed",
      salesperson: "Sarah Johnson",
      discount: 0,
      tax: 4200,
      notes: "6-month installment plan"
    },
    {
      id: "SALE-004",
      customerName: "Sarah Wilson",
      customerEmail: "sarah.wilson@email.com",
      productName: "BMX Freestyle Pro",
      productId: "PROD-004",
      quantity: 2,
      unitPrice: 12000,
      totalAmount: 24000,
      saleDate: "2024-01-12T16:45:00Z",
      paymentMethod: "online",
      status: "completed",
      salesperson: "Mike Wilson",
      discount: 2000,
      tax: 2640,
      notes: "Bulk purchase for kids"
    },
    {
      id: "SALE-005",
      customerName: "Michael Brown",
      customerEmail: "michael.brown@email.com",
      productName: "Hybrid Commuter Plus",
      productId: "PROD-005",
      quantity: 1,
      unitPrice: 22000,
      totalAmount: 22000,
      saleDate: "2024-01-11T11:30:00Z",
      paymentMethod: "card",
      status: "completed",
      salesperson: "Sarah Johnson",
      discount: 0,
      tax: 2640,
      notes: "Corporate client"
    },
    {
      id: "SALE-006",
      customerName: "Lisa Anderson",
      customerEmail: "lisa.anderson@email.com",
      productName: "Mountain Bike Pro 2024",
      productId: "PROD-001",
      quantity: 1,
      unitPrice: 25000,
      totalAmount: 25000,
      saleDate: "2024-01-10T13:20:00Z",
      paymentMethod: "online",
      status: "refunded",
      salesperson: "Mike Wilson",
      discount: 0,
      tax: 3000,
      notes: "Customer changed mind, refund processed"
    },
    {
      id: "SALE-007",
      customerName: "Robert Taylor",
      customerEmail: "robert.taylor@email.com",
      productName: "Road Bike Elite",
      productId: "PROD-002",
      quantity: 1,
      unitPrice: 18000,
      totalAmount: 18000,
      saleDate: "2024-01-09T15:10:00Z",
      paymentMethod: "cash",
      status: "completed",
      salesperson: "Sarah Johnson",
      discount: 500,
      tax: 2100,
      notes: "Regular customer"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch = 
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.salesperson.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || sale.status === statusFilter;

      const matchesPayment = 
        paymentFilter === "all" || sale.paymentMethod === paymentFilter;

      const matchesDate = (() => {
        if (dateFilter === "all") return true;
        const today = new Date();
        const saleDate = new Date(sale.saleDate);
        
        switch (dateFilter) {
          case "today":
            return saleDate.toDateString() === today.toDateString();
          case "yesterday":
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return saleDate.toDateString() === yesterday.toDateString();
          case "this_week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return saleDate >= weekStart && saleDate <= weekEnd;
          case "this_month":
            return saleDate.getMonth() === today.getMonth() && 
                   saleDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [sales, searchTerm, statusFilter, paymentFilter, dateFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: "badge-success", text: "Completed" },
      pending: { color: "badge-warning", text: "Pending" },
      refunded: { color: "badge-error", text: "Refunded" },
      cancelled: { color: "badge-neutral", text: "Cancelled" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <span className={`badge ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      cash: { color: "badge-success", text: "Cash" },
      card: { color: "badge-info", text: "Card" },
      online: { color: "badge-primary", text: "Online" },
      installment: { color: "badge-warning", text: "Installment" }
    };

    const config = methodConfig[method as keyof typeof methodConfig];

    return (
      <span className={`badge ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales
      .filter(sale => sale.status === 'completed')
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalRefunded = sales
      .filter(sale => sale.status === 'refunded')
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
    const netRevenue = totalRevenue - totalRefunded;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      totalRefunded,
      netRevenue,
      averageOrderValue
    };
  }, [sales]);

  // Calculate sales trend data from actual sales
  const salesData = useMemo(() => {
    const monthlyData = new Map<string, { sales: number; orders: number }>();
    
    sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (monthlyData.has(monthKey)) {
        const existing = monthlyData.get(monthKey)!;
        existing.sales += sale.totalAmount;
        existing.orders += 1;
      } else {
        monthlyData.set(monthKey, {
          sales: sale.totalAmount,
          orders: 1,
        });
      }
    });

    // Convert to array and sort by date
    return Array.from(monthlyData.entries())
      .map(([name, data]) => ({ name, ...data }))
      .slice(-6); // Last 6 months
  }, [sales]);

  // Fetch top products when component mounts or sales data changes
  React.useEffect(() => {
    const loadTopProducts = async () => {
      const products = await fetchTopProducts();
      setTopProducts(products);
    };
    
    if (apiSales.length > 0) {
      loadTopProducts();
    }
  }, [apiSales, fetchTopProducts]);

  // Calculate payment method distribution from actual sales
  const paymentMethodData = useMemo(() => {
    const methodCounts = new Map<string, number>();
    
    sales.forEach(sale => {
      const method = sale.paymentMethod;
      methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
    });

    // Define colors for each payment method
    const colorMap: { [key: string]: string } = {
      cash: "#10b981",
      card: "#3b82f6",
      gcash: "#8b5cf6",
      paymaya: "#f59e0b",
      bank_transfer: "#ec4899",
      online: "#8b5cf6",
      installment: "#f59e0b",
    };

    // Convert to array with proper formatting
    return Array.from(methodCounts.entries())
      .map(([method, count]) => ({
        name: method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, ' '),
        value: count,
        color: colorMap[method] || "#6b7280",
      }))
      .filter(item => item.value > 0); // Only show methods that have been used
  }, [sales]);

  // Show loading state
  if (salesLoading && sales.length === 0) {
    return (
      <div className="bg-base-100 p-3">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="ml-2">Loading sales data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (salesError) {
    return (
      <div className="bg-base-100 p-3">
        <div className="alert alert-error">
          <AlertCircle className="h-4 w-4" />
          <span>Error loading sales: {salesError}</span>
          <button onClick={refresh} className="btn btn-sm btn-outline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-3">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-base-content/70">
            Track sales performance and revenue analytics
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            className="btn btn-outline gap-2"
            onClick={refresh}
            disabled={salesLoading}
          >
            <RefreshCw className={`h-4 w-4 ${salesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Sales</div>
          <div className="stat-value text-primary">{stats.totalSales}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-success">{formatPrice(stats.totalRevenue)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Net Revenue</div>
          <div className="stat-value text-info">{formatPrice(stats.netRevenue)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Refunded</div>
          <div className="stat-value text-error">{formatPrice(stats.totalRefunded)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Avg Order Value</div>
          <div className="stat-value text-warning">{formatPrice(stats.averageOrderValue)}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trend Chart */}
        <div className="card bg-base-200 p-4">
          <h3 className="card-title mb-4">Sales Trend</h3>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-base-content/50">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No sales data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Chart */}
        <div className="card bg-base-200 p-4">
          <h3 className="card-title mb-4">Payment Methods</h3>
          {paymentMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-base-content/50">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No payment data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card bg-base-200 p-4 mb-6">
        <h3 className="card-title mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => {
                  const maxSales = topProducts[0]?.quantity_sold || 1; // Use the highest sales for percentage calculation
                  const percentage = maxSales > 0 ? (product.quantity_sold / maxSales) * 100 : 0;
                  
                  return (
                    <tr key={product.product_id}>
                      <td>{product.product_name}</td>
                      <td>{product.quantity_sold}</td>
                      <td>{formatPrice(product.revenue)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-base-300 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-base-content/60">
                    No sales data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <label className="input input-bordered flex w-full max-w-md items-center gap-2">
          <Search className="h-4 w-4 opacity-50" />
          <input
            type="text"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="grow"
          />
        </label>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
            <option value="installment">Installment</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-base-content/70">
          Showing {filteredSales.length} of {sales.length} sales
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Salesperson</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover">
                <td>
                  <div className="font-mono text-sm">{sale.id}</div>
                </td>
                <td>
                  <div>
                    <div className="font-semibold">{sale.customerName}</div>
                    <div className="text-sm text-base-content/70">{sale.customerEmail}</div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="font-medium">{sale.productName}</div>
                    <div className="text-sm text-base-content/70">Qty: {sale.quantity}</div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="font-semibold">{formatPrice(sale.totalAmount)}</div>
                    {sale.discount > 0 && (
                      <div className="text-sm text-success">-{formatPrice(sale.discount)}</div>
                    )}
                  </div>
                </td>
                <td>
                  {getPaymentMethodBadge(sale.paymentMethod)}
                </td>
                <td>
                  {getStatusBadge(sale.status)}
                </td>
                <td>
                  <div className="text-sm">{sale.salesperson}</div>
                </td>
                <td>
                  <div className="text-sm">{formatDate(sale.saleDate)}</div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedSale(sale);
                        setShowDetailsModal(true);
                      }}
                      className="btn btn-ghost btn-sm"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSales.length === 0 && (
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl opacity-20">💰</div>
            <h3 className="mb-2 text-lg font-semibold">
              No sales found
            </h3>
            <p className="text-base-content/60">
              {searchTerm || statusFilter !== "all" || paymentFilter !== "all" || dateFilter !== "all"
                ? "No sales match your search criteria."
                : "No sales available."}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSale && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Sale Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedSale.customerName}</div>
                  <div><strong>Email:</strong> {selectedSale.customerEmail}</div>
                </div>
              </div>

              {/* Sale Info */}
              <div>
                <h4 className="font-semibold mb-3">Sale Information</h4>
                <div className="space-y-2">
                  <div><strong>ID:</strong> {selectedSale.id}</div>
                  <div><strong>Product:</strong> {selectedSale.productName}</div>
                  <div><strong>Quantity:</strong> {selectedSale.quantity}</div>
                  <div><strong>Unit Price:</strong> {formatPrice(selectedSale.unitPrice)}</div>
                  <div><strong>Total Amount:</strong> {formatPrice(selectedSale.totalAmount)}</div>
                  <div><strong>Payment Method:</strong> {getPaymentMethodBadge(selectedSale.paymentMethod)}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedSale.status)}</div>
                  <div><strong>Salesperson:</strong> {selectedSale.salesperson}</div>
                  <div><strong>Date:</strong> {formatDateTime(selectedSale.saleDate)}</div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Financial Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Subtotal</div>
                  <div className="stat-value text-lg">{formatPrice(selectedSale.totalAmount - selectedSale.tax + selectedSale.discount)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Discount</div>
                  <div className="stat-value text-lg text-success">-{formatPrice(selectedSale.discount)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Tax</div>
                  <div className="stat-value text-lg text-warning">+{formatPrice(selectedSale.tax)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Total</div>
                  <div className="stat-value text-lg text-primary">{formatPrice(selectedSale.totalAmount)}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedSale.notes && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Notes</h4>
                <p className="p-3 bg-base-200 rounded-lg">{selectedSale.notes}</p>
              </div>
            )}

            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default StaffSales;

