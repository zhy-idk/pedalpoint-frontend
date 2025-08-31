import { useState } from "react";

import AddIcon from "../assets/add_24dp.svg?react";
import MinusIcon from "../assets/remove_24dp.svg?react";

import { useTheme } from "../hooks/useTheme";

interface QuantityInputProps {
  maxStock?: number;
}

function QuantityInput({ maxStock }: QuantityInputProps) {
  const [quantity, setQuantity] = useState(1);
  const { theme } = useTheme();

  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    const maxAllowed = maxStock || 9;
    setQuantity(prev => Math.min(maxAllowed, prev + 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const maxAllowed = maxStock || 9;
    if (value >= 1 && value <= maxAllowed) {
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
        disabled={quantity <= 1}
      >
        <MinusIcon fill={handleColor}/>
      </button>
      
      <input 
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className="input join-item input-xs w-10 rounded-none text-center text-xs md:text-lg md:input-sm" 
        max={maxStock}
        min={1}
      />
      
      <button 
        type="button"
        onClick={handleIncrement}
        className="btn join-item btn-xs btn-square rounded-r-md rounded-none md:btn-sm"
        disabled={maxStock ? quantity >= maxStock : quantity >= 9}
      >
        <AddIcon fill={handleColor}/>
      </button>
    </div>
  );
}
export default QuantityInput