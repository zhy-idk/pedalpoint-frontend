import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import paymongoService from '../api/paymongo';

function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const result = await paymongoService.confirmPayment(parseInt(orderId));
        setOrder(result.order);
        setPaymentStatus(result.payment_status || result.order?.payment_status || 'pending');
      } catch (err) {
        console.error('Error checking payment status:', err);
        // Even if API fails, we can still show the cancel page
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Checking Payment Status...</h1>
          <p className="text-base-content/70">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-12 h-12 text-warning" />
          </div>
          <h1 className="text-3xl font-bold text-warning mb-2">Payment Cancelled</h1>
          <p className="text-base-content/70">
            Your payment was cancelled and no charges were made
          </p>
        </div>

        {/* Order Information */}
        {orderId && (
          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <p className="text-base-content/70">
                Order #{orderId} is still pending payment
              </p>
              {order && (
                <>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Order Status:</span>
                    <span className="badge badge-warning badge-sm capitalize">
                      {order.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Payment Status:</span>
                    <span className="badge badge-warning badge-sm capitalize">
                      {paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Total Amount:</span>
                    <span className="font-semibold">₱{order.total_amount?.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* What Happened */}
        <div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium mb-2">What happened?</h4>
          <ul className="text-sm text-base-content/70 space-y-1">
            {paymentStatus === 'failed' ? (
              <>
                <li>• Payment transaction failed</li>
                <li>• No charges were made to your account</li>
                <li>• Your order is still active and awaiting payment</li>
                <li>• You can try again with a different payment method</li>
              </>
            ) : (
              <>
                <li>• Payment was cancelled by user</li>
                <li>• No charges were made to your account</li>
                <li>• Your order is still active and awaiting payment</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {orderId && (
            <Link
              to={`/orders/${orderId}`}
              className="btn btn-primary btn-block"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Try Payment Again
            </Link>
          )}
          
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Help */}
        <div className="mt-8">
          <div className="bg-info/10 rounded-lg p-4">
            <h4 className="font-medium text-info mb-2">Need Help?</h4>
            <p className="text-sm text-base-content/70 mb-3">
              If you're having trouble with payment, try these options:
            </p>
            <ul className="text-sm text-base-content/70 space-y-1 text-left">
              <li>• Check your internet connection</li>
              <li>• Verify your payment details</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if using a card</li>
            </ul>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-base-content/50">
            Still having issues? {' '}
            <Link to="/contact" className="link link-primary">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;

