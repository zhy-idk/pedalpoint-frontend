import { useState } from "react";

import AddLogo from "../assets/add_24dp.svg";
import MinusLogo from "../assets/remove_24dp.svg";

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
    <div className="relative flex items-center w-min">
      <button 
        type="button"
        onClick={handleDecrement}
        className="btn btn-neutral btn-xs btn-square rounded-l-md rounded-none md:btn-sm"
      >
        <img src={MinusLogo} alt="Decrement" className="h-4"/>
      </button>
      
      <input 
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className="input input-xs w-10 rounded-none text-center text-xs md:text-lg md:input-sm" 
      />
      
      <button 
        type="button"
        onClick={handleIncrement}
        className="btn btn-neutral btn-xs btn-square rounded-r-md rounded-none md:btn-sm"
      >
        <img src={AddLogo} alt="Increment" className="h-4"/>
      </button>
    </div>
  );
}
export default QuantityInput