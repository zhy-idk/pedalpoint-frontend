import { Link } from "react-router-dom";
import Menu from "./Menu";
import Searchbar from "./Searchbar";

function NavBar() {
    return (
      <div className="navbar grid place-items-center grid-rows-2 h-30 shadow-md">
      <div className="flex flex-wrap justify-center items-center w-full">
        {/* Hamburger Menu Button for mobile*/}
        <div className="lg:hidden">
          <input id="my-drawer1" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Page content here */}
            <label htmlFor="my-drawer1" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  className="inline-block h-5 w-5 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </label>
          </div>

          <div className="drawer-side">
            <label htmlFor="my-drawer1" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
              <div className="menu-vertical">
                <Menu />
              </div>
            </ul>
          </div>
        </div>

        {/* Logo and Title */}
        <div className="flex items-center justify-center flex-1 lg:flex-none">
          <Link to="/" className="btn btn-ghost text-xl rounded-sm lg:flex-none">PedalPoint</Link>
        </div>

        {/* Searchbar - Hidden on mobile, shown on desktop */}
        <div className="w-full max-w-2xl hidden lg:flex">
          <Searchbar />
        </div>
        

        {/* Cart Button */}
        <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
          <div className="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" 
            stroke="currentColor"> 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> 
            </svg>
            <span className="badge badge-sm indicator-item">8</span>
          </div>
        </div>
        <div
          tabIndex={0}
          className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow">
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
        <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
            <Link to="profile/" className="justify-between">
              Profile
              <span className="badge">New</span>
            </Link>
            </li>
            <li><Link to="purchases/">Purchases</Link></li>
            <li><a>Logout</a></li>
          </ul>
        </div>

      </div>

      {/* Mobile Search Bar - Second Row */}
      <div className="w-full px-6 lg:hidden">
        <Searchbar />
      </div>

      {/* Menu Section*/}
      <ul className="menu menu-horizontal px-1 hidden lg:flex">
        <Menu />
      </ul>

      </div>
    );
}

export default NavBar