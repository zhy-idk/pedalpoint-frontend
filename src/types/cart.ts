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
  price: string;
  stock: number;
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

export interface CartContextType {
  state: CartState;
  actions: {
    fetchCart: () => Promise<void>;
    addItem: (productId: number, quantity?: number) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
  };
}