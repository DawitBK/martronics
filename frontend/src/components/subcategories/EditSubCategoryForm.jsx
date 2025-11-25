import React, { useEffect, useState } from "react";
import { updateSubCategory } from "../../api/subCategoryService";
import { listCategories } from "../../api/categoryService";

const EditSubCategoryForm = ({ close, refresh, subCategory }) => {
  const [name, setName] = useState(subCategory.name);
  const [categoryId, setCategoryId] = useState(subCategory.category_id);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await listCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateSubCategory(subCategory.id, {
      name,
      category_id: categoryId,
    });

    refresh();
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form
        className="bg-white p-6 rounded shadow w-96"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-4">Edit SubCategory</h2>

        <input
          type="text"
          className="w-full border p-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full border p-2 mb-3"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSubCategoryForm;
