import React, { useEffect } from "react";
import useCartStore from "../stores/cartStore";
import useOrderStore from "../stores/orderStore";
import CartItem from "../components/cart/CartItem";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, fetchCart, loading, error, removeFromCart, clearCart } =
    useCartStore();
  const { createOrder } = useOrderStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Buy a single item
  const handleBuyNow = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return navigate("/login");

    try {
      const payload = {
        user_id: user.id,
        items: [{ product_id: item.product_id, quantity: item.quantity }],
      };

      const order = await createOrder(payload);

      if (!order || !order.id) {
        toast.error("Failed to place order");
        return;
      }

      await removeFromCart(item.id); // Clear specific item
      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    }
  };

  // Buy all items in cart
  const handleBuyAll = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      toast.error("Please login to continue");
      return navigate("/login");
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const itemsPayload = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    try {
      const payload = {
        user_id: user.id,
        items: itemsPayload,
      };

      const order = await createOrder(payload);

      if (!order || !order.id) {
        toast.error("Failed to place order");
        return;
      }

      // Clear the cart (server-side deletes) and update UI - MUST complete before navigation
      await clearCart();

      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error("Order creation error:", err);
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your
          cart
        </p>
      </div>

      {cartItems.length === 0 ? (
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Your cart is empty
          </h3>
          <p className="mt-2 text-gray-500">
            Start shopping to add items to your cart
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <CartItem item={item} />
                <div className="px-6 pb-4">
                  <button
                    onClick={() => handleBuyNow(item)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Buy This Item
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBuyAll}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Checkout All Items
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure checkout powered by our platform
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
