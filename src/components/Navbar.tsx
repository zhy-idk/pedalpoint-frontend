import { Link } from "react-router-dom";
import Menu from "./Menu";
import Searchbar from "./Searchbar";
import ProfileDropdown from "./ProfileDropdown";
import CartIcon from "../assets/shopping_cart_24dp.svg?react";
import { useTheme } from "../hooks/useTheme";

function NavBar() {
  const { theme } = useTheme();

  return (
    <div className="navbar grid place-items-center grid-rows-2 h-30 border-b-1 border-b-base-300 rounded-md">
    <div className="flex flex-wrap justify-center items-center w-full">

      {/* Hamburger Menu Button for mobile*/}
      <div className="md:hidden">
        <input id="my-drawer1" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="my-drawer1" className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </label>
        </div>

        {/* Sidebar Menu */}
        <div className="drawer-side z-20">
          <label htmlFor="my-drawer1" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 min-w-3/5 min-h-full bg-base-200 text-base-content sm:min-w-1/3">
            <div className="menu-vertical font-medium text-">
              <Menu />
            </div>
          </ul>
        </div>
      </div>

      {/* Logo and Title */}
      <div className="flex items-center justify-center flex-1 ml-12  md:flex-none md:m-0">
        <Link to="/" className="text-xl font-medium mx-2 rounded-sm md:flex-none">PedalPoint</Link>
      </div>

      {/* Searchbar - Hidden on mobile, shown on desktop */}
      <div className="w-full max-w-lg hidden md:flex">
        <Searchbar />
      </div>

      {/* Cart Button */}
      <div className="dropdown dropdown-end mx-1">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="indicator">
          <CartIcon fill={theme === "dark" ? "currentColor" : "black"} />
          <span className="badge badge-sm indicator-item z-0 hidden">8</span>
        </div>
      </div>
      <div
        tabIndex={0}
        className="card card-compact dropdown-content bg-base-100 z-10 mt-3 w-52 shadow">
        <div className="card-body">
        <span className="text-lg font-bold">8 Items</span>
        <span className="text-info">Subtotal: $999</span>
        <div className="card-actions">
          <Link to="/cart" className="btn btn-primary btn-block">View Cart</Link>
        </div>
        </div>
      </div>
      </div>

      {/* Profile Section */}
      <ProfileDropdown />
      
    </div>

    

    {/* Mobile Search Bar - Second Row */}
    <div className="w-full px-6 md:hidden">
      <Searchbar />
    </div>

    {/* Menu Section*/}
    <ul className="menu menu-horizontal px-1 font-medium hidden md:flex md:text-md">
      <Menu />
    </ul>

    </div>
  );
}

export default NavBar
