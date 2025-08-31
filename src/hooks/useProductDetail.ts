import { useContext } from 'react';
import { ProductContext } from '../contexts/ProductContext';
import type { ProductContextType } from '../types/product';

// Custom hook to use the product detail context
export const useProductDetail = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductDetail must be used within a ProductProvider');
  }
  return context;
};

// Hook to get filtered reviews based on star filter
export const useFilteredReviews = () => {
  const { state } = useProductDetail();
  
  if (!state.product?.reviews) return [];
  
  if (state.selectedStarFilter === null) {
    return state.product.reviews;
  }
  
  return state.product.reviews.filter(
    review => review.star === state.selectedStarFilter
  );
};

// Hook to get product loading state
export const useProductLoading = () => {
  const { state } = useProductDetail();
  return state.loading;
};

// Hook to get product error state
export const useProductError = () => {
  const { state } = useProductDetail();
  return state.error;
};

// Hook to get current product
export const useCurrentProduct = () => {
  const { state } = useProductDetail();
  return state.product;
};

// Hook to get product selection state (variant, quantity)
export const useProductSelection = () => {
  const { state } = useProductDetail();
  return {
    selectedVariant: state.selectedVariant,
    quantity: state.quantity,
  };
};

// Hook to get product actions
export const useProductActions = () => {
  const { actions } = useProductDetail();
  return actions;
};

// Hook to get available variants
export const useProductVariants = () => {
  const { state } = useProductDetail();
  return state.product?.products || [];
};

// Hook to get selected variant
export const useSelectedVariant = () => {
  const { state } = useProductDetail();
  return state.selectedVariant;
};

// Hook to get current price (from selected variant or base product)
export const useCurrentPrice = () => {
  const { state } = useProductDetail();
  return state.selectedVariant?.price || state.product?.price || 0;
};

// Hook to get current stock (from selected variant or total from all variants)
export const useCurrentStock = () => {
  const { state } = useProductDetail();
  if (state.selectedVariant) {
    // If a variant is selected, show that variant's stock
    return state.selectedVariant.stock;
  }
  // If no variant selected, show total stock from all variants
  if (state.product?.products && state.product.products.length > 0) {
    return state.product.products.reduce((total, variant) => total + variant.stock, 0);
  }
  // Fallback to available status
  return state.product?.available ? 10 : 0;
};

// Hook to get product images (variant images or product images)
export const useProductImages = () => {
  const { state } = useProductDetail();
  if (state.selectedVariant?.product_images && state.selectedVariant.product_images.length > 0) {
    return state.selectedVariant.product_images;
  }
  return state.product?.images || [];
};