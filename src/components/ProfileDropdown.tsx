import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import ThemeSwitch from "./ThemeSwitch";
import NoProfileIcon from "../assets/account_circle_24dp.svg?react"
import { useAuth } from "../hooks/useAuth";
import buildProfileImageUrl from "../utils/profileImage";

function ProfileDropdown(){
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout, isAuthenticated, user } = useAuth();
  
  // Debug logging - log when auth state changes
  useEffect(() => {
    console.log('ProfileDropdown - Auth state changed:', { 
      isAuthenticated, 
      userId: user?.id, 
      username: user?.username,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
      
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            {isAuthenticated ? (
              <img
                alt="User avatar"
                src={buildProfileImageUrl(user?.primaryUserInfo?.image)}
                onError={(event) => {
                  const target = event.target as HTMLImageElement;
                  target.src = buildProfileImageUrl();
                }}
              />
            ) : (
              <NoProfileIcon className="w-full h-full" fill={theme === "dark" ? "currentColor" : "black"}/>
            )}
            
          </div>
        </div>
        {isAuthenticated ? (
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[55] mt-3 w-52 p-2 shadow">
            <li><Link to="/profile" className="justify-between">Profile</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            {(user?.is_staff || user?.is_superuser) && (
              <li><Link to="/manage">Manage</Link></li>
            )}
            <li onClick={toggleTheme}><a><ThemeSwitch />Switch {theme}</a></li>
            <li>
              <a
                onClick={() => {
                  const modal = document.getElementById('my_modal_1') as HTMLDialogElement | null;
                  if (modal) {
                    modal.showModal();
                  }
                }}
              >
                Logout
              </a>
            </li>
          </ul>
        ) : (
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[55] mt-3 w-52 p-2 shadow">
            <li>
              <Link to="/login" className="justify-between">
                Login
              </Link>
            </li>
            <li><Link to="/signup">Signup</Link></li>
            <li onClick={toggleTheme}><a><ThemeSwitch />Switch {theme}</a></li>
            
          </ul>
        )}
      </div>

      <dialog id="my_modal_1" className="modal z-[70]">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Logout</h3>
          <p className="py-4">Are you sure you want to logout?</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn mx-2">Cancel</button>
              <button className="btn btn-primary" onClick={handleLogout}>Continue</button>
            </form>
          </div>
        </div>
      </dialog>
        
    </>
  )
}
export default ProfileDropdown