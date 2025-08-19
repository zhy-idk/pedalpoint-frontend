import { useEffect, useState } from "react";
import CartCard from "../components/CartCard";
import TotalCard from "../components/TotalCard";
import { useNavigate } from "react-router-dom";
import type { Cart } from "../types/cart";
import api from "../api";

function Cart() {
  const [cart, setCart] = useState<Cart>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/cart/`);
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/login");
      }
    };

    fetchProduct();
  }, [navigate]);
  return (
    <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:flex-row lg:items-start xl:mx-30">
      <div className="flex flex-col gap-4 md:basis-3/5">
        <CartCard />
        <CartCard />
        <CartCard />
        <CartCard />
        <CartCard />
      </div>
      <div className="mt-5 flex w-full md:ml-5 md:basis-2/5 lg:mt-0">
        <TotalCard />
      </div>
    </div>
  );
}
export default Cart;
