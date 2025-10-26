export interface ProductListing {
  id: number;
  name: string;
  image: string | null;
  slug: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: string | number;
  stock: number;
  variant_attribute?: string;
  product_listing: ProductListing;
}

export interface CartItem {
  product: ProductVariant;
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

export type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' };

// Bike Builder Item (for custom builds)
export interface BikeBuilderItem {
  id: string;
  component_type: string;
  category?: string;
  product_id: number;
  name: string;
  price: number;
  brand?: string;
  image?: string;
  variant?: {
    id: number;
    variant_attribute: string;
    sku: string | null;
    price: number;
    stock: number;
  };
}

export interface CartContextType {
  state: CartState;
  actions: {
    fetchCart: () => Promise<void>;
    addItem: (productId: number, quantity?: number) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    addBikeBuilder?: (items: BikeBuilderItem[]) => Promise<void>;
    removeBikeBuilder?: (buildId: string) => Promise<void>;
  };
}