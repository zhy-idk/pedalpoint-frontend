/**
 * PayMongo integration service for frontend
 */

interface PaymentIntentResponse {
  payment_intent: {
    id: string;
    attributes: {
      client_key: string;
      status: string;
      amount: number;
      currency: string;
    };
  };
  client_key: string;
  public_key: string;
}

interface CheckoutSessionResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      checkout_url: string;
      client_key: string;
      status: string;
      line_items: Array<{
        amount: number;
        currency: string;
        name: string;
        quantity: number;
      }>;
      payment_method_types: string[];
    };
  };
}

interface PaymentConfirmationResponse {
  order: any;
  payment_status: string;
}

class PayMongoService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiBaseUrl}/api${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making request to: ${url}`);
    const response = await fetch(url, config);
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      
      // Try to parse as JSON, but don't fail if it's HTML
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      } catch (parseError) {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText.substring(0, 200)}...`);
      }
    }

    const responseText = await response.text();
    console.log(`Response body:`, responseText.substring(0, 500));
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response was:', responseText);
      throw new Error('Invalid JSON response from server');
    }
  }

  private getAuthHeaders() {
    // Get CSRF token from cookies
    const csrfToken = this.getCSRFToken();
    const headers: Record<string, string> = {};
    
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
  }

  private getCSRFToken(): string | null {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    
    return null;
  }



  /**
   * Create a PayMongo checkout session for hosted payment (supports multiple payment methods)
   * This calls the backend API which uses the secret key (more secure)
   */
  async createPayMongoCheckoutSession(orderData: {
    orderId: number;
    billing: {
      name: string;
      email: string;
      phone?: string;
    };
    lineItems: Array<{
      name: string;
      amount: number;
      quantity: number;
      currency?: string;
    }>;
    successUrl?: string;
    cancelUrl?: string;
    sendEmailReceipt?: boolean;
  }): Promise<CheckoutSessionResponse> {
    const currentUrl = window.location.origin;
    
    // Call backend endpoint which handles PayMongo API with secret key
    return this.makeRequest('/payments/create-checkout/', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderData.orderId,
        frontend_url: currentUrl,
      }),
    });
  }

  /**
   * Create a checkout session for hosted payment (supports multiple payment methods)
   */
  async createCheckoutSession(orderId: number, frontendUrl?: string): Promise<CheckoutSessionResponse> {
    const currentUrl = frontendUrl || window.location.origin;
    
    return this.makeRequest('/payments/create-checkout/', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        frontend_url: currentUrl,
      }),
    });
  }

  /**
   * Get payment status for an order (read-only)
   * Webhook handles actual payment processing
   */
  async confirmPayment(orderId: number): Promise<PaymentConfirmationResponse> {
    return this.makeRequest(`/payments/confirm/${orderId}/`, {
      method: 'GET',
    });
  }

}

export const paymongoService = new PayMongoService();
export default paymongoService;

