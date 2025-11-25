import React from "react";
import useCartStore from "../../stores/cartStore";

const CartSummary = () => {
  const { cartItems, buyAllItems } = useCartStore();

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="p-4 border rounded shadow mt-4">
      <h2 className="font-bold text-lg">Cart Summary</h2>

      <p>Total Items: {cartItems.length}</p>
      <p className="font-semibold mb-2">Total Price: ${total.toFixed(2)}</p>

      <button
        onClick={buyAllItems}
        className="w-full bg-green-700 text-white py-2 rounded"
      >
        Buy All Items
      </button>
    </div>
  );
};

export default CartSummary;
