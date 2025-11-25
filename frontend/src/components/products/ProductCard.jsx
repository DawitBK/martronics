import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../stores/cartStore.js";
import useOrderStore from "../../stores/orderStore.js";
import EditProductModal from "./EditProductModal.jsx";
import { deleteProduct } from "../../api/productService";
import getProductImage from "../../utils/getProductImage";

const ProductCard = ({ product, onProductDeleted, onProductUpdated }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const createOrder = useOrderStore((state) => state.createOrder);

  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showEdit, setShowEdit] = useState(false);

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    const qty = Number(quantity) || 1;
    if (product.stock === 0 || product.stock < qty) {
      setMessage("Not enough stock");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    addToCart(product.id, qty);
    setMessage("Added to cart");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleBuyNow = async (e) => {
    e?.stopPropagation();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      // setMessage("Login required");
      navigate("/login");
      return;
    }

    const qty = Number(quantity) || 1;
    if (product.stock === 0 || product.stock < qty) {
      setMessage("Not enough stock");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const order = await createOrder({
      user_id: user.id,
      items: [{ product_id: product.id, quantity: qty }],
    });

    if (!order || !order.id) {
      setMessage("Order failed");
      return;
    }

    navigate(`/orders/${order.id}`);
  };

  const handleUpdate = (e) => {
    e.stopPropagation();
    setShowEdit(true);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(product.id);
      setMessage("Deleted");
      setTimeout(() => setMessage(""), 2000);
      if (onProductDeleted) onProductDeleted(product.id);
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const imageUrl = getProductImage(product);
  const isOutOfStock = product.stock === 0;

  const handleCardKeyDown = (e) => {
    if (e.key === "Enter") navigate(`/products/${product.id}`);
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      onClick={() => navigate(`/products/${product.id}`)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      role="article"
      aria-label={`Product: ${product.name}`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {message && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200">
            <p className="text-white font-medium px-4 py-2 rounded-full bg-white/20 backdrop-blur-md">
              {message}
            </p>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col grow">
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-lg font-bold text-gray-900 line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>
          <span className="text-lg font-bold text-blue-600">
            ${product.price}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 grow">
          {product.description || "No description available."}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            Stock:{" "}
            <span className="font-medium text-gray-900">{product.stock}</span>
          </span>
          {!isOutOfStock && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                aria-label={`Quantity for ${product.name}`}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value || 1)))
                }
                onClick={(ev) => ev.stopPropagation()}
                className="w-20 text-sm border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}
        </div>

        <div className="space-y-2 mt-auto">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              aria-label={`Buy ${product.name} now`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
            >
              Buy Now
            </button>
          </div>

          {["admin", "manager"].includes(
            JSON.parse(localStorage.getItem("user"))?.role
          ) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1.5 text-yellow-600 bg-yellow-50 text-xs font-medium rounded-md hover:bg-yellow-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-red-600 bg-red-50 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
        </div>
      </div>

      {showEdit && (
        <EditProductModal
          product={product}
          onClose={() => setShowEdit(false)}
          onUpdated={(updated) => {
            setShowEdit(false);
            if (onProductUpdated) onProductUpdated(updated);
            setMessage("Updated");
            setTimeout(() => setMessage(""), 2000);
          }}
        />
      )}
    </div>
  );
};

export default ProductCard;
