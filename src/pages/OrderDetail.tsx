import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useOrderDetail } from '../hooks/useOrderDetail';
import BackIcon from '../assets/undo_24dp.svg?react';
import PlaceholderImg from '../assets/placeholder_img.jpg';
import api, { apiBaseUrl } from '../api';

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, loading, error, refetch } = useOrderDetail(id);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleOpenCancelModal = () => {
    setShowCancelModal(true);
    setCancelReason('');
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!order || !cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    setCancelling(true);
    
    try {
      const response = await api.post(`/api/orders/${order.id}/cancel/`, {
        reason: cancelReason
      });
      
      if (response.status === 200) {
        alert('Order cancelled successfully');
        setShowCancelModal(false);
        
        // Refresh order data or navigate
        if (refetch) {
          refetch();
        } else {
          navigate('/orders/');
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to cancel order';
      alert(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30">
        <div className="text-center py-8">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Loading Order Details...</h1>
          <p className="text-base-content/70">Please wait while we fetch your order information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30">
        <div className="text-center py-8">
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
          <Link to="/orders/" className="btn btn-primary">
            <BackIcon className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-base-content/70 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/orders/" className="btn btn-primary">
            <BackIcon className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/orders/" className="btn btn-ghost btn-sm">
            <BackIcon className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-base-content/70">Ordered on {formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className={`badge ${getStatusColor(order.status)} badge-lg`}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-header">
              <h2 className="card-title">Order Items ({order.items.length})</h2>
            </div>
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                         <td>
                          <Link 
                            to={`/${item.product.product_listing.category?.slug || 'uncategorized'}/${item.product.product_listing.slug || ''}`}
                            className="flex items-center space-x-3 hover:bg-base-200 rounded-lg p-2 -m-2 transition-colors"
                          >
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-lg bg-base-200">
                                <img
                                  src={getImageSrc(item.id, item.product.product_listing.image)}
                                  className="w-full h-full object-contain"
                                  alt={item.product.product_listing.name}
                                  onError={() => handleImageError(item.id)}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium hover:text-primary transition-colors">
                                {item.product.product_listing.name}
                              </div>
                              {item.product.variant_attribute && (
                                <div className="text-sm text-base-content/70">
                                  {item.product.variant_attribute}
                                </div>
                              )}
                            </div>
                          </Link>
                         </td>
                        <td>₱{parseFloat(item.product.price).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td className="font-medium">
                          ₱{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Order Information */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-header">
              <h2 className="card-title">Order Information</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-sm font-medium text-base-content/70">Order ID</label>
                <p className="font-mono">#{order.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Order Date</label>
                <p>{formatDate(order.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Status</label>
                <div className={`badge ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Payment Method</label>
                <p className="capitalize">
                  {order.payment_method
                    ?.replace(/_/g, ' ')
                    .replace('dob', 'Digital Online Banking')
                    .replace('qr ph', 'QR Ph')
                    .replace('grab pay', 'GrabPay')
                    .replace('cash on delivery', 'Cash on Delivery') || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Payment Status</label>
                <div className={`badge ${
                  order.payment_status === 'paid' ? 'badge-success' : 
                  order.payment_status === 'failed' ? 'badge-error' : 
                  order.payment_status === 'pending' ? 'badge-warning' : 
                  'badge-ghost'
                }`}>
                  {order.payment_status === 'paid' ? 'Paid' : 
                   order.payment_status === 'failed' ? 'Failed' : 
                   order.payment_status === 'pending' ? 'Pending' : 
                   order.payment_status}
                </div>
              </div>
              {order.tracking_code && (
                <div>
                  <label className="text-sm font-medium text-base-content/70">Tracking Code</label>
                  <p className="font-mono text-sm">{order.tracking_code}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <label className="text-sm font-medium text-base-content/70">Notes</label>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-header">
              <h2 className="card-title">Shipping Information</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-sm font-medium text-base-content/70">Shipping Address</label>
                <p className="text-sm">{order.shipping_address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Contact Number</label>
                <p className="text-sm">{order.contact_number}</p>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-header">
              <h2 className="card-title">Order Total</h2>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₱{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₱0.00</span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₱{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {order.status === 'completed' && (
              <Link
                to={`/${order.items[0]?.product.product_listing.category?.slug || 'uncategorized'}/${order.items[0]?.product.product_listing.slug || ''}#reviews`}
                className="btn btn-primary w-full"
              >
                Write a Review
              </Link>
            )}
            {order.status === 'to_pay' && (
              order.payment_method === 'cash_on_delivery' ? (
                <button className="btn btn-disabled w-full" disabled>
                  Waiting Approval
                </button>
              ) : (
                <button className="btn btn-primary w-full">
                  Pay Now
                </button>
              )
            )}
            {order.status === 'to_deliver' && (
              <button className="btn btn-success w-full">
                Mark as Received
              </button>
            )}
            {(order.status === 'to_pay' || order.status === 'to_ship') && (
              <button 
                className="btn btn-outline btn-error w-full"
                onClick={handleOpenCancelModal}
                disabled={cancelling}
              >
                Cancel Order
              </button>
            )}
            <Link to="/orders/" className="btn btn-outline w-full">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Cancel Order</h3>
            
            {order.payment_status === 'paid' && (
              <div className="alert alert-warning mb-4">
                <span className="text-sm">
                  This order has been paid. A refund will be processed after cancellation.
                </span>
              </div>
            )}
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Reason for Cancellation *</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder="Please tell us why you're cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  This helps us improve our service
                </span>
              </label>
            </div>

            <div className="modal-action">
              <button 
                type="button"
                className="btn"
                onClick={handleCloseCancelModal}
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button 
                type="button"
                className="btn btn-error"
                onClick={handleConfirmCancel}
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCloseCancelModal}></div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
