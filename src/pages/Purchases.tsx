import { useState, useMemo } from 'react';
import OrderCard from '../components/OrderCard';
import { useCustomerOrders } from '../hooks/useCustomerOrders';

function Purchases() {
  const [activeTab, setActiveTab] = useState('All Orders');
  const { orders, loading, error, refetch } = useCustomerOrders();
  
  const tabs = ['All Orders', 'To Pay', 'To Ship', 'To Receive', 'Completed'];

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    switch (activeTab) {
      case 'To Pay':
        return orders.filter(order => order.status === 'to_pay');
      case 'To Ship':
        return orders.filter(order => order.status === 'to_ship');
      case 'To Receive':
        return orders.filter(order => order.status === 'to_deliver');
      case 'Completed':
        return orders.filter(order => order.status === 'completed');
      default:
        return orders;
    }
  }, [orders, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30">
        <div className="text-center py-8">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Loading Orders...</h1>
          <p className="text-base-content/70">Please wait while we fetch your orders</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Error Loading Orders</h1>
          <p className="text-error mb-4">{error}</p>
          <button onClick={refetch} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30">
      {/* Header */}
      <div className="w-full mb-4">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-base-content/70">Track and manage your orders</p>
      </div>

      {/* Tabs Area */}
      <div className="flex flex-row overflow-x-auto w-full scrollbar-hide mb-4">
        <div role="tablist" className="tabs tabs-sm tabs-border min-w-max lg:tabs-md">
          {tabs.map((tab) => (
            <a
              key={tab}
              role="tab"
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </a>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col w-full border-b-1 mb-3 border-gray-600"></div> 

      {/* Tab Content Area */}
      <div className="flex flex-col w-full gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-2">No orders found</h2>
            <p className="text-base-content/70 mb-4">
              {activeTab === 'All Orders' 
                ? "You haven't placed any orders yet."
                : `You don't have any orders in the "${activeTab}" status.`
              }
            </p>
            {activeTab === 'All Orders' && (
              <a href="/" className="btn btn-primary">
                Start Shopping
              </a>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}

export default Purchases;