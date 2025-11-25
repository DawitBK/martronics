import React, { useState } from "react";
import ProductList from "../components/products/ProductList";
import AddProductModal from "../components/products/AddProductModal";
import useAuthStore from "../stores/authStore";
import useProductStore from "../stores/productStore";

const ProductsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  const isAdminOrManager =
    user && (user.role === "admin" || user.role === "manager");
  const { getProducts } = useProductStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            Browse our collection of products
          </p>
        </div>
        {isAdminOrManager && (
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            onClick={() => setShowModal(true)}
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Product List */}
      <ProductList />

      {/* Add Product Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onCreated={() => getProducts()}
        />
      )}
    </div>
  );
};

export default ProductsPage;
