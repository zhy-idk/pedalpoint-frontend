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
  RotateCcw,
  X,
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
  const { sales: apiSales, loading: salesLoading, error: salesError, refresh, fetchTopProducts, refundFullSale, refundSaleItem } = useSales();
  
  // State for top products
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  // Use API sales directly (no transformation needed)
  const sales = apiSales;

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
  const [dateFilterType, setDateFilterType] = useState<"all" | "yearly" | "quarterly" | "monthly" | "custom">("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedSale, setSelectedSale] = useState<APISale | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showItemRefundModal, setShowItemRefundModal] = useState(false);
  const [selectedItemForRefund, setSelectedItemForRefund] = useState<{ sale: APISale; item: APISale['sales_item'][0] } | null>(null);
  const [refundQuantity, setRefundQuantity] = useState(1);
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const searchLower = searchTerm.toLowerCase();
      const customerName = sale.user?.username || 'Walk-in Customer';
      const productNames = sale.sales_item.map(item => item.product?.product_listing?.name || item.product?.name || '').join(' ');
      const saleId = `SALE-${sale.id.toString().padStart(3, '0')}`;
      const salesperson = sale.salesperson?.username || '';
      
      const matchesSearch = 
        customerName.toLowerCase().includes(searchLower) ||
        productNames.toLowerCase().includes(searchLower) ||
        saleId.toLowerCase().includes(searchLower) ||
        salesperson.toLowerCase().includes(searchLower);

      // Status filter: check if all items are refunded
      const allItemsRefunded = sale.sales_item.every(item => item.refunded);
      const someItemsRefunded = sale.sales_item.some(item => item.refunded);
      let saleStatus = 'completed';
      if (allItemsRefunded) saleStatus = 'refunded';
      else if (someItemsRefunded) saleStatus = 'partially_refunded';
      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "refunded" && allItemsRefunded) ||
        (statusFilter === "completed" && !someItemsRefunded) ||
        (statusFilter === "partially_refunded" && someItemsRefunded && !allItemsRefunded);

      const matchesPayment = 
        paymentFilter === "all" || sale.payment_method === paymentFilter;

      const matchesDate = (() => {
        if (dateFilterType === "all") return true;
        const saleDate = new Date(sale.sale_date);
        
        switch (dateFilterType) {
          case "yearly":
            return saleDate.getFullYear() === selectedYear;
          case "quarterly":
            const quarter = Math.floor(saleDate.getMonth() / 3) + 1;
            return saleDate.getFullYear() === selectedYear && quarter === selectedQuarter;
          case "monthly":
            return saleDate.getFullYear() === selectedYear && saleDate.getMonth() + 1 === selectedMonth;
          case "custom":
            if (customDateRange.from && customDateRange.to) {
              return saleDate >= customDateRange.from && saleDate <= customDateRange.to;
            } else if (customDateRange.from) {
              return saleDate >= customDateRange.from;
            }
            return true;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [sales, searchTerm, statusFilter, paymentFilter, dateFilterType, selectedYear, selectedQuarter, selectedMonth, customDateRange]);

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
      partially_refunded: { color: "badge-warning", text: "Partially Refunded" },
      cancelled: { color: "badge-neutral", text: "Cancelled" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: "badge-neutral", text: status };

    return (
      <span className={`badge ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string | undefined) => {
    if (!method) return <span className="badge badge-neutral">Unknown</span>;
    
    const methodConfig = {
      cash: { color: "badge-success", text: "Cash" },
      card: { color: "badge-info", text: "Card" },
      gcash: { color: "badge-primary", text: "GCash" },
      paymaya: { color: "badge-warning", text: "PayMaya" },
      bank_transfer: { color: "badge-info", text: "Bank Transfer" },
      online: { color: "badge-primary", text: "Online" },
      installment: { color: "badge-warning", text: "Installment" }
    };

    const config = methodConfig[method as keyof typeof methodConfig] || { color: "badge-neutral", text: method };

    return (
      <span className={`badge ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalCapital = sales.reduce((sum, sale) => sum + sale.capital, 0);
    const totalNetRevenue = sales.reduce((sum, sale) => sum + sale.net_revenue, 0);
    const totalRefunded = sales.reduce((sum, sale) => {
      return sum + sale.sales_item.reduce((itemSum, item) => {
        if (item.refunded_quantity > 0) {
          const itemPrice = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
          const itemPricePerUnit = itemPrice / item.quantity_sold;
          return itemSum + (itemPricePerUnit * item.refunded_quantity);
        }
        return itemSum;
      }, 0);
    }, 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      totalCapital,
      totalNetRevenue,
      totalRefunded,
      averageOrderValue
    };
  }, [sales]);

  // Calculate sales trend data from actual sales
  const salesData = useMemo(() => {
    const monthlyData = new Map<string, { sales: number; orders: number }>();
    
    sales.forEach(sale => {
      const date = new Date(sale.sale_date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (monthlyData.has(monthKey)) {
        const existing = monthlyData.get(monthKey)!;
        existing.sales += sale.total_amount;
        existing.orders += 1;
      } else {
        monthlyData.set(monthKey, {
          sales: sale.total_amount,
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
      const method = sale.payment_method;
      if (method) {
        methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
      }
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
          <div className="stat-title">Capital</div>
          <div className="stat-value text-warning">{formatPrice(stats.totalCapital)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Net Revenue</div>
          <div className="stat-value text-info">{formatPrice(stats.totalNetRevenue)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Refunded</div>
          <div className="stat-value text-error">{formatPrice(stats.totalRefunded)}</div>
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
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
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
            <option value="partially_refunded">Partially Refunded</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={dateFilterType}
            onChange={(e) => setDateFilterType(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>

          {dateFilterType === "yearly" && (
            <select
              className="select select-bordered select-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          {dateFilterType === "quarterly" && (
            <>
              <select
                className="select select-bordered select-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
              >
                <option value={1}>Q1</option>
                <option value={2}>Q2</option>
                <option value={3}>Q3</option>
                <option value={4}>Q4</option>
              </select>
            </>
          )}

          {dateFilterType === "monthly" && (
            <>
              <select
                className="select select-bordered select-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </>
          )}

          {dateFilterType === "custom" && (
            <div className="flex gap-2">
              <input
                type="date"
                className="input input-bordered input-sm"
                value={customDateRange.from ? customDateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
                placeholder="From"
              />
              <input
                type="date"
                className="input input-bordered input-sm"
                value={customDateRange.to ? customDateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
                placeholder="To"
              />
            </div>
          )}
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
            {filteredSales.map((sale) => {
              const allItemsRefunded = sale.sales_item.every(item => item.refunded);
              const someItemsRefunded = sale.sales_item.some(item => item.refunded);
              let saleStatus = 'completed';
              if (allItemsRefunded) saleStatus = 'refunded';
              else if (someItemsRefunded) saleStatus = 'partially_refunded';
              
              const firstItem = sale.sales_item[0];
              const customerName = sale.user?.username || 'Walk-in Customer';
              const productName = firstItem?.product?.product_listing?.name || 'Unknown Product';
              const totalQuantity = sale.sales_item.reduce((sum, item) => sum + item.quantity_sold, 0);
              const salesperson = sale.salesperson?.username || 'N/A';
              
              return (
                <tr key={sale.id} className="hover">
                  <td>
                    <div className="font-mono text-sm">SALE-{sale.id.toString().padStart(3, '0')}</div>
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold">{customerName}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-medium">{productName}</div>
                      <div className="text-sm text-base-content/70">Qty: {totalQuantity}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold">{formatPrice(sale.total_amount)}</div>
                    </div>
                  </td>
                  <td>
                    {getPaymentMethodBadge(sale.payment_method)}
                  </td>
                  <td>
                    {getStatusBadge(saleStatus)}
                  </td>
                  <td>
                    <div className="text-sm">{salesperson}</div>
                  </td>
                  <td>
                    <div className="text-sm">{formatDate(sale.sale_date)}</div>
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
              );
            })}
          </tbody>
        </table>

        {filteredSales.length === 0 && (
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl opacity-20">💰</div>
            <h3 className="mb-2 text-lg font-semibold">
              No sales found
            </h3>
            <p className="text-base-content/60">
              {searchTerm || statusFilter !== "all" || paymentFilter !== "all" || dateFilterType !== "all"
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
            <h3 className="font-bold text-lg mb-4">Sale Details - SALE-{selectedSale.id.toString().padStart(3, '0')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedSale.user?.username || 'Walk-in Customer'}</div>
                  <div><strong>Payment Method:</strong> {getPaymentMethodBadge(selectedSale.payment_method)}</div>
                  <div><strong>Salesperson:</strong> {selectedSale.salesperson?.username || 'N/A'}</div>
                  <div><strong>Date:</strong> {formatDateTime(selectedSale.sale_date)}</div>
                  <div><strong>Last Modified:</strong> {formatDateTime(selectedSale.last_modified)}</div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="font-semibold mb-3">Financial Summary</h4>
                <div className="space-y-2">
                  <div><strong>Total:</strong> {formatPrice(selectedSale.total_amount)}</div>
                  <div><strong>Capital:</strong> {formatPrice(selectedSale.capital)}</div>
                  <div><strong>Net Revenue:</strong> {formatPrice(selectedSale.net_revenue)}</div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Sale Items</h4>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Supplier Price</th>
                      <th>Amount</th>
                      <th>Refunded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.sales_item.map((item) => {
                      const itemAmount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
                      const itemPrice = itemAmount / item.quantity_sold;
                      const supplierPrice = item.supplier_price ? (typeof item.supplier_price === 'string' ? parseFloat(item.supplier_price) : item.supplier_price) : null;
                      const availableQty = item.quantity_sold - item.refunded_quantity;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="font-medium">{item.product?.product_listing?.name || item.product?.name}</div>
                            {item.product?.variant_attribute && (
                              <div className="text-sm text-base-content/70">{item.product.variant_attribute}</div>
                            )}
                          </td>
                          <td>
                            {item.refunded_quantity > 0 ? (
                              <div>
                                <div>{item.quantity_sold - item.refunded_quantity} / {item.quantity_sold}</div>
                                <div className="text-xs text-error">Refunded: {item.refunded_quantity}</div>
                              </div>
                            ) : (
                              item.quantity_sold
                            )}
                          </td>
                          <td>{formatPrice(itemPrice)}</td>
                          <td>{supplierPrice !== null ? formatPrice(supplierPrice) : 'N/A'}</td>
                          <td>{formatPrice(itemAmount)}</td>
                          <td>
                            {item.refunded ? (
                              <span className="badge badge-error">Refunded</span>
                            ) : item.refunded_quantity > 0 ? (
                              <span className="badge badge-warning">Partial ({item.refunded_quantity})</span>
                            ) : (
                              <span className="badge badge-success">None</span>
                            )}
                          </td>
                          <td>
                            {!item.refunded && availableQty > 0 ? (
                              <button
                                className="btn btn-sm btn-outline btn-error"
                                onClick={() => {
                                  setSelectedItemForRefund({ sale: selectedSale, item });
                                  setRefundQuantity(1);
                                  setRefundReason('');
                                  setRefundNotes('');
                                  setShowItemRefundModal(true);
                                }}
                              >
                                <RotateCcw className="h-3 w-3" /> Refund
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-disabled" disabled>
                                <RotateCcw className="h-3 w-3" /> Refunded
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-action">
              {selectedSale.sales_item.some(item => !item.refunded && (item.quantity_sold - item.refunded_quantity > 0)) && (
                <button
                  className="btn btn-error"
                  onClick={() => {
                    setRefundReason('');
                    setRefundNotes('');
                    setShowRefundModal(true);
                  }}
                >
                  <RotateCcw className="h-4 w-4" /> Refund Full Sale
                </button>
              )}
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

      {/* Full Sale Refund Modal */}
      {showRefundModal && selectedSale && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Refund Full Sale</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Refund Reason</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter refund reason"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
              </div>
              <div className="alert alert-info">
                <AlertCircle className="h-4 w-4" />
                <span>This will refund all remaining non-refunded items in this sale.</span>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowRefundModal(false)}
                disabled={isProcessingRefund}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={async () => {
                  setIsProcessingRefund(true);
                  try {
                    await refundFullSale(selectedSale.id, refundReason, refundNotes);
                    alert('Refund processed successfully!');
                    setShowRefundModal(false);
                    setShowDetailsModal(false);
                    await refresh();
                  } catch (error: any) {
                    alert(`Refund failed: ${error.message}`);
                  } finally {
                    setIsProcessingRefund(false);
                  }
                }}
                disabled={isProcessingRefund}
              >
                {isProcessingRefund ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  'Confirm Refund'
                )}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Item Refund Modal */}
      {showItemRefundModal && selectedItemForRefund && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Refund Item</h3>
            <div className="space-y-4">
              <div>
                <div className="font-semibold mb-2">
                  {selectedItemForRefund.item.product?.product_listing?.name || selectedItemForRefund.item.product?.name}
                </div>
                <div className="text-sm text-base-content/70">
                  Sold: {selectedItemForRefund.item.quantity_sold} | 
                  Already Refunded: {selectedItemForRefund.item.refunded_quantity} |
                  Available: {selectedItemForRefund.item.quantity_sold - selectedItemForRefund.item.refunded_quantity}
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Refund Quantity</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={refundQuantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 0;
                    const maxQty = selectedItemForRefund.item.quantity_sold - selectedItemForRefund.item.refunded_quantity;
                    setRefundQuantity(Math.min(Math.max(1, qty), maxQty));
                  }}
                  min={1}
                  max={selectedItemForRefund.item.quantity_sold - selectedItemForRefund.item.refunded_quantity}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Refund Reason</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter refund reason"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowItemRefundModal(false)}
                disabled={isProcessingRefund}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={async () => {
                  setIsProcessingRefund(true);
                  try {
                    await refundSaleItem(
                      selectedItemForRefund.sale.id,
                      selectedItemForRefund.item.id,
                      refundQuantity,
                      refundReason,
                      refundNotes
                    );
                    alert('Refund processed successfully!');
                    setShowItemRefundModal(false);
                    await refresh();
                    // Reopen details modal with updated data
                    const updatedSale = sales.find(s => s.id === selectedSale.id);
                    if (updatedSale) {
                      setSelectedSale(updatedSale);
                      setShowDetailsModal(true);
                    }
                  } catch (error: any) {
                    alert(`Refund failed: ${error.message}`);
                  } finally {
                    setIsProcessingRefund(false);
                  }
                }}
                disabled={isProcessingRefund}
              >
                {isProcessingRefund ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  'Confirm Refund'
                )}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default StaffSales;

