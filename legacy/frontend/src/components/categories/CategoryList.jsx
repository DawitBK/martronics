import React, { useEffect } from "react";
import useCategoryStore from "../../stores/categoryStore";

const CategoryList = () => {
  const { categories, getCategories, loading, error } = useCategoryStore();

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <ul className="space-y-2">
      {categories.map((cat) => (
        <li key={cat.id} className="border p-2 rounded shadow">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{cat.name}</span>
            <span className="text-gray-600">{cat.description}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CategoryList;
