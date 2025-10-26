import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Order } from '../types/order';
import PlaceholderImg from '../assets/placeholder_img.jpg';
import { apiBaseUrl } from '../api/index';

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'to_pay':
        return 'badge-warning';
      case 'to_ship':
        return 'badge-info';
      case 'to_deliver':
        return 'badge-primary';
      case 'completed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      case 'returned':
        return 'badge-secondary';
      default:
        return 'badge-neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'to_pay':
        return 'To Pay';
      case 'to_ship':
        return 'To Ship';
      case 'to_deliver':
        return 'To Deliver';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'returned':
        return 'Returned';
      default:
        return status;
    }
  };

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getImageSrc = (itemId: number, imageUrl: string) => {
    if (imageErrors[itemId]) {
      return PlaceholderImg;
    }
    return imageUrl ? `${apiBaseUrl}${imageUrl}` : PlaceholderImg;
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold">Order #{order.id}</h2>
          <div className={`badge ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 p-2 rounded hover:bg-base-200 transition-colors">
              {/* Product Image - Clickable */}
              <Link 
                to={`/${item.product.product_listing.category?.slug || 'uncategorized'}/${item.product.product_listing.slug || ''}`}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 hover:opacity-80 transition-opacity">
                  <img
                    src={getImageSrc(item.id, item.product.product_listing.image)}
                    className="bg-white w-full h-full object-contain rounded border border-base-300"
                    alt={item.product.product_listing.name || 'Product'}
                    onError={() => handleImageError(item.id)}
                  />
                </div>
              </Link>

              {/* Product Info - Text Only (Not Clickable) */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-base-content/90">
                  {item.product.product_listing.name}
                </h3>
                {item.product.variant_attribute && (
                  <p className="text-xs text-base-content/60">
                    {item.product.variant_attribute}
                  </p>
                )}
                <p className="text-xs text-base-content/60 mt-1">
                  Qty: {item.quantity} × ₱{(typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price)).toFixed(2)}
                </p>
              </div>

              {/* Item Subtotal */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium">
                  ₱{((typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price)) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Footer */}
        <div className="border-t border-base-300 pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-base-content/60">
              Ordered: {formatDate(order.created_at)}
            </span>
            <span className="text-lg font-bold">
              Total: ₱{order.total_amount.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-end">
            <Link 
              to={`/orders/${order.id}`}
              className="btn btn-sm btn-outline"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;