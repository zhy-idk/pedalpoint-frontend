import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Download,
  AlertTriangle,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { useInventoryWebSocket } from "../../hooks/useInventoryWebSocket";
import { useInventoryAPI } from "../../hooks/useInventoryAPI";
import api from "../../api/index";


interface InventoryItem {
  id: number;
  name: string;
  variant_attribute: string;
  brand: string;
  price: number;
  stock: number;
  sku: string;
  available: boolean;
  product_listing?: number;
}

function StaffInventory() {
  // Use real-time WebSocket data
  const { inventory, isConnected, error: wsError, refreshInventory } = useInventoryWebSocket();
  const { loading, error: apiError, csrfReady, createItem, updateItem, deleteItem, bulkUpdate } = useInventoryAPI();
  
  // Use WebSocket data as the source of truth
  const items = inventory;

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState<Array<{id: number, name: string}>>([]);
  const [filters, setFilters] = useState({
    productName: "",
    variant: "",
    brand: "",
    stockRange: "all", // all, low, out, in
    status: "all", // all, available, unavailable
    minStock: "",
    maxStock: "",
  });
  const [newItem, setNewItem] = useState<Omit<InventoryItem, "id">>({
    name: "",
    variant_attribute: "",
    brand: "",
    price: 0,
    stock: 0,
    sku: "",
    available: true,
  });

  const LOW_STOCK_THRESHOLD = 5;

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log('Fetching brands from /api/brands/');
        
        // Try using the existing API client first
        const response = await api.get('/api/brands/');
        console.log('Brands response:', response);
        setBrands(response.data);
        
      } catch (error) {
        console.error('Failed to fetch brands with API client:', error);
        
        // Fallback to direct fetch
        try {
          console.log('Trying direct fetch as fallback...');
          const response = await fetch('/api/brands/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          console.log('Direct fetch response status:', response.status);
          
          if (response.ok) {
            const brandsData = await response.json();
            console.log('Brands data received via direct fetch:', brandsData);
            setBrands(brandsData);
          } else {
            console.error('Direct fetch failed. Status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
          }
        } catch (fetchError) {
          console.error('Direct fetch also failed:', fetchError);
        }
      }
    };
    fetchBrands();
  }, []);

  // API operation functions
  const handleCreateItem = async () => {
    try {
      console.log('Creating item with data:', {
        name: newItem.name,
        variant_attribute: newItem.variant_attribute,
        brand: parseInt(newItem.brand as string) || 1,
        price: newItem.price,
        stock: newItem.stock,
        sku: newItem.sku,
        available: newItem.available,
      });

      await createItem({
        name: newItem.name,
        variant_attribute: newItem.variant_attribute,
        brand: parseInt(newItem.brand as string) || 1,
        price: newItem.price,
        stock: newItem.stock,
        sku: newItem.sku,
        available: newItem.available,
      });
      
      // Reset form
      setNewItem({
        name: "",
        variant_attribute: "",
        brand: "",
        price: 0,
        stock: 0,
        sku: "",
        available: true,
      });
      
      // Close modal if open
      const modal = document.getElementById('create_modal') as HTMLDialogElement;
      if (modal) modal.close();
      
      // Show success message
      alert('Item created successfully!');
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to create item. Please check the console for details.');
    }
  };

  const handleUpdateItem = async (item: InventoryItem) => {
    try {
      console.log('Updating item with data:', {
        id: item.id,
        name: item.name,
        variant_attribute: item.variant_attribute,
        price: item.price,
        stock: item.stock,
        sku: item.sku,
        available: item.available,
      });

      await updateItem(item.id, {
        name: item.name,
        variant_attribute: item.variant_attribute,
        price: item.price,
        stock: item.stock,
        sku: item.sku,
        available: item.available,
      });
      
      // Close modal if open
      const modal = document.getElementById('edit_modal') as HTMLDialogElement;
      if (modal) modal.close();
      
      // Show success message
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please check the console for details.');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleBulkUpdate = async (updates: Array<{id: number, stock?: number, price?: number, available?: boolean}>) => {
    try {
      await bulkUpdate(updates);
    } catch (error) {
      console.error('Failed to bulk update items:', error);
    }
  };

  const filteredItems = items.filter((item) => {
    // Text search
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variant_attribute.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    // Product Name filter
    const matchesProductName =
      !filters.productName ||
      item.name.toLowerCase().includes(filters.productName.toLowerCase());

    // Variant filter
    const matchesVariant =
      !filters.variant ||
      item.variant_attribute.toLowerCase().includes(filters.variant.toLowerCase());

    // Brand filter
    const matchesBrand =
      !filters.brand ||
      item.brand.toLowerCase().includes(filters.brand.toLowerCase());

    // Stock range filter
    const matchesStockRange = () => {
      switch (filters.stockRange) {
        case "low":
          return item.stock <= LOW_STOCK_THRESHOLD && item.stock > 0;
        case "out":
          return item.stock === 0;
        case "in":
          return item.stock > LOW_STOCK_THRESHOLD;
        default:
          return true;
      }
    };

    // Stock number range filter
    const matchesStockNumbers = () => {
      const min = filters.minStock ? parseInt(filters.minStock) : 0;
      const max = filters.maxStock ? parseInt(filters.maxStock) : Infinity;
      return item.stock >= min && item.stock <= max;
    };

    // Available status filter
    const matchesStatus = () => {
      switch (filters.status) {
        case "available":
          return item.available;
        case "unavailable":
          return !item.available;
        default:
          return true;
      }
    };

    // Legacy low stock filter (for backward compatibility)
    const matchesLowStock =
      !showLowStockOnly || item.stock <= LOW_STOCK_THRESHOLD;

    return (
      matchesSearch &&
      matchesProductName &&
      matchesVariant &&
      matchesBrand &&
      matchesStockRange() &&
      matchesStockNumbers() &&
      matchesStatus() &&
      matchesLowStock
    );
  });

  // Get unique values for filter dropdowns
  const uniqueProductNames = [...new Set(items.map((item) => item.name))];
  const uniqueVariants = [...new Set(items.map((item) => item.variant_attribute))];
  const uniqueBrands = [...new Set(items.map((item) => item.brand))];

  const clearAllFilters = () => {
    setFilters({
      productName: "",
      variant: "",
      brand: "",
      stockRange: "all",
      status: "all",
      minStock: "",
      maxStock: "",
    });
    setSearchTerm("");
    setShowLowStockOnly(false);
  };

  // const lowStockCount = items.filter(
  //   (item) => item.stock <= LOW_STOCK_THRESHOLD,
  // ).length;

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    const dialog = document.getElementById("edit_modal") as HTMLDialogElement;
    dialog?.showModal();
  };

  const openCreateModal = () => {
    setNewItem({
      name: "",
      variant_attribute: "",
      brand: "",
      price: 0,
      stock: 0,
      sku: "",
      available: true,
    });
    const dialog = document.getElementById("create_modal") as HTMLDialogElement;
    dialog?.showModal();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateItem();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      handleUpdateItem(selectedItem);
    }
  };

  const handleDelete = () => {
    if (selectedItem) {
      handleDeleteItem(selectedItem.id);
      const editDialog = document.getElementById(
        "edit_modal",
      ) as HTMLDialogElement;
      const confirmDialog = document.getElementById(
        "confirm_modal",
      ) as HTMLDialogElement;
      editDialog?.close();
      confirmDialog?.close();
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", class: "badge-error" };
    if (stock <= LOW_STOCK_THRESHOLD)
      return { text: "Low Stock", class: "badge-warning" };
    return { text: "In Stock", class: "badge-success" };
  };

  return (
    <div className="bg-base-100 p-3">

      {/* Connection Status and Error Display */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* WebSocket Status */}
          {isConnected ? (
            <div className="flex items-center gap-2 text-success">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Real-time connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-warning">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}
          
          {/* CSRF Status */}
          {csrfReady ? (
            <div className="flex items-center gap-2 text-success">
              <CheckSquare className="h-4 w-4" />
              <span className="text-sm">API ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">API initializing...</span>
            </div>
          )}
          
          <button
            onClick={refreshInventory}
            className="btn btn-ghost btn-sm"
            disabled={loading || !csrfReady}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {(wsError || apiError) && (
          <div className="alert alert-error">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{wsError || apiError}</span>
          </div>
        )}
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <label className="input input-xl flex w-full items-center gap-2">
          <Search className="h-5 w-5 opacity-50" />
          <input
            type="search"
            placeholder="Search product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        <button className="btn btn-neutral" onClick={openCreateModal}>
          <Plus className="h-5 w-5" />
          Add new Item
        </button>

        <button className="btn btn-accent">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-base-200 mb-4 rounded-lg p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-lg font-semibold">Filters</h4>
          <button onClick={clearAllFilters} className="btn btn-sm btn-outline">
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Product Name Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Product Name</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.productName}
              onChange={(e) =>
                setFilters({ ...filters, productName: e.target.value })
              }
            >
              <option value="">All Products</option>
              {uniqueProductNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Variant Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Variant</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.variant}
              onChange={(e) =>
                setFilters({ ...filters, variant: e.target.value })
              }
            >
              <option value="">All Variants</option>
              {uniqueVariants.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Brand</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.brand}
              onChange={(e) =>
                setFilters({ ...filters, brand: e.target.value })
              }
            >
              <option value="">All Brands</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Stock Status</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.stockRange}
              onChange={(e) =>
                setFilters({ ...filters, stockRange: e.target.value })
              }
            >
              <option value="all">All Stock Levels</option>
              <option value="in">In Stock (&gt;{LOW_STOCK_THRESHOLD})</option>
              <option value="low">Low Stock (1-{LOW_STOCK_THRESHOLD})</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          {/* Available Status Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Available</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All Items</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>

          {/* Stock Range Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Stock Range</span>
            </label>
            <div className="flex gap-1">
              <input
                type="number"
                placeholder="Min"
                className="input input-sm input-bordered w-full"
                value={filters.minStock}
                onChange={(e) =>
                  setFilters({ ...filters, minStock: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="input input-sm input-bordered w-full"
                value={filters.maxStock}
                onChange={(e) =>
                  setFilters({ ...filters, maxStock: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Active filters display */}
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.productName && (
            <div className="badge badge-primary gap-1">
              Product: {filters.productName}
              <button
                onClick={() => setFilters({ ...filters, productName: "" })}
                className="hover:text-primary-content text-xs"
              >
                ×
              </button>
            </div>
          )}
          {filters.variant && (
            <div className="badge badge-secondary gap-1">
              Variant: {filters.variant}
              <button
                onClick={() => setFilters({ ...filters, variant: "" })}
                className="hover:text-secondary-content text-xs"
              >
                ×
              </button>
            </div>
          )}
          {filters.brand && (
            <div className="badge badge-accent gap-1">
              Brand: {filters.brand}
              <button
                onClick={() => setFilters({ ...filters, brand: "" })}
                className="hover:text-accent-content text-xs"
              >
                ×
              </button>
            </div>
          )}
          {filters.stockRange !== "all" && (
            <div className="badge badge-info gap-1">
              Stock:{" "}
              {filters.stockRange === "in"
                ? "In Stock"
                : filters.stockRange === "low"
                  ? "Low Stock"
                  : "Out of Stock"}
              <button
                onClick={() => setFilters({ ...filters, stockRange: "all" })}
                className="hover:text-info-content text-xs"
              >
                ×
              </button>
            </div>
          )}
          {filters.status !== "all" && (
            <div className="badge badge-success gap-1">
              Status:{" "}
              {filters.status === "available" ? "Available" : "Unavailable"}
              <button
                onClick={() => setFilters({ ...filters, status: "all" })}
                className="hover:text-success-content text-xs"
              >
                ×
              </button>
            </div>
          )}
          {(filters.minStock || filters.maxStock) && (
            <div className="badge badge-warning gap-1">
              Range: {filters.minStock || "0"}-{filters.maxStock || "∞"}
              <button
                onClick={() =>
                  setFilters({ ...filters, minStock: "", maxStock: "" })
                }
                className="hover:text-warning-content text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Variant</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>SKU</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item.stock);
              return (
                <tr
                  key={item.id}
                  className="hover:bg-base-200 hover:cursor-pointer"
                  onClick={() => openEditModal(item)}
                >
                  <th>{item.id}</th>
                  <td>{item.name}</td>
                  <td>{item.variant_attribute}</td>
                  <td>{item.brand}</td>
                  <td>₱ {item.price.toLocaleString()}</td>
                  <td className="flex items-center gap-2">
                    {item.stock}
                    {item.stock <= LOW_STOCK_THRESHOLD && item.stock > 0 && (
                      <AlertTriangle className="text-warning h-4 w-4" />
                    )}
                    {item.stock === 0 && (
                      <AlertTriangle className="text-error h-4 w-4" />
                    )}
                  </td>
                  <td>
                    <div className={`badge ${stockStatus.class}`}>
                      {stockStatus.text}
                    </div>
                  </td>
                  <td className="font-mono text-sm">{item.sku}</td>
                  <td>
                    {item.available ? (
                      <CheckSquare className="text-success h-5 w-5" />
                    ) : (
                      <div className="border-base-300 h-5 w-5 rounded border-2"></div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <dialog id="create_modal" className="modal">
        <div className="modal-box">
          <h3 className="mb-2 text-lg font-bold">Create Item</h3>

          <div className="flex flex-col gap-2">
            <label className="floating-label">
              <span>Product Name</span>
              <label className="input w-full">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  required
                />
              </label>
            </label>

            <label className="floating-label">
              <span>Variant</span>
              <label className="input w-full">
                <input
                  type="text"
                  placeholder="Variant"
                  value={newItem.variant_attribute}
                  onChange={(e) =>
                    setNewItem({ ...newItem, variant_attribute: e.target.value })
                  }
                  required
                />
              </label>
            </label>

            <label className="floating-label">
              <span>Brand</span>
              <select
                className="select select-bordered w-full"
                value={newItem.brand}
                onChange={(e) =>
                  setNewItem({ ...newItem, brand: e.target.value })
                }
                required
              >
                <option value="">Select a brand</option>
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))
                ) : (
                  <option value="1" disabled>Loading brands...</option>
                )}
              </select>
            </label>

            <label className="floating-label">
              <span>Price</span>
              <label className="input w-full">
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                  required
                />
              </label>
            </label>

            <label className="floating-label">
              <span>Stock</span>
              <label className="input w-full">
                <input
                  type="number"
                  placeholder="Stock"
                  value={newItem.stock || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, stock: Number(e.target.value) })
                  }
                  required
                />
              </label>
            </label>

            <label className="floating-label">
              <span>SKU</span>
              <label className="input w-full">
                <input
                  type="text"
                  placeholder="SKU"
                  value={newItem.sku}
                  onChange={(e) =>
                    setNewItem({ ...newItem, sku: e.target.value })
                  }
                  required
                />
              </label>
            </label>

            <div className="flex gap-2">
              <span>Available?</span>
              <input
                type="checkbox"
                checked={newItem.available}
                onChange={(e) =>
                  setNewItem({ ...newItem, available: e.target.checked })
                }
                className="checkbox checkbox-success"
              />
            </div>

            <button
              onClick={handleCreateSubmit}
              className="btn btn-primary w-full"
              disabled={!csrfReady || loading}
            >
              {loading ? 'Creating...' : 'Save'}
            </button>
          </div>

          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
            onClick={() => {
              const dialog = document.getElementById(
                "create_modal",
              ) as HTMLDialogElement;
              dialog?.close();
            }}
          >
            ✕
          </button>
        </div>
      </dialog>

      {/* Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="mb-2 text-lg font-bold">Edit Item</h3>

          {selectedItem && (
            <div className="flex flex-col gap-2">
              <label className="floating-label">
                <span>Product Name</span>
                <label className="input w-full">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={selectedItem.name}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, name: e.target.value })
                    }
                  />
                </label>
              </label>

              <label className="floating-label">
                <span>Variant</span>
                <label className="input w-full">
                  <input
                    type="text"
                    placeholder="Variant"
                    value={selectedItem.variant_attribute}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        variant_attribute: e.target.value,
                      })
                    }
                  />
                </label>
              </label>

              <label className="floating-label">
                <span>Brand</span>
                <select
                  className="select select-bordered w-full"
                  value={selectedItem.brand}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      brand: e.target.value,
                    })
                  }
                >
                  <option value="">Select a brand</option>
                  {brands.length > 0 ? (
                    brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))
                  ) : (
                    <option value="1" disabled>Loading brands...</option>
                  )}
                </select>
              </label>

              <label className="floating-label">
                <span>Price</span>
                <label className="input w-full">
                  <input
                    type="number"
                    placeholder="Price"
                    value={selectedItem.price}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </label>

              <label className="floating-label">
                <span>Stock</span>
                <label className="input w-full">
                  <input
                    type="number"
                    placeholder="Stock"
                    value={selectedItem.stock}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        stock: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </label>

              <label className="floating-label">
                <span>SKU</span>
                <label className="input w-full">
                  <input
                    type="text"
                    placeholder="SKU"
                    value={selectedItem.sku}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, sku: e.target.value })
                    }
                  />
                </label>
              </label>

              <div className="flex gap-2">
                <span>Available?</span>
                <input
                  type="checkbox"
                  checked={selectedItem.available}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      available: e.target.checked,
                    })
                  }
                  className="checkbox checkbox-success"
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-warning flex-1"
                  onClick={() => {
                    const dialog = document.getElementById(
                      "confirm_modal",
                    ) as HTMLDialogElement;
                    dialog?.showModal();
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="btn btn-neutral flex-1"
                  disabled={!csrfReady || loading}
                >
                  {loading ? 'Updating...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
            onClick={() => {
              const dialog = document.getElementById(
                "edit_modal",
              ) as HTMLDialogElement;
              dialog?.close();
            }}
          >
            ✕
          </button>
        </div>
      </dialog>

      {/* Confirm Delete Modal */}
      <dialog id="confirm_modal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            Are you sure you want to delete this item?
          </h3>

          {selectedItem && (
            <div className="bg-base-200 my-4 flex flex-col gap-2 rounded-lg p-4">
              <div>
                <strong>Product:</strong> {selectedItem.name}
              </div>
              <div>
                <strong>Variant:</strong> {selectedItem.variant_attribute}
              </div>
              <div>
                <strong>Brand:</strong> {selectedItem.brand}
              </div>
              <div>
                <strong>Price:</strong> ₱ {selectedItem.price.toLocaleString()}
              </div>
              <div>
                <strong>Stock:</strong> {selectedItem.stock}
              </div>
              <div>
                <strong>SKU:</strong> {selectedItem.sku}
              </div>
              <div>
                <strong>Available:</strong>{" "}
                {selectedItem.available ? "Yes" : "No"}
              </div>
            </div>
          )}

          <div className="modal-action">
            <div className="flex gap-2">
              <button
                className="btn"
                onClick={() => {
                  const dialog = document.getElementById(
                    "confirm_modal",
                  ) as HTMLDialogElement;
                  dialog?.close();
                }}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default StaffInventory;
