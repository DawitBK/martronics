import React, { useState } from "react";
import useCartStore from "../../stores/cartStore";
import { toast } from "react-toastify";

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCartStore();
  const [qty, setQty] = useState(item.quantity);

  const handleUpdate = async () => {
    try {
      await updateCartItem(item.id, qty);
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromCart(item.id);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const imageUrl = item.product.images?.[0]?.url || "https://placehold.co/400x300?text=No+Image";

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Product Image */}
      <img
        src={imageUrl}
        alt={item.product.name}
        className="w-24 h-24 object-cover rounded-lg"
      />

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">${item.product.price}</p>
        {item.product.stock <= 5 && item.product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-1">Only {item.product.stock} left in stock</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={qty <= 1}
        >
          -
        </button>
        <input
          type="number"
          min="1"
          max={item.product.stock}
          value={qty}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 1 && val <= item.product.stock) setQty(val);
          }}
          className="w-16 text-center border border-gray-300 rounded-lg py-1"
        />
        <button
          onClick={() => setQty(Math.min(item.product.stock, qty + 1))}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={qty >= item.product.stock}
        >
          +
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Update
        </button>
        <button
          onClick={handleRemove}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
