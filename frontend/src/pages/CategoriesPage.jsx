import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCategoryStore from "../stores/categoryStore";
import useAuthStore from "../stores/authStore";
import { createCategory, updateCategory, deleteCategory } from "../api/categoryService";
import { toast } from "react-toastify";

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const { user } = useAuthStore();
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const isAdminOrManager = user && (user.role === "admin" || user.role === "manager");

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryName });
        toast.success("Category updated successfully");
      } else {
        await createCategory({ name: categoryName });
        toast.success("Category created successfully");
      }
      fetchCategories();
      setShowModal(false);
      setCategoryName("");
      setEditingCategory(null);
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(categoryId);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    navigate(`/subcategories?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Browse and manage product categories</p>
        </div>
        {isAdminOrManager && (
          <button
            onClick={handleAddCategory}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            + Add Category
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4 flex-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center space-x-3 flex-1 text-left group"
                >
                  <div className={`transform transition-transform duration-200 ${expandedCategories.has(category.id) ? 'rotate-90' : ''
                    }`}>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.SubCategories?.length || 0} subcategories
                    </p>
                  </div>
                </button>
              </div>

              {/* Action Buttons */}
              {isAdminOrManager && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Subcategories (Expandable) */}
            {expandedCategories.has(category.id) && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                {category.SubCategories && category.SubCategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {category.SubCategories.map((subCategory) => (
                      <button
                        key={subCategory.id}
                        onClick={() => handleSubcategoryClick(category.id, subCategory.id)}
                        className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
                      >
                        <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {subCategory.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">View products →</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No subcategories yet</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter category name"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveCategory}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingCategory ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCategoryName("");
                  setEditingCategory(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
