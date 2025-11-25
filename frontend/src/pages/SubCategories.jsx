import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  listSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../api/subCategoryService";
import { fetchProducts } from "../api/productService";
import useAuthStore from "../stores/authStore";

const SubCategoriesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const categoryId = searchParams.get("category");
  const subcategoryId = searchParams.get("subcategory");

  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedSubIds, setExpandedSubIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Add-subcategory modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategoryForNew, setSelectedCategoryForNew] = useState(
    categoryId ? Number(categoryId) : null
  );

  const isAdminOrManager =
    user && (user.role === "admin" || user.role === "manager");

  // CRUD helpers for admins (simple prompt-based flows)
  const handleAddSubcategory = () => {
    setNewSubName("");
    setShowAddModal(true);
  };

  const handleEditSubcategory = async (sub) => {
    const name = window.prompt("Enter new name", sub.name);
    if (!name) return;
    try {
      await updateSubCategory(sub.id, { name });
      const res = await listSubCategories();
      setSubCategories(
        (res.data || [])
          .filter((s) => !categoryId || s.category_id === parseInt(categoryId))
          .map((s) => ({
            ...s,
            products: products.filter((p) => p.sub_category_id === s.id),
          }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update subcategory");
    }
  };

  const handleDeleteSubcategory = async (sub) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await deleteSubCategory(sub.id);
      setSubCategories((prev) => prev.filter((s) => s.id !== sub.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete subcategory");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [subCatRes, productsRes] = await Promise.all([
          listSubCategories(),
          fetchProducts(),
        ]);

        let filteredSubCats = subCatRes.data || [];
        let allProducts = productsRes.data || [];

        // Filter by category if specified
        if (categoryId) {
          filteredSubCats = filteredSubCats.filter(
            (sub) => sub.category_id === parseInt(categoryId)
          );
        }

        // Group products by subcategory
        const productsBySubCat = {};
        allProducts.forEach((product) => {
          if (!productsBySubCat[product.sub_category_id]) {
            productsBySubCat[product.sub_category_id] = [];
          }
          productsBySubCat[product.sub_category_id].push(product);
        });

        // Attach products to subcategories
        filteredSubCats = filteredSubCats.map((sub) => ({
          ...sub,
          products: productsBySubCat[sub.id] || [],
        }));

        setSubCategories(filteredSubCats);
        setProducts(allProducts);

        // Auto-expand if subcategory is specified
        if (subcategoryId) {
          setExpandedSubIds(new Set([parseInt(subcategoryId)]));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId, subcategoryId]);

  // load categories for add-subcategory select
  useEffect(() => {
    const loadCats = async () => {
      try {
        const catModule = await import("../api/categoryService");
        const res = await catModule.listCategories();
        setAvailableCategories(res.data || []);
        if (!selectedCategoryForNew && res.data && res.data.length > 0) {
          setSelectedCategoryForNew(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCats();
  }, []);

  const toggleExpand = (id) => {
    setExpandedSubIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-600 mt-2">Browse products by subcategory</p>
        </div>
        {isAdminOrManager && (
          <button
            onClick={handleAddSubcategory}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            + Add Subcategory
          </button>
        )}
      </div>

      {/* Subcategories List */}
      <div className="space-y-4">
        {subCategories.length > 0 ? (
          subCategories.map((sub) => {
            const isExpanded = expandedSubIds.has(sub.id);

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Subcategory Header */}
                <div className="flex items-center justify-between p-6">
                  <button
                    onClick={() => toggleExpand(sub.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleExpand(sub.id);
                    }}
                    tabIndex={0}
                    className="flex items-center space-x-3 flex-1 text-left group"
                  >
                    <div
                      className={`transform transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {sub.products?.length || 0} products
                      </p>
                    </div>
                  </button>
                  {isAdminOrManager && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditSubcategory(sub)}
                        className="px-3 py-1.5 text-yellow-600 bg-yellow-50 text-xs font-medium rounded-md hover:bg-yellow-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(sub)}
                        className="px-3 py-1.5 text-red-600 bg-red-50 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Products (Expandable) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-6">
                    {sub.products && sub.products.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sub.products.map((product) => {
                          const imageUrl =
                            product.images?.[0]?.url ||
                            "https://placehold.co/400x300?text=No+Image";
                          const isOutOfStock = product.stock === 0;

                          return (
                            <div
                              key={product.id}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleProductClick(product.id);
                              }}
                              onClick={() => handleProductClick(product.id)}
                              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col cursor-pointer"
                            >
                              {/* Product Image */}
                              <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                />
                                {isOutOfStock && (
                                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    Out of Stock
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="p-4 flex flex-col grow">
                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2 grow">
                                  {product.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                  <span className="text-lg font-bold text-indigo-600">
                                    ${product.price}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {product.stock > 0
                                      ? `${product.stock} in stock`
                                      : "Out of stock"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-8">
                        No products in this subcategory yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No subcategories found
            </h3>
            <p className="mt-2 text-gray-500">
              Browse categories to explore products
            </p>
            <button
              onClick={() => navigate("/categories")}
              className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              View Categories
            </button>
          </div>
        )}
      </div>
      {/* Add Subcategory Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowAddModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
            aria-labelledby="add-subcategory-title"
          >
            <h3
              id="add-subcategory-title"
              className="text-lg font-semibold mb-4"
            >
              Add Subcategory
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  className="w-full border p-2 rounded"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full border p-2 rounded"
                  value={selectedCategoryForNew || ""}
                  onChange={(e) =>
                    setSelectedCategoryForNew(Number(e.target.value))
                  }
                >
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  aria-label="Create subcategory"
                  className="px-4 py-2 bg-indigo-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={async () => {
                    if (!newSubName.trim() || !selectedCategoryForNew) {
                      alert("Name and category are required");
                      return;
                    }
                    try {
                      await createSubCategory({
                        name: newSubName.trim(),
                        category_id: selectedCategoryForNew,
                      });
                      // refresh subcategories list
                      const res = await listSubCategories();
                      let filteredSubCats = res.data || [];
                      if (categoryId) {
                        filteredSubCats = filteredSubCats.filter(
                          (s) => s.category_id === parseInt(categoryId)
                        );
                      }
                      const productsBySubCat = {};
                      (products || []).forEach((p) => {
                        if (!productsBySubCat[p.sub_category_id])
                          productsBySubCat[p.sub_category_id] = [];
                        productsBySubCat[p.sub_category_id].push(p);
                      });
                      setSubCategories(
                        filteredSubCats.map((s) => ({
                          ...s,
                          products: productsBySubCat[s.id] || [],
                        }))
                      );
                      setShowAddModal(false);
                    } catch (err) {
                      console.error(err);
                      alert("Failed to create subcategory");
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoriesPage;
