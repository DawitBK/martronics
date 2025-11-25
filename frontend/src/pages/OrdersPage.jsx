import React from "react";
import OrderList from "../components/orders/OrderList";

const OrdersPage = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      <p className="text-gray-600 mt-2">View and track your order history</p>
    </div>

    {/* Order List */}
    <OrderList />
  </div>
);

export default OrdersPage;
