import { useState, useMemo, useEffect } from 'react';
import { useProductListings, type ProductListing } from '../../hooks/useProductListings';
import { useCategories, type Category } from '../../hooks/useCategories.js';
import { useBrands } from '../../hooks/useBrands.js';
import ListingFormModal from '../../components/staff/ListingFormModal';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Settings, FolderPlus, Folder } from 'lucide-react';
import api from '../../api';
import type { CompatibilityGroup, CompatibilityAttribute, CompatibilityAttributeValue } from '../../types/product';

interface ProductListingCardProps {
  listing: ProductListing;
  onEdit: (listing: ProductListing) => void;
  onDelete: (listingId: number) => void;
}

function ProductListingCard({ listing, onEdit, onDelete }: ProductListingCardProps) {

  const totalStock = (listing.products || []).reduce((sum, product) => sum + (product.stock || 0), 0);
  const availableProducts = (listing.products || []).filter(p => p.available).length;
  const outOfStockProducts = (listing.products || []).filter(p => !p.available).length;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body p-4">
        {/* Header with image and basic info */}
        <div className="flex gap-4 mb-3">
          <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center overflow-hidden">
            {listing.image ? (
              <img 
                src={listing.image} 
                alt={listing.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-base-content/50 text-xs">No Image</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">{listing.name}</h3>
            <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
              <span className="badge badge-outline">{listing.category?.name || 'Uncategorized'}</span>
              <span className="badge badge-outline">{listing.brand?.name || 'Unknown Brand'}</span>
              {listing.bike_builder_enabled && (
                <span className="badge badge-primary badge-sm">
                  🚲 Builder: {listing.builder_category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price and availability */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ₱{listing.price !== null && !isNaN(Number(listing.price)) ? Number(listing.price).toFixed(2) : 'N/A'}
            </span>
            <span className={`badge ${listing.available ? 'badge-success' : 'badge-error'}`}>
              {listing.available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Stock summary */}
        <div className="mb-3">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="font-semibold text-success">{totalStock}</div>
              <div className="text-xs text-base-content/60">Total Stock</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-info">{availableProducts}</div>
              <div className="text-xs text-base-content/60">Available</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-error">{outOfStockProducts}</div>
              <div className="text-xs text-base-content/60">Out of Stock</div>
            </div>
          </div>
        </div>

        {/* Variants preview */}
        {(listing.products || []).length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium mb-2">Variants ({(listing.products || []).length})</div>
            <div className="max-h-20 overflow-y-auto space-y-1">
              {(listing.products || []).slice(0, 3).map((product) => (
                <div key={product.id} className="flex justify-between items-center text-xs">
                  <span className="truncate">{product.variant_attribute || 'N/A'}</span>
                  <span className={`badge badge-sm ${product.available ? 'badge-success' : 'badge-error'}`}>
                    {product.stock || 0}
                  </span>
                </div>
              ))}
              {(listing.products || []).length > 3 && (
                <div className="text-xs text-base-content/60">
                  +{(listing.products || []).length - 3} more variants
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compatibility Info */}
        {(listing.compatibility_attributes && listing.compatibility_attributes.length > 0) && (
          <div className="mb-3">
            <div className="text-xs font-medium mb-1 text-base-content/70">Attributes:</div>
            <div className="flex flex-wrap gap-1">
              {listing.compatibility_attributes.slice(0, 3).map((attr: any) => (
                <span key={attr.id} className="badge badge-sm badge-success badge-outline">
                  {attr.display_name}
                </span>
              ))}
              {listing.compatibility_attributes.length > 3 && (
                <span className="badge badge-sm badge-outline">
                  +{listing.compatibility_attributes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {(listing.compatible_with && listing.compatible_with.length > 0) && (
          <div className="mb-3">
            <div className="text-xs font-medium mb-1 text-base-content/70">Compatible With:</div>
            <div className="flex flex-wrap gap-1">
              {listing.compatible_with.slice(0, 3).map((attr: any) => (
                <span key={attr.id} className="badge badge-sm badge-secondary badge-outline">
                  {attr.display_name}
                </span>
              ))}
              {listing.compatible_with.length > 3 && (
                <span className="badge badge-sm badge-outline">
                  +{listing.compatible_with.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div className="mb-3">
            <p className="text-sm text-base-content/70 line-clamp-2">
              {listing.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm flex-1"
            onClick={() => onEdit(listing)}
          >
            Edit
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={() => onDelete(listing.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface GroupFormData {
  name: string;
  description: string;
}

interface AttributeFormData {
  name: string;
  group_id: number | null;
}

interface ValueFormData {
  value: string;
  display_name: string;
  attribute_id: number | null;
}

function StaffListings() {
  const { listings, loading, error, refresh, deleteListing, createListing, updateListing } = useProductListings();
  const { categories = [] } = useCategories();
  const { brands = [] } = useBrands();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ProductListing | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Category Management State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<number | null>(null);
  const [newCategoryIsComponent, setNewCategoryIsComponent] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  // Compatibility Management State
  const [showCompatibilitySection, setShowCompatibilitySection] = useState(false);
  const [groups, setGroups] = useState<CompatibilityGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  
  // Compatibility modals
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  
  const [editingGroup, setEditingGroup] = useState<CompatibilityGroup | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<CompatibilityAttribute | null>(null);
  const [editingValue, setEditingValue] = useState<CompatibilityAttributeValue | null>(null);
  
  const [groupFormData, setGroupFormData] = useState<GroupFormData>({ name: '', description: '' });
  const [attributeFormData, setAttributeFormData] = useState<AttributeFormData>({ name: '', group_id: null });
  const [valueFormData, setValueFormData] = useState<ValueFormData>({ value: '', display_name: '', attribute_id: null });

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = (listings || []).filter((listing) => {
      // Search filter
      const matchesSearch = (listing.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (listing.brand?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (listing.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || (listing.category?.name || '') === selectedCategory;

      // Brand filter
      const matchesBrand = selectedBrand === 'all' || (listing.brand?.name || '') === selectedBrand;

      // Availability filter
      const matchesAvailability = availabilityFilter === 'all' ||
                                 (availabilityFilter === 'available' && listing.available) ||
                                 (availabilityFilter === 'unavailable' && !listing.available);

      return matchesSearch && matchesCategory && matchesBrand && matchesAvailability;
    });

    // Sort listings
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'category':
          aValue = a.category?.name?.toLowerCase() || '';
          bValue = b.category?.name?.toLowerCase() || '';
          break;
        case 'brand':
          aValue = a.brand?.name?.toLowerCase() || '';
          bValue = b.brand?.name?.toLowerCase() || '';
          break;
        case 'stock':
          aValue = (a.products || []).reduce((sum, p) => sum + (p.stock || 0), 0);
          bValue = (b.products || []).reduce((sum, p) => sum + (p.stock || 0), 0);
          break;
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [listings, searchQuery, selectedCategory, selectedBrand, availabilityFilter, sortBy, sortOrder]);

  const handleDelete = async (listingId: number) => {
    if (window.confirm('Are you sure you want to delete this product listing? This action cannot be undone.')) {
      const success = await deleteListing(listingId);
      if (success) {
        // Could add a toast notification here
        console.log('Product listing deleted successfully');
      }
    }
  };

  const handleEdit = (listing: ProductListing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingListing(null);
  };

  const handleSubmitListing = async (listingData: Partial<ProductListing>) => {
    if (editingListing) {
      // Update existing listing
      return await updateListing(editingListing.id, listingData);
    } else {
      // Create new listing
      return await createListing(listingData);
    }
  };

  // Category Management Functions
  const handleOpenCategoryModal = () => {
    setNewCategoryName('');
    setNewCategoryParent(null);
    setNewCategoryIsComponent(false);
    setShowCategoryModal(true);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    setSavingCategory(true);
    try {
      const response = await api.post('/api/categories/create/', {
        name: newCategoryName,
        parent: newCategoryParent,
        is_component: newCategoryIsComponent,
      });

      if (response.status === 201 || response.status === 200) {
        alert('Category created successfully!');
        setShowCategoryModal(false);
        // Refresh page to reload categories
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Failed to create category:', error);
      alert(error.response?.data?.error || 'Failed to create category');
    } finally {
      setSavingCategory(false);
    }
  };

  // Compatibility Management Functions
  useEffect(() => {
    if (showCompatibilitySection) {
      fetchGroups();
    }
  }, [showCompatibilitySection]);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await api.get('/api/compatibility/groups/');
      console.log('Compatibility groups response:', response.data);
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch compatibility groups:', error);
      alert('Failed to load compatibility groups. Please check console for details.');
    } finally {
      setLoadingGroups(false);
    }
  };

  const toggleGroup = (groupId: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Group CRUD
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupFormData({ name: '', description: '' });
    setShowGroupModal(true);
  };

  const handleEditGroup = (group: CompatibilityGroup) => {
    setEditingGroup(group);
    setGroupFormData({ name: group.name, description: group.description || '' });
    setShowGroupModal(true);
  };

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await api.put(`/api/compatibility/groups/${editingGroup.id}/update/`, groupFormData);
      } else {
        await api.post('/api/compatibility/groups/create/', groupFormData);
      }
      setShowGroupModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Failed to save group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? This will also delete all its attributes and values.')) {
      return;
    }
    try {
      await api.delete(`/api/compatibility/groups/${groupId}/delete/`);
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  // Attribute CRUD
  const handleCreateAttribute = (groupId: number) => {
    setEditingAttribute(null);
    setAttributeFormData({ name: '', group_id: groupId });
    setShowAttributeModal(true);
  };

  const handleEditAttribute = (attribute: CompatibilityAttribute) => {
    setEditingAttribute(attribute);
    setAttributeFormData({ name: attribute.name, group_id: attribute.group.id });
    setShowAttributeModal(true);
  };

  const handleSubmitAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAttribute) {
        await api.put(`/api/compatibility/attributes/${editingAttribute.id}/update/`, attributeFormData);
      } else {
        await api.post('/api/compatibility/attributes/create/', attributeFormData);
      }
      setShowAttributeModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Failed to save attribute:', error);
    }
  };

  const handleDeleteAttribute = async (attributeId: number) => {
    if (!confirm('Are you sure you want to delete this attribute? This will also delete all its values.')) {
      return;
    }
    try {
      await api.delete(`/api/compatibility/attributes/${attributeId}/delete/`);
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete attribute:', error);
    }
  };

  // Value CRUD
  const handleCreateValue = (attributeId: number) => {
    setEditingValue(null);
    setValueFormData({ value: '', display_name: '', attribute_id: attributeId });
    setShowValueModal(true);
  };

  const handleEditValue = (value: CompatibilityAttributeValue) => {
    setEditingValue(value);
    setValueFormData({ 
      value: value.value, 
      display_name: value.display_name, 
      attribute_id: value.attribute.id 
    });
    setShowValueModal(true);
  };

  const handleSubmitValue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingValue) {
        await api.put(`/api/compatibility/values/${editingValue.id}/update/`, valueFormData);
      } else {
        await api.post('/api/compatibility/values/create/', valueFormData);
      }
      setShowValueModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Failed to save value:', error);
    }
  };

  const handleDeleteValue = async (valueId: number) => {
    if (!confirm('Are you sure you want to delete this value?')) {
      return;
    }
    try {
      await api.delete(`/api/compatibility/values/${valueId}/delete/`);
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete value:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading product listings: {error}</span>
        <button className="btn btn-sm" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Listings</h1>
          <p className="text-base-content/70">
            Manage your product listings and inventory
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className={`btn ${showCompatibilitySection ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setShowCompatibilitySection(!showCompatibilitySection)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Compatibility
          </button>
          <button
            className="btn btn-accent"
            onClick={handleOpenCategoryModal}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Add Category
          </button>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Listing
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <input
                type="text"
                placeholder="Search products..."
                className="input input-bordered input-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories && categories.map((category: any, index: number) => (
                  <option key={category?.id || `category-${index}`} value={category?.name || ''}>
                    {category?.name || 'Unknown Category'}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Brand</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="all">All Brands</option>
                {brands && brands.map((brand: any, index: number) => (
                  <option key={brand?.id || `brand-${index}`} value={brand?.name || ''}>
                    {brand?.name || 'Unknown Brand'}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Availability</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Sort by</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="category">Category</option>
                <option value="brand">Brand</option>
                <option value="stock">Stock</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Order</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Compatibility Management Section */}
      {showCompatibilitySection && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Compatibility Management</h2>
              <button className="btn btn-primary btn-sm" onClick={handleCreateGroup}>
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </button>
            </div>

            {loadingGroups ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-2">No compatibility groups</h3>
                <p className="text-base-content/70 mb-4">
                  Create your first compatibility group to get started
                </p>
                <button className="btn btn-primary" onClick={handleCreateGroup}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Group
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                      {/* Group Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="btn btn-ghost btn-sm btn-square"
                          >
                            {expandedGroups.has(group.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{group.name}</h3>
                            {group.description && (
                              <p className="text-sm text-base-content/70">{group.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreateAttribute(group.id)}
                            className="btn btn-sm btn-primary btn-outline"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Attribute
                          </button>
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="btn btn-sm btn-ghost"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="btn btn-sm btn-error btn-ghost"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Attributes */}
                      {expandedGroups.has(group.id) && (
                        <div className="mt-4 pl-12 space-y-3">
                          {!group.attributes || group.attributes.length === 0 ? (
                            <p className="text-sm text-base-content/50">No attributes yet</p>
                          ) : (
                            group.attributes.map((attribute) => (
                              <div key={attribute.id} className="card bg-base-100">
                                <div className="card-body p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{attribute.name}</h4>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleCreateValue(attribute.id)}
                                        className="btn btn-xs btn-primary btn-outline"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Value
                                      </button>
                                      <button
                                        onClick={() => handleEditAttribute(attribute)}
                                        className="btn btn-xs btn-ghost"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAttribute(attribute.id)}
                                        className="btn btn-xs btn-error btn-ghost"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Values */}
                                  <div className="flex flex-wrap gap-2">
                                    {!attribute.values || attribute.values.length === 0 ? (
                                      <span className="text-xs text-base-content/50">No values yet</span>
                                    ) : (
                                      attribute.values.map((value) => (
                                        <div
                                          key={value.id}
                                          className="badge badge-lg badge-outline gap-2"
                                        >
                                          <span>{value.display_name}</span>
                                          <button
                                            onClick={() => handleEditValue(value)}
                                            className="btn btn-ghost btn-xs p-0 h-auto min-h-0"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteValue(value.id)}
                                            className="btn btn-ghost btn-xs p-0 h-auto min-h-0 text-error"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-base-content/70">
          Showing {filteredAndSortedListings.length} of {listings?.length || 0} listings
        </div>
        <button className="btn btn-sm btn-outline" onClick={refresh}>
          Refresh
        </button>
      </div>

      {/* Product Listings Grid */}
      {filteredAndSortedListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No listings found</h3>
          <p className="text-base-content/70 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all' || availabilityFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first product listing.'}
          </p>
          <button className="btn btn-primary" onClick={handleAddNew}>
            Add New Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedListings.map((listing) => (
            <ProductListingCard
              key={listing.id}
              listing={listing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Listing Form Modal */}
      <ListingFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitListing}
        editingListing={editingListing}
        categories={categories}
        brands={brands}
      />

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              <FolderPlus className="inline mr-2 h-5 w-5" />
              Create New Category
            </h3>
            
            <div className="space-y-4">
              {/* Category Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bikes, Components, Frames"
                  className="input input-bordered"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>

              {/* Parent Category (Optional) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Parent Category (Optional)</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newCategoryParent || ''}
                  onChange={(e) => setNewCategoryParent(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">None (Top-level category)</option>
                  {(categories as Category[])
                    .filter(cat => !cat.parent) // Only show top-level categories as parent options
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Leave blank for main categories (Bikes, Components, Miscellaneous)
                  </span>
                </label>
              </div>

              {/* Is Component */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={newCategoryIsComponent}
                    onChange={(e) => setNewCategoryIsComponent(e.target.checked)}
                  />
                  <div>
                    <span className="label-text font-medium">Is Component Category</span>
                    <p className="text-xs text-base-content/60">
                      Check if this category is for bike components (frames, wheels, etc.)
                    </p>
                  </div>
                </label>
              </div>

              {/* Info Alert */}
              <div className="alert alert-info">
                <Folder className="h-4 w-4" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Category Structure:</p>
                  <p>• Main: Bikes, Components, Miscellaneous</p>
                  <p>• Subcategories: Frames, Wheels, etc. (under Components)</p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowCategoryModal(false)}
                disabled={savingCategory}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateCategory}
                disabled={savingCategory || !newCategoryName.trim()}
              >
                {savingCategory ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-4 w-4" />
                    Create Category
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !savingCategory && setShowCategoryModal(false)}></div>
        </dialog>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingGroup ? 'Edit Group' : 'Create Group'}
            </h3>
            <form onSubmit={handleSubmitGroup} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Group Name *</span>
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  className="textarea textarea-bordered"
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowGroupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGroup ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowGroupModal(false)}></div>
        </div>
      )}

      {/* Attribute Modal */}
      {showAttributeModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingAttribute ? 'Edit Attribute' : 'Create Attribute'}
            </h3>
            <form onSubmit={handleSubmitAttribute} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Attribute Name *</span>
                </label>
                <input
                  type="text"
                  value={attributeFormData.name}
                  onChange={(e) => setAttributeFormData({ ...attributeFormData, name: e.target.value })}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowAttributeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAttribute ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowAttributeModal(false)}></div>
        </div>
      )}

      {/* Value Modal */}
      {showValueModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingValue ? 'Edit Value' : 'Create Value'}
            </h3>
            <form onSubmit={handleSubmitValue} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Value *</span>
                </label>
                <input
                  type="text"
                  value={valueFormData.value}
                  onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
                  className="input input-bordered"
                  placeholder="e.g., 700c"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Display Name *</span>
                </label>
                <input
                  type="text"
                  value={valueFormData.display_name}
                  onChange={(e) => setValueFormData({ ...valueFormData, display_name: e.target.value })}
                  className="input input-bordered"
                  placeholder="e.g., 700c (Road)"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowValueModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingValue ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowValueModal(false)}></div>
        </div>
      )}
    </div>
  );
}

export default StaffListings;
