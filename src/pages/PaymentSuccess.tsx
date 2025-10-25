import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import paymongoService from '../api/paymongo';
import { useCart } from '../providers/CartProvider';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { actions } = useCart();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const result = await paymongoService.confirmPayment(parseInt(orderId));
        setOrder(result.order);
        
        // Refresh cart to clear any reserved items
        actions.fetchCart();
      } catch (err) {
        console.error('Error confirming payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to confirm payment');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Confirming Payment...</h1>
          <p className="text-base-content/70">Please wait while we process your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="btn btn-primary btn-block"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-outline btn-block"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-success mb-2">Payment Successful!</h1>
          <p className="text-base-content/70">
            Your payment has been processed successfully
          </p>
        </div>

        {/* Order Information */}
        {order && (
          <div className="bg-base-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/70">Order ID:</span>
                <span className="font-mono">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Total Amount:</span>
                <span className="font-semibold">₱{order.total_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Payment Method:</span>
                <span className="capitalize">
                  {order.payment_method
                    ?.replace('_', ' ')
                    .replace('dob', 'Digital Online Banking')
                    .replace('qr ph', 'QR Ph')
                    .replace('grab pay', 'GrabPay')
                    .replace('shopeepay', 'ShopeePay')
                    .replace('billease', 'Billease')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Status:</span>
                <div className="badge badge-success badge-sm">
                  {order.payment_status === 'paid' ? 'Paid' : order.payment_status}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">What's Next?</h4>
          <p className="text-sm text-base-content/70">
            Your order is being prepared for shipment. You'll receive a tracking number via email once it's dispatched.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/orders/${order?.id}`}
            className="btn btn-primary btn-block"
          >
            View Order Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <div className="flex gap-3">
            <Link
              to="/orders"
              className="btn btn-outline flex-1"
            >
              My Orders
            </Link>
            <Link
              to="/"
              className="btn btn-outline flex-1"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-base-content/50">
            Having issues? {' '}
            <Link to="/contact" className="link link-primary">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
