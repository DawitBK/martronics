import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductStore from "../../stores/productStore";
import useCartStore from "../../stores/cartStore";
import useOrderStore from "../../stores/orderStore";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, getProduct, loading, error } = useProductStore();
  const { addToCart } = useCartStore();
  const { createOrder } = useOrderStore();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getProduct(id);
  }, [id, getProduct]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, Number(quantity) || 1);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    const qty = Number(quantity) || 1;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        toast.error("You must be logged in to buy now");
        return;
      }

      const order = await createOrder({
        user_id: user.id,
        items: [{ product_id: product.id, quantity: qty }],
      });
      if (order && order.id) {
        toast.success("Order created");
        navigate(`/orders/${order.id}`);
        return;
      }
      toast.error("Failed to create order");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="max-h-96 w-full object-contain rounded-lg shadow-sm"
              />
            ) : (
              <div className="h-96 w-full flex items-center justify-center bg-gray-200 rounded-lg text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="mb-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {product.name}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Product ID:{" "}
                    <span className="font-medium text-gray-700">
                      {product.id}
                    </span>
                  </p>
                </div>
                {isOutOfStock && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Out of Stock
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center mb-6">
                <span className="text-4xl font-bold text-indigo-600">
                  ${product.price}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">
                  Availability:
                  <span
                    className={`font-medium ml-2 ${
                      isOutOfStock ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : `${product.stock} in stock`}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-8 mt-8">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-12 text-center border-x border-gray-300 py-1 focus:outline-none"
                    disabled={isOutOfStock}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                    disabled={quantity >= product.stock || isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className={`flex-1 py-3 px-6 rounded-md font-medium text-white shadow-md transition-all
                    ${
                      isOutOfStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                >
                  {adding
                    ? "Adding..."
                    : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`py-3 px-6 rounded-md font-medium text-white shadow-md transition-all
                    ${
                      isOutOfStock
                        ? "bg-gray-400"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  Buy Now
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="py-3 px-6 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
