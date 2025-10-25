import React, { useReducer, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductContext } from "../contexts/ProductContext";
import { productReducer, initialState } from "../reducers/productReducer";
import type {
  ProductProviderProps,
  ProductContextType,
  Product,
} from "../types/product";
import api from "../api/index";
import { useCart } from "./CartProvider";

export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const { categorySlug, slug } = useParams<{ categorySlug: string; slug: string }>();
  const navigate = useNavigate();
  const { actions: cartActions } = useCart();

  // Fetch product data
  const fetchProduct = useCallback(
    async (productSlug: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await api.get(`/api/listings/${productSlug}/`);
        dispatch({ type: "SET_PRODUCT", payload: response.data });
      } catch (error) {
        console.error("Error fetching product:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to load product" });
        navigate("/page-not-found");
      }
    },
    [navigate],
  );

  // Effect to fetch product when slug changes
  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }

    // Cleanup when component unmounts or slug changes
    return () => {
      dispatch({ type: "RESET_STATE" });
    };
  }, [slug, navigate, fetchProduct]);

  // Actions
  const actions = {
    setVariant: (variant: Product["products"][0] | null) => {
      dispatch({ type: "SET_VARIANT", payload: variant });
    },

    setQuantity: (quantity: number) => {
      dispatch({ type: "SET_QUANTITY", payload: quantity });
    },

    setStarFilter: (rating: number | null) => {
      dispatch({ type: "SET_STAR_FILTER", payload: rating });
    },

    addToCart: async () => {
      if (!state.product) return;

      try {
        // Get the selected variant or use the first available variant
        const variantToAdd = state.selectedVariant || state.product.products[0];
        
        if (!variantToAdd) {
          console.error("No variant available to add to cart");
          return;
        }

        // Add the variant's product ID to cart
        await cartActions.addItem(variantToAdd.id, state.quantity);
        
        console.log("Added to cart:", {
          productId: variantToAdd.id,
          quantity: state.quantity,
        });

        // Show success message or navigate to cart
        // You can add a toast notification here
        
      } catch (error) {
        console.error("Error adding to cart:", error);
        // Handle error (show error message, etc.)
      }
    },

    buyNow: async () => {
      if (!state.product || !state.selectedVariant) {
        alert("Please select a product variant");
        return;
      }

      try {
        // Navigate to checkout with buy now data
        navigate('/checkout/', { 
          state: { 
            buyNow: true,
            product: state.selectedVariant,
            quantity: state.quantity,
            productListing: state.product
          } 
        });
      } catch (error) {
        console.error("Error with buy now:", error);
        alert("Failed to process. Please try again.");
      }
    },

    refreshProduct: () => {
      if (slug) {
        fetchProduct(slug);
      }
    },
  };

  const contextValue: ProductContextType = {
    state,
    actions,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};
