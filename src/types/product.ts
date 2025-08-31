export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  slug: string;
  available: boolean;
  brand: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  };
  images: { 
    image: string;
    alt_text: string;
  }[];
  products: {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    stock: number;
    available: boolean;
    variant_attribute: string;
    product_images: {
      image: string;
      alt_text: string;
    }[];
  }[];
  reviews?: {
    review: string;
    star: number;
    date: string;
    user: {
      username: string;
    };
  }[];
  compatibility: {
    name: string;
  }[];
}

export interface ProductState {
  product: Product | null;
  loading: boolean;
  error: string | null;
  selectedVariant: Product['products'][0] | null;
  quantity: number;
  selectedStarFilter: number | null;
}

export type ProductAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PRODUCT'; payload: Product }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_VARIANT'; payload: Product['products'][0] | null }
  | { type: 'SET_QUANTITY'; payload: number }
  | { type: 'SET_STAR_FILTER'; payload: number | null }
  | { type: 'RESET_STATE' };

export interface ProductContextType {
  state: ProductState;
  actions: {
    setVariant: (variant: Product['products'][0] | null) => void;
    setQuantity: (quantity: number) => void;
    setStarFilter: (rating: number | null) => void;
    addToCart: () => void;
    buyNow: () => void;
    refreshProduct: () => void;
  };
}

export interface ProductProviderProps {
  children: React.ReactNode;
}