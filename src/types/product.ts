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
  variants: {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    stock: number;
    available: boolean;
    variant_images: {
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

