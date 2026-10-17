// src/components/layout/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 min-h-screen p-4">
      <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
      <ul className="space-y-2">
        <li>
          <Link to="/products" className="block p-2 rounded hover:bg-gray-200">
            Products
          </Link>
        </li>
        <li>
          <Link
            to="/categories"
            className="block p-2 rounded hover:bg-gray-200"
          >
            Categories
          </Link>
        </li>
        <li>
          <Link to="/orders" className="block p-2 rounded hover:bg-gray-200">
            Orders
          </Link>
        </li>
        <li>
          <Link to="/users" className="block p-2 rounded hover:bg-gray-200">
            Users
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
