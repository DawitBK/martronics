import React, { useState, useEffect } from "react";
import { createProduct } from "../../api/productService";
import { listCategories } from "../../api/categoryService";
import { listSubCategories } from "../../api/subCategoryService";

const AddProductModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [subCategoryId, setSubCategoryId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const cRes = await listCategories();
        setCategories(cRes.data || []);
        if (cRes.data && cRes.data.length > 0) setCategoryId(cRes.data[0].id);

        const sRes = await listSubCategories();
        setSubCategories(sRes.data || []);
        if (sRes.data && sRes.data.length > 0)
          setSubCategoryId(sRes.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        price,
        stock,
        category_id: categoryId,
        sub_category_id: subCategoryId,
      };
      const res = await createProduct(payload);
      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            className="w-full border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full border p-2 rounded"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={subCategoryId || ""}
              onChange={(e) => setSubCategoryId(Number(e.target.value))}
              className="w-full border p-2 rounded"
            >
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
