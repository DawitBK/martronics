import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../../stores/orderStore.js";

const OrderList = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders, loading, error } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-2 text-gray-500">Start shopping to create your first order</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Order Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order.id}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {order.user
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : "Unknown User"}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
            <ul className="space-y-2">
              {order.orderItems?.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.product?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Quantity: {item.quantity} × ${item.price_at_purchase}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ${(item.price_at_purchase * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Total */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-700">Total Amount</span>
              <span className="text-xl font-bold text-indigo-600">
                ${order.total_amount}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderList;
