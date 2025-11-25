// src/components/layout/Navbar.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass =
    "px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200";
  const activeLinkClass =
    "px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/20 shadow-sm transition-all duration-200";

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo + Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-90 transition-opacity"
          >
            Martronics
          </Link>
          <div className="hidden md:flex space-x-2">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/subcategories"
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              SubCategories
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Cart
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Orders
            </NavLink>
            {/* Profile link only if user is logged in */}
            {user && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? activeLinkClass : linkClass
                }
              >
                Profile
              </NavLink>
            )}
          </div>
        </div>

        {/* Right: Auth Links */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-300 text-sm hidden sm:block">
                Hello, <span className="text-white font-semibold">{user.firstName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white transition-colors"
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-200"
              >
                Signup
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
