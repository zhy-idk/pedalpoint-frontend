import api from './index';

export interface CancelOrderResponse {
  message: string;
  order: any; // You might want a more specific Order interface here
}

export async function cancelOrder(orderId: number): Promise<CancelOrderResponse> {
  const response = await api.post(`/api/orders/${orderId}/cancel/`);
  return response.data;
}
