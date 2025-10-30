import { useState, useEffect, useMemo } from 'react';
import { Info, X, Package } from 'lucide-react';
import type { ProductListing } from '../../hooks/useProductListings';
import { useCompatibilityTags } from '../../hooks/useCompatibilityTags';
import type { BikeCompatibilityTag } from '../../types/product';
import api from '../../api';

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listingData: Partial<ProductListing>) => Promise<boolean>;
  editingListing?: ProductListing | null;
  categories: Array<{ id: number; name: string }>;
  brands: Array<{ id: number; name: string }>;
}

const BUILDER_CATEGORIES = [
  { value: '', label: 'None (Not in builder)' },
  { value: 'frame', label: 'Frame' },
  { value: 'wheels', label: 'Wheels' },
  { value: 'drivetrain', label: 'Drivetrain' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'handlebars', label: 'Handlebars' },
  { value: 'saddle', label: 'Saddle' },
];

interface Product {
  id: number;
  name: string;
  variant_attribute: string | null;
  brand: { id: number; name: string } | null;
  stock: number;
  price: string;
  available: boolean;
}

function ListingFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingListing,
  categories = [],
}: ListingFormModalProps) {
  const { tags: compatibilityTags, loading: compatibilityLoading } = useCompatibilityTags();

  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'products' | 'bike-builder'>('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    available: true,
    bike_builder_enabled: false,
    builder_category: '',
    builder_priority: 0,
  });
  
  // Selected compatibility tag IDs
  const [selectedCompatibilityTags, setSelectedCompatibilityTags] = useState<number[]>([]);
  
  // Products management
  const [unassignedProducts, setUnassignedProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  
  // Image management
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingListing) {
        setFormData({
          name: editingListing.name || '',
          description: editingListing.description || '',
          category: editingListing.category?.id?.toString() || '',
          available: editingListing.available ?? true,
          bike_builder_enabled: editingListing.bike_builder_enabled || false,
          builder_category: editingListing.builder_category || '',
          builder_priority: editingListing.builder_priority || 0,
        });
        
        // Set compatibility tags
        setSelectedCompatibilityTags(
          editingListing.compatibility_tags?.map(tag => tag.id) || []
        );
        
        // Set assigned products
        setAssignedProducts(editingListing.products as any || []);
        setSelectedProducts([]);
        
        // Set existing images
        setThumbnailPreview(editingListing.image || null);
        setExistingImages(editingListing.images ? editingListing.images : (editingListing.image ? [{ image: editingListing.image, alt_text: '' }] : []));
        setThumbnailFile(null);
        setProductImages([]);
        setProductImagePreviews([]);
      } else {
        setFormData({
          name: '',
          description: '',
          category: '',
          available: true,
          bike_builder_enabled: false,
          builder_category: '',
          builder_priority: 0,
        });
        setSelectedCompatibilityTags([]);
        setAssignedProducts([]);
        setSelectedProducts([]);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setProductImages([]);
        setProductImagePreviews([]);
        setExistingImages([]);
      }
      setError(null);
      setActiveTab('basic');
      
      // Fetch unassigned products
      fetchUnassignedProducts();
    }
  }, [isOpen, editingListing]);
  
  const fetchUnassignedProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await api.get('/api/listings/unassigned-products/');
      setUnassignedProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch unassigned products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const handleAssignProducts = async () => {
    if (!editingListing || selectedProducts.length === 0) return;
    
    try {
      await api.post(`/api/listings/${editingListing.id}/assign-products/`, {
        product_ids: selectedProducts
      });
      
      // Move selected products from unassigned to assigned
      const productsToMove = unassignedProducts.filter(p => selectedProducts.includes(p.id));
      setAssignedProducts(prev => [...prev, ...productsToMove]);
      setUnassignedProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
    } catch (err) {
      console.error('Failed to assign products:', err);
      setError('Failed to assign products');
    }
  };
  
  const handleUnassignProduct = async (productId: number) => {
    try {
      await api.post('/api/listings/unassign-products/', {
        product_ids: [productId]
      });
      
      // Move product from assigned to unassigned
      const product = assignedProducts.find(p => p.id === productId);
      if (product) {
        setUnassignedProducts(prev => [...prev, product]);
        setAssignedProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error('Failed to unassign product:', err);
      setError('Failed to unassign product');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCompatibilityTagToggle = (tagId: number) => {
    setSelectedCompatibilityTags(prev => {
      return prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
    });
  };

  // Image handling functions
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setProductImages(prev => [...prev, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProductImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleRemoveProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageId: number) => {
    if (!editingListing) return;
    
    try {
      await api.delete(`/api/listings/images/${imageId}/delete/`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
      setError('Failed to delete image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Use FormData if there are images, otherwise use JSON
      const hasImages = thumbnailFile || productImages.length > 0;
      
      if (hasImages) {
        const formDataToSubmit = new FormData();
        
        // Add text fields
        formDataToSubmit.append('name_input', formData.name);
        formDataToSubmit.append('description', formData.description);
        if (formData.category) {
          formDataToSubmit.append('category_id', formData.category);
        }
        formDataToSubmit.append('available', formData.available.toString());
        formDataToSubmit.append('bike_builder_enabled', formData.bike_builder_enabled.toString());
        if (formData.builder_category) {
          formDataToSubmit.append('builder_category', formData.builder_category);
        }
        formDataToSubmit.append('builder_priority', formData.builder_priority.toString());
        
        // Add compatibility tags as JSON string
        formDataToSubmit.append('compatibility_tag_ids', JSON.stringify(selectedCompatibilityTags));
        
        // Add thumbnail
        if (thumbnailFile) {
          formDataToSubmit.append('image', thumbnailFile);
        }
        
        // Add product images
        productImages.forEach((image, index) => {
          formDataToSubmit.append(`product_image_${index}`, image);
        });
        
        // Call API directly with FormData
        const url = editingListing 
          ? `/api/listings/${editingListing.id}/update/`
          : '/api/listings/create/';
        
        const response = await api({
          method: editingListing ? 'PUT' : 'POST',
          url,
          data: formDataToSubmit,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 200 || response.status === 201) {
          onClose();
        } else {
          setError('Failed to save listing. Please try again.');
        }
      } else {
        // No images, use regular JSON submit
        const submitData: any = {
          name_input: formData.name,
          description: formData.description,
          category_id: formData.category ? parseInt(formData.category) : null,
          available: formData.available,
          bike_builder_enabled: formData.bike_builder_enabled,
          builder_category: formData.builder_category || null,
          builder_priority: formData.builder_priority,
          compatibility_tag_ids: selectedCompatibilityTags,
        };

        const success = await onSubmit(submitData);
        
        if (success) {
          onClose();
        } else {
          setError('Failed to save listing. Please try again.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {editingListing ? 'Edit Product Listing' : 'Add New Product Listing'}
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-sm btn-circle btn-ghost"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-4">
          <button 
            className={`tab ${activeTab === 'basic' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Basic Info
          </button>
          <button 
            className={`tab ${activeTab === 'images' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('images')}
            type="button"
          >
            📷 Images
          </button>
          <button 
            className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('products')}
            type="button"
          >
            <Package className="w-4 h-4 mr-1" />
            Products {editingListing && `(${assignedProducts.length})`}
          </button>
          <button 
            className={`tab ${activeTab === 'bike-builder' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('bike-builder')}
            type="button"
          >
            Bike Builder & Compatibility
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Product Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  required
                  placeholder="Enter product name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category *</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="select select-bordered"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered h-32"
                  placeholder="Enter product description"
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                    className="checkbox"
                  />
                  <span className="label-text">Available for purchase</span>
                </label>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Thumbnail */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-lg">Listing Thumbnail</h4>
                  <p className="text-sm text-base-content/70 mb-4">
                    Main image for the listing (shown in product cards)
                  </p>
                  
                  {thumbnailPreview ? (
                    <div className="relative w-48 h-48">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover rounded-lg border border-base-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="form-control">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="file-input file-input-bordered"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Images */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-lg">Product Gallery Images</h4>
                  <p className="text-sm text-base-content/70 mb-4">
                    Additional images for the product gallery
                  </p>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">Current Images</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        {existingImages.map((image) => (
                          <div key={image.id} className="relative">
                            <img 
                              src={image.image} 
                              alt={image.alt_text || 'Product image'} 
                              className="w-full h-32 object-cover rounded-lg border border-base-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(image.id)}
                              className="absolute top-1 right-1 btn btn-xs btn-circle btn-error"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {productImagePreviews.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">New Images to Upload</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        {productImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border border-base-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveProductImage(index)}
                              className="absolute top-1 right-1 btn btn-xs btn-circle btn-error"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload more */}
                  <div className="form-control">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProductImagesChange}
                      className="file-input file-input-bordered"
                    />
                    <label className="label">
                      <span className="label-text-alt">You can select multiple images</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {!editingListing ? (
                <div className="alert alert-info">
                  <Info className="w-5 h-5" />
                  <span>Save the listing first, then you can assign products to it.</span>
                </div>
              ) : (
                <>
                  {/* Assigned Products */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h4 className="card-title text-lg">Assigned Products ({assignedProducts.length})</h4>
                      <p className="text-sm text-base-content/70 mb-4">
                        Products currently in this listing
                      </p>
                      
                      {assignedProducts.length === 0 ? (
                        <p className="text-center text-base-content/50 py-8">No products assigned yet</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {assignedProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium truncate">
                                    {product.name || 'Unnamed Product'}
                                  </span>
                                  {product.brand?.name && (
                                    <span className="badge badge-sm badge-primary badge-outline">
                                      {product.brand.name}
                                    </span>
                                  )}
                                  {product.variant_attribute && (
                                    <span className="badge badge-sm badge-secondary badge-outline">
                                      {product.variant_attribute}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-base-content/70 flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <span className="font-semibold">Stock:</span> {product.stock}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="font-semibold">Price:</span> ₱{parseFloat(product.price).toFixed(2)}
                                  </span>
                                  <span className={`badge badge-xs ${product.available ? 'badge-success' : 'badge-error'}`}>
                                    {product.available ? 'Available' : 'Unavailable'}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUnassignProduct(product.id)}
                                className="btn btn-sm btn-error btn-outline ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Products to Assign */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="card-title text-lg">Available Products</h4>
                          <p className="text-sm text-base-content/70">
                            Select products to add to this listing
                          </p>
                        </div>
                        {selectedProducts.length > 0 && (
                          <button
                            type="button"
                            onClick={handleAssignProducts}
                            className="btn btn-primary btn-sm"
                          >
                            Assign {selectedProducts.length} Product(s)
                          </button>
                        )}
                      </div>
                      
                      {loadingProducts ? (
                        <div className="flex justify-center py-8">
                          <div className="loading loading-spinner loading-lg"></div>
                        </div>
                      ) : unassignedProducts.length === 0 ? (
                        <p className="text-center text-base-content/50 py-8">
                          No unassigned products available
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {unassignedProducts.map((product) => (
                            <label 
                              key={product.id}
                              className="flex items-center justify-between p-3 bg-base-100 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(product.id)}
                                  onChange={() => handleProductToggle(product.id)}
                                  className="checkbox checkbox-sm"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">
                                      {product.name || 'Unnamed Product'}
                                    </span>
                                    {product.brand?.name && (
                                      <span className="badge badge-sm badge-primary badge-outline">
                                        {product.brand.name}
                                      </span>
                                    )}
                                    {product.variant_attribute && (
                                      <span className="badge badge-sm badge-secondary badge-outline">
                                        {product.variant_attribute}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-base-content/70 flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <span className="font-semibold">Stock:</span> {product.stock}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="font-semibold">Price:</span> ₱{parseFloat(product.price).toFixed(2)}
                                    </span>
                                    <span className={`badge badge-xs ${product.available ? 'badge-success' : 'badge-error'}`}>
                                      {product.available ? 'Available' : 'Unavailable'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bike Builder Tab */}
          {/* Bike Builder & Compatibility Tab */}
          {activeTab === 'bike-builder' && (
            <div className="space-y-4">
              <div className="alert alert-info">
                <Info className="w-5 h-5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Bike Builder & Compatibility</p>
                  <p>Configure this product for the bike builder. Select use case, budget range, and physical compatibility.</p>
                </div>
              </div>

              {/* Enable in Bike Builder */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="bike_builder_enabled"
                    checked={formData.bike_builder_enabled}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text font-semibold">Enable in Bike Builder</span>
                </label>
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    Allow customers to select this product when building a custom bike
                  </span>
                </label>
              </div>

              {formData.bike_builder_enabled && (
                <>
                  {/* Component Type */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Component Type *</span>
                    </label>
                    <select
                      name="builder_category"
                      value={formData.builder_category}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required={formData.bike_builder_enabled}
                    >
                      {BUILDER_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <label className="label">
                      <span className="label-text-alt text-base-content/70">
                        Which component type is this? (Frame, Wheels, Drivetrain, etc.)
                      </span>
                    </label>
                  </div>

                  {/* Priority */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Display Priority</span>
                    </label>
                    <input
                      type="number"
                      name="builder_priority"
                      value={formData.builder_priority}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      min="0"
                      placeholder="0"
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/70">
                        Higher numbers appear first in the bike builder (default: 0)
                      </span>
                    </label>
                  </div>

                  <div className="divider">Compatibility Tags</div>

                  {compatibilityLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="loading loading-spinner loading-md"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Use Case */}
                      <div className="card bg-base-200">
                        <div className="card-body p-4">
                          <h5 className="font-semibold mb-2">Use Case</h5>
                          <p className="text-xs text-base-content/70 mb-3">
                            What riding style is this product suited for?
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {compatibilityTags
                              .filter(tag => tag.tag_type === 'use_case')
                              .map(tag => (
                                <label 
                                  key={tag.id}
                                  className="label cursor-pointer justify-start gap-2 py-1 px-3 border rounded-lg hover:bg-base-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCompatibilityTags.includes(tag.id)}
                                    onChange={() => handleCompatibilityTagToggle(tag.id)}
                                    className="checkbox checkbox-sm checkbox-primary"
                                  />
                                  <span className="label-text">{tag.display_name}</span>
                                </label>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Budget Tier */}
                      <div className="card bg-base-200">
                        <div className="card-body p-4">
                          <h5 className="font-semibold mb-2">Budget Tier</h5>
                          <p className="text-xs text-base-content/70 mb-3">
                            Which price range does this product fit in?
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {compatibilityTags
                              .filter(tag => tag.tag_type === 'budget')
                              .map(tag => (
                                <label 
                                  key={tag.id}
                                  className="label cursor-pointer justify-start gap-2 py-1 px-3 border rounded-lg hover:bg-base-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCompatibilityTags.includes(tag.id)}
                                    onChange={() => handleCompatibilityTagToggle(tag.id)}
                                    className="checkbox checkbox-sm checkbox-success"
                                  />
                                  <span className="label-text">{tag.display_name}</span>
                                </label>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Physical Compatibility */}
                      <div className="card bg-base-200">
                        <div className="card-body p-4">
                          <h5 className="font-semibold mb-2">Physical Compatibility</h5>
                          <p className="text-xs text-base-content/70 mb-3">
                            Select all physical specs (brake types, wheel sizes, materials, etc.)
                          </p>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {compatibilityTags
                              .filter(tag => tag.tag_type === 'physical')
                              .map(tag => (
                                <label 
                                  key={tag.id}
                                  className="label cursor-pointer justify-start gap-2 py-1 px-2 border rounded hover:bg-base-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCompatibilityTags.includes(tag.id)}
                                    onChange={() => handleCompatibilityTagToggle(tag.id)}
                                    className="checkbox checkbox-xs checkbox-secondary"
                                  />
                                  <span className="label-text text-xs">{tag.display_name}</span>
                                </label>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      {selectedCompatibilityTags.length > 0 && (
                        <div className="alert alert-success">
                          <div className="text-sm">
                            <p className="font-semibold">✓ Compatibility Tags Selected</p>
                            <p className="text-xs mt-1">
                              {selectedCompatibilityTags.length} tag(s) selected
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : editingListing ? (
                'Update Listing'
              ) : (
                'Create Listing'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default ListingFormModal;
