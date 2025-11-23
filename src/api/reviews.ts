import api from './index';

export interface CreateProductReviewPayload {
  orderId: number;
  productListingId: number;
  star: number;
  review: string;
}

export async function createProductReview({
  orderId,
  productListingId,
  star,
  review,
}: CreateProductReviewPayload) {
  const response = await api.post('/api/reviews/', {
    order_id: orderId,
    product_listing_id: productListingId,
    star,
    review,
  });

  return response.data;
}









