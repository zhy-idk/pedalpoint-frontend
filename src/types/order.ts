export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    variant_attribute: string;
    price: string | number;
    images?: Array<{
      image: string;
      alt_text?: string;
    }>;
    product_listing: {
      name: string;
      image: string;
      slug: string;
      category: {
        slug: string;
        name: string;
      };
    };
  };
  quantity: number;
  order: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  user: {
    username: string;
  };
  total_amount: number;
  total_price?: number;  // Added for compatibility
  created_at: string;
  status: 'to_pay' | 'to_ship' | 'to_deliver' | 'completed' | 'cancelled' | 'returned';
  payment_method: 'cash_on_delivery' | 'card' | 'gcash' | 'paymaya' | 'dob' | 'grab_pay' | 'qr_ph' | 'cash' | string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: string;
  contact_number: string;
  notes: string;
  tracking_code: string | null;
  cancel_reason?: string | null;
  return_reason?: string | null;
}
