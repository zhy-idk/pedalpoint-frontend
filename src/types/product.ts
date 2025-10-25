// Compatibility Types
export interface CompatibilityGroup {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface CompatibilityAttribute {
  id: number;
  name: string;
  group: CompatibilityGroup;
  attribute_type: 'text' | 'number' | 'boolean' | 'choice';
  is_required: boolean;
}

export interface CompatibilityAttributeValue {
  id: number;
  value: string;
  display_name: string;
  description?: string;
  attribute: CompatibilityAttribute;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  slug: string;
  available: boolean;
  bike_builder_enabled?: boolean;
  builder_category?: 'frame' | 'fork' | 'wheels' | 'drivetrain' | 'brakes' | 'handlebars' | 'saddle' | 'pedals' | 'accessories';
  builder_priority?: number;
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
  compatibility_attributes?: CompatibilityAttributeValue[];
  compatible_with?: CompatibilityAttributeValue[];
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