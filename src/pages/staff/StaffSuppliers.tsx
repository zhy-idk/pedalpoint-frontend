import React, { useState, useMemo } from "react";
import {
  Search,
  AlertTriangle,
  Package,
  Phone,
  Mail,
  Eye,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useSuppliers, type Supplier, type SupplierProduct } from "../../hooks/useSuppliers";
import { SupplierFormModal } from "../../components/staff/SupplierFormModal";

function StaffSuppliers() {
  const { suppliers, loading, error, refresh, getSupplierProducts, updateSupplier, deleteSupplier } = useSuppliers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLowStockFilter = 
        !filterLowStock || supplier.has_low_stock;

      return matchesSearch && matchesLowStockFilter;
    });
  }, [suppliers, searchTerm, filterLowStock]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const handleViewProducts = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setProductsLoading(true);
    setShowProductsModal(true);
    
    const data = await getSupplierProducts(supplier.id);
    if (data) {
      setSupplierProducts(data.products);
    }
    setProductsLoading(false);
  };

  const getLowStockCount = () => {
    return suppliers.filter(s => s.has_low_stock).length;
  };

  const getTotalSuppliers = () => {
    return suppliers.length;
  };

  const getTotalProducts = () => {
    return suppliers.reduce((sum, s) => sum + s.total_products, 0);
  };

  const getTotalLowStockItems = () => {
    return suppliers.reduce((sum, s) => sum + s.low_stock_count, 0);
  };

  const handleSupplierCreated = (newSupplier: Supplier) => {
    // Refresh the suppliers list to show the new supplier
    refresh();
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowAddSupplierModal(true);
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${supplier.name}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      const success = await deleteSupplier(supplier.id);
      if (success) {
        // Supplier will be automatically removed from the list by the hook
        console.log(`Supplier "${supplier.name}" deleted successfully`);
      }
    }
  };

  const handleSupplierUpdated = (updatedSupplier: Supplier) => {
    // The supplier list will be automatically updated by the hook
    setEditingSupplier(null);
    setShowAddSupplierModal(false);
  };

  const handleCloseModal = () => {
    setShowAddSupplierModal(false);
    setEditingSupplier(null);
  };

  return (
    <div className="bg-base-100 p-3">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-base-content/70">
            Manage suppliers and monitor their product inventory
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddSupplierModal(true)}
            className="btn btn-primary gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>
          <button 
            onClick={refresh}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle className="h-4 w-4" />
          <div>
            <div className="font-bold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Suppliers</div>
          <div className="stat-value text-primary">{getTotalSuppliers()}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Products</div>
          <div className="stat-value text-info">{getTotalProducts()}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Suppliers with Low Stock</div>
          <div className="stat-value text-warning">{getLowStockCount()}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Low Stock Items</div>
          <div className="stat-value text-error">{getTotalLowStockItems()}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <label className="input input-bordered flex w-full max-w-md items-center gap-2">
          <Search className="h-4 w-4 opacity-50" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="grow"
          />
        </label>

        {/* Filters */}
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            <span className="text-sm">Show only suppliers with low stock</span>
          </label>
        </div>

        {/* Results Count */}
        <div className="text-sm text-base-content/70">
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-2">Loading suppliers...</span>
        </div>
      )}

      {/* Suppliers Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="card-title text-lg">{supplier.name}</h3>
                    {supplier.contact && (
                      <div className="flex items-center gap-1 text-sm text-base-content/70">
                        <Phone className="h-3 w-3" />
                        {supplier.contact}
                      </div>
                    )}
                  </div>
                  {supplier.has_low_stock && (
                    <div className="badge badge-error gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="stat p-3 bg-base-200 rounded-lg">
                    <div className="stat-title text-xs">Products</div>
                    <div className="stat-value text-lg">{supplier.total_products}</div>
                  </div>
                  <div className="stat p-3 bg-base-200 rounded-lg">
                    <div className="stat-title text-xs">Stock Value</div>
                    <div className="stat-value text-lg">{formatPrice(supplier.total_stock_value)}</div>
                  </div>
                </div>

                {supplier.low_stock_count > 0 && (
                  <div className="alert alert-warning mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                      <div className="font-bold">Low Stock Alert</div>
                      <div className="text-sm">
                        {supplier.low_stock_count} product{supplier.low_stock_count !== 1 ? 's' : ''} need restocking
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-actions justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="btn btn-outline btn-sm gap-2"
                      title="Edit Supplier"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier)}
                      className="btn btn-error btn-sm gap-2"
                      title="Delete Supplier"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => handleViewProducts(supplier)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Products
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSuppliers.length === 0 && (
        <div className="py-8 text-center">
          <div className="mb-4 text-6xl opacity-20">🏭</div>
          <h3 className="mb-2 text-lg font-semibold">
            No suppliers found
          </h3>
          <p className="text-base-content/60">
            {searchTerm || filterLowStock
              ? "No suppliers match your search criteria."
              : "No suppliers available."}
          </p>
        </div>
      )}

      {/* Products Modal */}
      {showProductsModal && selectedSupplier && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-6xl">
            <h3 className="font-bold text-lg mb-4">
              Products from {selectedSupplier.name}
            </h3>
            
            {productsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
                <span className="ml-2">Loading products...</span>
              </div>
            ) : (
              <>
                {/* Supplier Info */}
                <div className="mb-6 p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedSupplier.name}</h4>
                      {selectedSupplier.contact && (
                        <p className="text-sm text-base-content/70">{selectedSupplier.contact}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-base-content/70">Total Products</div>
                      <div className="text-2xl font-bold">{supplierProducts.length}</div>
                    </div>
                  </div>
                </div>

                {/* Low Stock Alert */}
                {supplierProducts.filter(p => p.is_low_stock).length > 0 && (
                  <div className="alert alert-warning mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                      <div className="font-bold">Low Stock Alert</div>
                      <div className="text-sm">
                        {supplierProducts.filter(p => p.is_low_stock).length} products need restocking
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Brand</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Supplier Price / Margin</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Listing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierProducts.map((product) => (
                        <tr key={product.id} className="hover">
                          <td>
                            <div>
                              <div className="font-semibold">{product.name}</div>
                              <div className="text-sm text-base-content/70">{product.variant_attribute}</div>
                            </div>
                          </td>
                          <td>
                            <div className="badge badge-outline">{product.brand}</div>
                          </td>
                          <td>
                            <div className="font-mono text-sm">{product.sku}</div>
                          </td>
                          <td>
                            <div className="font-semibold">{formatPrice(product.price)}</div>
                          </td>
                          <td>
                            <div className="text-sm">
                              {product.supplier_price ? (
                                <div>
                                  <div className="text-base-content/70">{formatPrice(product.supplier_price)}</div>
                                  <div className="text-xs text-success">
                                    +{formatPrice(product.price - product.supplier_price)} 
                                    ({Math.round(((product.price - product.supplier_price) / product.supplier_price) * 100)}%)
                                  </div>
                                </div>
                              ) : (
                                <span className="text-base-content/50">No data</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${
                                product.is_low_stock ? 'text-error' : 'text-success'
                              }`}>
                                {product.stock}
                              </span>
                              {product.is_low_stock && (
                                <AlertTriangle className="h-4 w-4 text-error" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className={`badge ${
                              product.available ? 'badge-success' : 'badge-error'
                            }`}>
                              {product.available ? 'Available' : 'Unavailable'}
                            </div>
                          </td>
                          <td>
                            {product.product_listing ? (
                              <div className="text-sm">
                                <div className="font-medium">{product.product_listing.name}</div>
                                <div className="text-base-content/70">{product.product_listing.slug}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-base-content/50">No listing</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {supplierProducts.length === 0 && (
                    <div className="py-8 text-center">
                      <div className="mb-4 text-6xl opacity-20">📦</div>
                      <h3 className="mb-2 text-lg font-semibold">
                        No products found
                      </h3>
                      <p className="text-base-content/60">
                        This supplier has no products in the inventory.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowProductsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Add/Edit Supplier Modal */}
      <SupplierFormModal
        isOpen={showAddSupplierModal}
        onClose={handleCloseModal}
        onSuccess={editingSupplier ? handleSupplierUpdated : handleSupplierCreated}
        editingSupplier={editingSupplier}
      />
    </div>
  );
}

export default StaffSuppliers;
