// src/components/layout/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const linkClass =
    "px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200";
  const activeLinkClass =
    "px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/20 shadow-sm transition-all duration-200";

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo + Desktop Navigation Links */}
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

        {/* Right: Auth Links + Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          {/* Desktop Auth Links */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-300 text-sm">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
          <div className="flex flex-col space-y-2">
            <NavLink
              to="/products"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/categories"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/subcategories"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              SubCategories
            </NavLink>
            <NavLink
              to="/cart"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Cart
            </NavLink>
            <NavLink
              to="/orders"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                isActive ? activeLinkClass : linkClass
              }
            >
              Orders
            </NavLink>
            {user && (
              <NavLink
                to="/profile"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? activeLinkClass : linkClass
                }
              >
                Profile
              </NavLink>
            )}

            {/* Mobile Auth Links */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              {user ? (
                <>
                  <div className="text-gray-300 text-sm px-4 py-2">
                    Hello, <span className="text-white font-semibold">{user.firstName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block text-gray-300 hover:text-white transition-colors px-4 py-2"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-200 text-center"
                  >
                    Signup
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
