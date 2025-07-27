import { useState } from 'react';
import OrderCard from '../components/OrderCard';

function Purchases() {
const [activeTab, setActiveTab] = useState('All Orders');
  
  const tabs = ['All Orders', 'To Pay', 'To Ship', 'To Receive', 'Completed'];

  return (
    <div className="flex flex-col items-center bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30 ">
      {/* Tabs Area */}
      <div className="flex flex-row overflow-x-auto w-full scrollbar-hide">
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
      
      <div className="flex flex-col w-full border-b-1 mt-1 mb-3 border-gray-600"></div> 

      {/* Tab Content Area */}
      <div className='flex flex-col w-full gap-4'>
        <OrderCard />
        <OrderCard />
        <OrderCard />
        <OrderCard />
        <OrderCard />
      </div>
      

      
    </div>
    
  );
}
export default Purchases;