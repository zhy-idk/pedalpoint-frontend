import { Link } from "react-router-dom";
import CartCard from "../components/CartCard";
import TotalCard from "../components/TotalCard";

function Cart () {
  return (
    <div className="flex flex-col items-center bg-base-100 p-3 mx-3 xs:mx-[clamp(0.75rem,6vw,7.5rem)] xl:mx-30 rounded-sm md:items-start md:flex-row ">
      <div className="flex flex-col gap-4 md:basis-3/5">
        <CartCard/>
        <CartCard/>
        <CartCard/>
        <CartCard/>
        <CartCard/>
      </div>
      <div className="flex w-full mt-5 md:ml-5 md:basis-2/5">
        <TotalCard/>
      </div>
      
    </div>
  );
}
export default Cart;