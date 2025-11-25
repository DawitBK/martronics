import React, { useState } from "react";
import useCategoryStore from "../../stores/categoryStore";

const EditCategoryModal = ({ category, onClose }) => {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);

  const { editCategory } = useCategoryStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await editCategory(category.id, { name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Edit Category</h2>

        <form className="space-y-2" onSubmit={handleSubmit}>
          <input
            className="w-full border p-2 rounded"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
