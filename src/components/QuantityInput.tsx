import { useState } from "react";

import AddIcon from "../assets/add_24dp.svg?react";
import MinusIcon from "../assets/remove_24dp.svg?react";

import { useTheme } from "../hooks/useTheme";

function QuantityInput() {
  const [quantity, setQuantity] = useState(1);
  const { theme } = useTheme();

  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity(prev => Math.min(9, prev + 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleColor = theme === "dark" ? "currentColor" : "black";

  return (
    <div className="join relative flex items-center w-min border-base-300 border-1 rounded-md">
      <button 
        type="button"
        onClick={handleDecrement}
        className="btn join-item btn-xs btn-square rounded-l-md rounded-none md:btn-sm"
      >
        <MinusIcon fill={handleColor}/>
      </button>
      
      <input 
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className="input join-item input-xs w-10 rounded-none text-center text-xs md:text-lg md:input-sm" 
      />
      
      <button 
        type="button"
        onClick={handleIncrement}
        className="btn join-item btn-xs btn-square rounded-r-md rounded-none md:btn-sm"
      >
        <AddIcon fill={handleColor}/>
      </button>
    </div>
  );
}
export default QuantityInput