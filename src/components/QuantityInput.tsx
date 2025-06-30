import { useState } from "react";

function QuantityInput() {
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 1) {
      setQuantity(value);
    }
  };

  return (
    <div className="relative flex items-center max-w-[8rem]">
      <button 
        type="button"
        onClick={handleDecrement}
        className="btn rounded-l-lg rounded-none"
      >
        <svg 
          className="w-3 h-3 text-gray-900 dark:text-white " 
          aria-hidden="true" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 18 2"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M1 1h16"
          />
        </svg>
      </button>
      
      <input 
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className="input input-ghost rounded-none text-center border-gray-200 dark:border-gray-600/30 " 
        placeholder="999"
        required 
      />
      
      <button 
        type="button"
        onClick={handleIncrement}
        className="btn rounded-r-lg rounded-none"
      >
        <svg 
          className="w-3 h-3 text-gray-900 dark:text-white" 
          aria-hidden="true" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 18 18"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 1v16M1 9h16"
          />
        </svg>
      </button>
    </div>
  );
}
export default QuantityInput