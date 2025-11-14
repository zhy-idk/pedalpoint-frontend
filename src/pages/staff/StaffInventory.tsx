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
  Eye,
} from "lucide-react";
import { useInventoryWebSocket } from "../../hooks/useInventoryWebSocket";
import { useInventoryAPI } from "../../hooks/useInventoryAPI";
import { useSuppliers } from "../../hooks/useSuppliers";
import api, { apiBaseUrl } from "../../api/index";

interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
}

interface InventoryItem {
  id: number;
  name: string;
  variant_attribute: string;
  brand: string | number; // Can be brand name (from API) or brand ID (when editing)
  price: number;
  supplier_price?: number;
  stock: number;
  sku: string;
  available: boolean;
  product_listing?: number;
  supply?: string;
  supply_id?: number;
  brand_id?: number; // Store the actual brand ID for editing
  product_images?: ProductImage[];
}

function StaffInventory() {
  // Use real-time WebSocket data
  const {
    inventory,
    isConnected,
    error: wsError,
    refreshInventory,
  } = useInventoryWebSocket();
  const {
    loading,
    error: apiError,
    csrfReady,
    createItem,
    updateItem,
    deleteItem,
    bulkUpdate,
  } = useInventoryAPI();
  const { suppliers } = useSuppliers();

  // Use WebSocket data as the source of truth
  const items = inventory;

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingNewBrandEdit, setIsCreatingNewBrandEdit] = useState(false);
  const [newBrandNameEdit, setNewBrandNameEdit] = useState("");
  const [filters, setFilters] = useState({
    productName: "",
    variant: "",
    brand: "",
    stockRange: "all", // all, low, out, in
    status: "all", // all, available, unavailable
    minStock: "",
    maxStock: "",
  });
  const [newItem, setNewItem] = useState<
    Omit<InventoryItem, "id"> & { supplier_id?: number }
  >({
    name: "",
    variant_attribute: "",
    brand: "",
    price: 0,
    stock: 0,
    sku: "",
    available: true,
    supplier_id: undefined,
  });
  const [newItemImages, setNewItemImages] = useState<File[]>([]);
  const [editItemImages, setEditItemImages] = useState<File[]>([]);

  const LOW_STOCK_THRESHOLD = 5;

  // Function to generate SKU automatically
  const generateSKU = (
    name: string,
    variant: string,
    brandValue: string,
    supplierId?: number,
  ) => {
    // brandValue can be either brand ID (for new items) or brand name (for existing items)
    let brandName = "";
    const brandById = brands.find((b) => b.id === parseInt(brandValue));
    const brandByName = brands.find((b) => b.name === brandValue);

    if (brandById) {
      brandName = brandById.name;
    } else if (brandByName) {
      brandName = brandByName.name;
    } else {
      brandName = brandValue; // Use as-is if not found
    }

    const supplierObj = suppliers.find((s) => s.id === supplierId);

    const namePart =
      name
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "") || "XXX";
    const variantPart =
      variant
        .substring(0, 2)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "") || "XX";
    const brandPart =
      brandName
        .substring(0, 2)
        .toUpperCase()
        .replace(/[^A-Z]/g, "") || "XX";
    const supplierPart =
      supplierObj?.name
        .substring(0, 2)
        .toUpperCase()
        .replace(/[^A-Z]/g, "") || "XX";
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `${namePart}-${variantPart}-${brandPart}-${supplierPart}-${randomPart}`;
  };

  // Function to update newItem and auto-generate SKU
  const updateNewItem = (updates: Partial<typeof newItem>) => {
    const updatedItem = { ...newItem, ...updates };

    // Auto-generate SKU when key fields change
    if (updatedItem.name && updatedItem.brand) {
      updatedItem.sku = generateSKU(
        updatedItem.name,
        updatedItem.variant_attribute,
        updatedItem.brand.toString(),
        updatedItem.supplier_id,
      );
    }

    setNewItem(updatedItem);
  };

  // Function to update selectedItem and auto-generate SKU
  const updateSelectedItem = (updates: Partial<InventoryItem>) => {
    if (!selectedItem) return;

    const updatedItem = { ...selectedItem, ...updates };

    // Auto-generate SKU when key fields change
    // Use brand_id if available, otherwise fall back to brand
    const brandValue = updatedItem.brand_id || updatedItem.brand;
    if (updatedItem.name && brandValue) {
      updatedItem.sku = generateSKU(
        updatedItem.name,
        updatedItem.variant_attribute,
        brandValue.toString(),
        updatedItem.supply_id,
      );
    }

    setSelectedItem(updatedItem);
  };

  // Function to create a new brand (for add form)
  const handleCreateBrandInAdd = async () => {
    if (!newBrandName.trim()) return;

    try {
      const response = await api.post("/api/brands/create/", {
        name: newBrandName,
      });
      const newBrand = response.data;
      setBrands([...brands, newBrand]);
      updateNewItem({ brand: newBrand.id.toString() });
      setNewBrandName("");
      setIsCreatingNewBrand(false);
    } catch (error) {
      console.error("Failed to create brand:", error);
      alert("Failed to create brand. Please try again.");
    }
  };

  // Function to create a new brand (for edit form)
  const handleCreateBrandInEdit = async () => {
    if (!newBrandNameEdit.trim()) return;

    try {
      const response = await api.post("/api/brands/create/", {
        name: newBrandNameEdit,
      });
      const newBrand = response.data;
      setBrands([...brands, newBrand]);
      updateSelectedItem({
        brand_id: newBrand.id,
        brand: newBrand.name,
      });
      setNewBrandNameEdit("");
      setIsCreatingNewBrandEdit(false);
    } catch (error) {
      console.error("Failed to create brand:", error);
      alert("Failed to create brand. Please try again.");
    }
  };

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log("Fetching brands from /api/brands/");

        // Try using the existing API client first
        const response = await api.get("/api/brands/");
        console.log("Brands response:", response);
        setBrands(response.data);
      } catch (error) {
        console.error("Failed to fetch brands with API client:", error);

        // Fallback to direct fetch
        try {
          console.log("Trying direct fetch as fallback...");
          const response = await fetch(`${apiBaseUrl}/api/brands/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          console.log("Direct fetch response status:", response.status);

          if (response.ok) {
            const brandsData = await response.json();
            console.log("Brands data received via direct fetch:", brandsData);
            setBrands(brandsData);
          } else {
            console.error("Direct fetch failed. Status:", response.status);
            const errorText = await response.text();
            console.error("Error response:", errorText);
          }
        } catch (fetchError) {
          console.error("Direct fetch also failed:", fetchError);
        }
      }
    };
    fetchBrands();
  }, []);

  // API operation functions
  const handleCreateItem = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("variant_attribute", newItem.variant_attribute);
      formData.append(
        "brand",
        (parseInt(newItem.brand as string) || 1).toString(),
      );
      formData.append("price", newItem.price.toString());
      formData.append("stock", newItem.stock.toString());
      formData.append("sku", newItem.sku);
      formData.append("available", newItem.available ? "1" : "0");
      if (newItem.supplier_id) {
        formData.append("supplier_id", newItem.supplier_id.toString());
      }

      // Add images
      newItemImages.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });

      // Use axios which handles CSRF tokens automatically
      await api.post("/api/inventory/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
        supplier_id: undefined,
      });
      setNewItemImages([]);

      // Reset file input
      const fileInput = document.getElementById(
        "new-item-images-input",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Close modal if open
      const modal = document.getElementById(
        "create_modal",
      ) as HTMLDialogElement;
      if (modal) modal.close();

      // Show success message
      alert("Item created successfully!");
    } catch (error) {
      console.error("Failed to create item:", error);
      alert("Failed to create item. Please check the console for details.");
    }
  };

  const handleUpdateItem = async (item: InventoryItem) => {
    try {
      if (!item.brand_id) {
        alert("Please select a brand");
        return;
      }

      const formData = new FormData();
      formData.append("name", item.name);
      formData.append("variant_attribute", item.variant_attribute);
      formData.append("brand", item.brand_id.toString());
      formData.append("price", item.price.toString());
      formData.append("stock", item.stock.toString());
      formData.append("sku", item.sku);
      formData.append("available", item.available ? "1" : "0");
      if (item.supply_id) {
        formData.append("supplier_id", item.supply_id.toString());
      }

      // Add images if any
      editItemImages.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });

      // Use axios which handles CSRF tokens automatically
      await api.put(`/api/inventory/${item.id}/update/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setEditItemImages([]);

      // Reset file input
      const fileInput = document.getElementById(
        "edit-item-images-input",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Close modal if open
      const modal = document.getElementById("edit_modal") as HTMLDialogElement;
      if (modal) modal.close();

      // Show success message
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Failed to update item:", error);
      alert("Failed to update item. Please check the console for details.");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await api.delete(`/api/inventory/image/${imageId}/delete/`);

      // Update selectedItem to remove the deleted image
      if (selectedItem && selectedItem.product_images) {
        setSelectedItem({
          ...selectedItem,
          product_images: selectedItem.product_images.filter(
            (img) => img.id !== imageId,
          ),
        });
      }

      alert("Image deleted successfully!");
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Failed to delete image. Please try again.");
    }
  };

  const handleBulkUpdate = async (
    updates: Array<{
      id: number;
      stock?: number;
      price?: number;
      available?: boolean;
    }>,
  ) => {
    try {
      await bulkUpdate(updates);
    } catch (error) {
      console.error("Failed to bulk update items:", error);
    }
  };

  const filteredItems = items.filter((item) => {
    // Text search
    const matchesSearch = (() => {
      if (!searchTerm) return true;

      const term = searchTerm.toLowerCase();

      // Search in product name
      if (item.name.toLowerCase().includes(term)) return true;

      // Search in SKU
      if (item.sku.toLowerCase().includes(term)) return true;

      // Search in variant attribute
      if (item.variant_attribute.toLowerCase().includes(term)) return true;

      // Search in brand (both ID and name)
      if (item.brand) {
        // Check brand ID
        if (item.brand.toLowerCase().includes(term)) return true;

        // Check brand name
        const brandObj = brands.find((b) => b.id === parseInt(item.brand));
        if (brandObj && brandObj.name.toLowerCase().includes(term)) return true;
      }

      return false;
    })();

    // Product Name filter
    const matchesProductName =
      !filters.productName ||
      item.name.toLowerCase().includes(filters.productName.toLowerCase());

    // Variant filter
    const matchesVariant =
      !filters.variant ||
      item.variant_attribute
        .toLowerCase()
        .includes(filters.variant.toLowerCase());

    // Brand filter
    const matchesBrand = (() => {
      if (!filters.brand) return true;
      if (!item.brand) return false;

      // Check if the filter matches the brand ID directly (for backward compatibility)
      if (item.brand.toLowerCase().includes(filters.brand.toLowerCase())) return true;

      // Check if the filter matches the brand name
      const brandObj = brands.find((b) => b.id === parseInt(item.brand));
      return brandObj && brandObj.name.toLowerCase().includes(filters.brand.toLowerCase());
    })();

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
  const uniqueVariants = [
    ...new Set(items.map((item) => item.variant_attribute)),
  ];
  const uniqueBrands = [...new Set(
    items.map((item) => {
      if (!item.brand) return null;
      const brandObj = brands.find((b) => b.id === parseInt(item.brand));
      return brandObj ? brandObj.name : item.brand;
    }).filter(Boolean)
  )];

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
    // Find the brand ID from the brand name
    const brandObj = brands.find(
      (b) => b.name === item.brand || b.id === item.brand,
    );
    const itemWithBrandId = {
      ...item,
      brand_id:
        brandObj?.id ||
        (typeof item.brand === "number" ? item.brand : undefined),
    };
    setSelectedItem(itemWithBrandId);
    setEditItemImages([]);
    setIsCreatingNewBrandEdit(false);
    setNewBrandNameEdit("");

    // Reset file input
    const fileInput = document.getElementById(
      "edit-item-images-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";

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
      supplier_id: undefined,
    });
    setNewItemImages([]);
    setIsCreatingNewBrand(false);
    setNewBrandName("");

    // Reset file input
    const fileInput = document.getElementById(
      "new-item-images-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    const dialog = document.getElementById("create_modal") as HTMLDialogElement;
    dialog?.showModal();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrfReady) {
      alert("CSRF token not ready. Please wait a moment and try again.");
      return;
    }
    handleCreateItem();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrfReady) {
      alert("CSRF token not ready. Please wait a moment and try again.");
      return;
    }
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
      <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* WebSocket Status */}
          {isConnected ? (
            <div className="text-success flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Real-time connected</span>
            </div>
          ) : (
            <div className="text-warning flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}

          {/* CSRF Status */}
          {csrfReady ? (
            <div className="text-success flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="text-sm">API ready</span>
            </div>
          ) : (
            <div className="text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">API initializing...</span>
            </div>
          )}

          <button
            onClick={refreshInventory}
            className="btn btn-ghost btn-sm"
            disabled={loading || !csrfReady}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        {(wsError || apiError) && (
          <div className="alert alert-error">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{wsError || apiError}</span>
          </div>
        )}
      </div>

      {/* Low Stock Alert Section */}
      {(() => {
        const lowStockItems = items.filter(
          (item) => item.stock <= LOW_STOCK_THRESHOLD && item.stock > 0,
        );
        const outOfStockItems = items.filter((item) => item.stock === 0);
        const supplierLowStock = lowStockItems.reduce(
          (acc, item) => {
            const supplier = item.supply || "No Supplier";
            if (!acc[supplier]) acc[supplier] = [];
            acc[supplier].push(item);
            return acc;
          },
          {} as Record<string, InventoryItem[]>,
        );

        if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
          return (
            <div className="mb-6">
              <div className="alert alert-warning mb-4">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <div className="font-bold">Inventory Alerts</div>
                  <div className="text-sm">
                    {lowStockItems.length} items are low on stock,{" "}
                    {outOfStockItems.length} items are out of stock
                  </div>
                </div>
              </div>

              {/* Supplier-specific low stock alerts */}
              {Object.keys(supplierLowStock).length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(supplierLowStock).map(([supplier, items]) => (
                    <div key={supplier} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-semibold">{supplier}</h4>
                          <span className="badge badge-warning badge-sm">
                            {items.length} items
                          </span>
                        </div>
                        <div className="space-y-1">
                          {items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-xs"
                            >
                              <span className="truncate">{item.name}</span>
                              <span className="text-warning font-semibold">
                                {item.stock}
                              </span>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="text-base-content/70 text-xs">
                              +{items.length - 3} more items
                            </div>
                          )}
                        </div>
                        <div className="card-actions mt-2 justify-end">
                          <button
                            onClick={() =>
                              window.open("/manage/suppliers", "_blank")
                            }
                            className="btn btn-xs btn-primary"
                          >
                            View Supplier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Out of stock items */}
              {outOfStockItems.length > 0 && (
                <div className="alert alert-error">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Out of Stock Items</div>
                    <div className="text-sm">
                      {outOfStockItems
                        .slice(0, 5)
                        .map((item) => item.name)
                        .join(", ")}
                      {outOfStockItems.length > 5 &&
                        ` and ${outOfStockItems.length - 5} more`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}

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
              <th>Supplier</th>
              <th>Price</th>
              <th>Supplier Price / Margin</th>
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
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-outline">
                        {item.supply || "No Supplier"}
                      </span>
                      {item.supply_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/manage/suppliers`, "_blank");
                          }}
                          className="btn btn-xs btn-ghost"
                          title="View Supplier Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold">
                      ₱ {item.price.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {item.supplier_price ? (
                        <div>
                          <div className="text-base-content/70">
                            ₱ {item.supplier_price.toLocaleString()}
                          </div>
                          <div className="text-success text-xs">
                            +₱{" "}
                            {(
                              item.price - item.supplier_price
                            ).toLocaleString()}
                            (
                            {Math.round(
                              ((item.price - item.supplier_price) /
                                item.supplier_price) *
                                100,
                            )}
                            %)
                          </div>
                        </div>
                      ) : (
                        <span className="text-base-content/50">No data</span>
                      )}
                    </div>
                  </td>
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
        <div className="modal-box max-h-[90vh] max-w-full overflow-y-auto md:max-w-2xl">
          <h3 className="mb-2 text-lg font-bold">Create Item</h3>

          <div className="flex flex-col gap-2">
            <label className="floating-label">
              <span>Product Name</span>
              <label className="input w-full">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newItem.name}
                  onChange={(e) => updateNewItem({ name: e.target.value })}
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
                    updateNewItem({ variant_attribute: e.target.value })
                  }
                  required
                />
              </label>
            </label>

            <label className="floating-label">
              <span>Brand</span>
              <div className="flex gap-2">
                <select
                  className="select select-bordered w-full"
                  value={isCreatingNewBrand ? "new" : newItem.brand}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setIsCreatingNewBrand(true);
                    } else {
                      setIsCreatingNewBrand(false);
                      updateNewItem({ brand: e.target.value });
                    }
                  }}
                  required={!isCreatingNewBrand}
                >
                  <option value="">Select a brand</option>
                  {brands.length > 0 ? (
                    brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))
                  ) : (
                    <option value="1" disabled>
                      Loading brands...
                    </option>
                  )}
                  <option value="new">+ Create New Brand</option>
                </select>
                {isCreatingNewBrand && (
                  <>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Enter brand name"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleCreateBrandInAdd}
                      disabled={!newBrandName.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsCreatingNewBrand(false);
                        setNewBrandName("");
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </label>

            <label className="floating-label">
              <span>Supplier</span>
              <select
                className="select select-bordered w-full"
                value={newItem.supplier_id || ""}
                onChange={(e) =>
                  updateNewItem({
                    supplier_id: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              >
                <option value="">Select a supplier (Optional)</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
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
              <span>SKU (Auto-generated)</span>
              <label className="input input-disabled w-full">
                <input
                  type="text"
                  placeholder="Auto-generated SKU"
                  value={newItem.sku}
                  readOnly
                  className="cursor-not-allowed"
                />
              </label>
              <span className="text-base-content/60 mt-1 text-xs">
                SKU is automatically generated from name, variant, brand, and
                supplier
              </span>
            </label>

            <label className="floating-label">
              <span>Product Images (Optional)</span>
              <input
                id="new-item-images-input"
                type="file"
                accept="image/*"
                multiple
                className="file-input file-input-bordered w-full"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setNewItemImages(files);
                }}
              />
              {newItemImages.length > 0 && (
                <span className="text-base-content/60 mt-1 text-xs">
                  {newItemImages.length} image(s) selected
                </span>
              )}
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
              {loading ? "Creating..." : "Save"}
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
        <div className="modal-box max-h-[90vh] max-w-full overflow-y-auto md:max-w-2xl">
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
                      updateSelectedItem({ name: e.target.value })
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
                      updateSelectedItem({ variant_attribute: e.target.value })
                    }
                  />
                </label>
              </label>

              <label className="floating-label">
                <span>Brand</span>
                <div className="flex gap-2">
                  <select
                    className="select select-bordered w-full"
                    value={
                      isCreatingNewBrandEdit
                        ? "new"
                        : selectedItem.brand_id || ""
                    }
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        setIsCreatingNewBrandEdit(true);
                      } else {
                        setIsCreatingNewBrandEdit(false);
                        const brandId = parseInt(e.target.value);
                        const selectedBrand = brands.find(
                          (b) => b.id === brandId,
                        );
                        if (selectedBrand) {
                          // Update with both brand ID and name for consistency
                          updateSelectedItem({
                            brand_id: selectedBrand.id,
                            brand: selectedBrand.name,
                          });
                        }
                      }
                    }}
                  >
                    <option value="">Select a brand</option>
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))
                    ) : (
                      <option value="1" disabled>
                        Loading brands...
                      </option>
                    )}
                    <option value="new">+ Create New Brand</option>
                  </select>
                  {isCreatingNewBrandEdit && (
                    <>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={newBrandNameEdit}
                        onChange={(e) => setNewBrandNameEdit(e.target.value)}
                        placeholder="Enter brand name"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleCreateBrandInEdit}
                        disabled={!newBrandNameEdit.trim()}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setIsCreatingNewBrandEdit(false);
                          setNewBrandNameEdit("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </label>

              <label className="floating-label">
                <span>Supplier</span>
                <select
                  className="select select-bordered w-full"
                  value={selectedItem.supply_id || ""}
                  onChange={(e) =>
                    updateSelectedItem({
                      supply_id: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Select a supplier (Optional)</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
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
                <label className="input input-disabled w-full">
                  <input
                    type="text"
                    placeholder="Auto-generated SKU"
                    value={selectedItem.sku}
                    readOnly
                    className="cursor-not-allowed"
                  />
                </label>
                <span className="text-base-content/60 mt-1 text-xs">
                  SKU is automatically generated from name, variant, brand, and
                  supplier
                </span>
              </label>

              {/* Existing Images */}
              {selectedItem.product_images &&
                selectedItem.product_images.length > 0 && (
                  <div className="floating-label">
                    <span>Current Images</span>
                    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                      {selectedItem.product_images.map((image) => (
                        <div key={image.id} className="group relative">
                          <img
                            src={
                              image.image.startsWith('http://') || image.image.startsWith('https://')
                                ? image.image
                                : `${apiBaseUrl}${image.image}`
                            }
                            alt={image.alt_text}
                            className="border-base-300 h-24 w-full rounded border object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            className="btn btn-xs btn-error btn-circle absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <label className="floating-label">
                <span>Add Product Images (Optional)</span>
                <input
                  id="edit-item-images-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setEditItemImages(files);
                  }}
                />
                {editItemImages.length > 0 && (
                  <span className="text-base-content/60 mt-1 text-xs">
                    {editItemImages.length} new image(s) selected
                  </span>
                )}
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
                  {loading ? "Updating..." : "Save"}
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
