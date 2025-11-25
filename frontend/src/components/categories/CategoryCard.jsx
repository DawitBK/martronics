// import React, { useState, useEffect } from "react";
// import useCategoryStore from "../../stores/categoryStore.js";

// const CategoryCard = ({ category }) => {
//   const { updateCategory, deleteCategory, subCategories, addSubCategory } =
//     useCategoryStore((state) => state);

//   const [showEdit, setShowEdit] = useState(false);
//   const [categoryName, setCategoryName] = useState(category.name);

//   const [showAddSub, setShowAddSub] = useState(false);
//   const [subName, setSubName] = useState("");

//   // Filter subcategories for this category
//   const categorySubs = subCategories.filter(
//     (sub) => sub.category_id === category.id
//   );

//   const handleUpdateCategory = async () => {
//     await updateCategory(category.id, { name: categoryName });
//     setShowEdit(false);
//   };

//   const handleDeleteCategory = async () => {
//     if (window.confirm("Are you sure you want to delete this category?")) {
//       await deleteCategory(category.id);
//     }
//   };

//   const handleAddSubCategory = async () => {
//     if (!subName) return;
//     await addSubCategory({ name: subName, category_id: category.id });
//     setSubName("");
//     setShowAddSub(false);
//   };

//   return (
//     <div className="border p-4 rounded shadow mb-4">
//       {/* Category Header */}
//       <div className="flex justify-between items-center">
//         {showEdit ? (
//           <input
//             className="border rounded px-2 py-1"
//             value={categoryName}
//             onChange={(e) => setCategoryName(e.target.value)}
//           />
//         ) : (
//           <h3 className="text-lg font-semibold">{category.name}</h3>
//         )}

//         <div className="space-x-2">
//           {showEdit ? (
//             <button
//               className="bg-green-500 text-white px-2 py-1 rounded"
//               onClick={handleUpdateCategory}
//             >
//               Save
//             </button>
//           ) : (
//             <button
//               className="bg-blue-500 text-white px-2 py-1 rounded"
//               onClick={() => setShowEdit(true)}
//             >
//               Edit
//             </button>
//           )}

//           <button
//             className="bg-red-500 text-white px-2 py-1 rounded"
//             onClick={handleDeleteCategory}
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {/* Subcategories */}
//       <div className="mt-2 pl-4">
//         <h4 className="font-medium">Subcategories:</h4>
//         <ul className="list-disc ml-5">
//           {categorySubs.map((sub) => (
//             <li key={sub.id}>{sub.name}</li>
//           ))}
//         </ul>

//         {showAddSub ? (
//           <div className="mt-2 flex gap-2">
//             <input
//               className="border rounded px-2 py-1 flex-1"
//               placeholder="Subcategory name"
//               value={subName}
//               onChange={(e) => setSubName(e.target.value)}
//             />
//             <button
//               className="bg-green-500 text-white px-2 py-1 rounded"
//               onClick={handleAddSubCategory}
//             >
//               Add
//             </button>
//             <button
//               className="bg-gray-300 px-2 py-1 rounded"
//               onClick={() => setShowAddSub(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         ) : (
//           <button
//             className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
//             onClick={() => setShowAddSub(true)}
//           >
//             + Add Subcategory
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CategoryCard;

import React, { useState } from "react";
import useCategoryStore from "../../stores/categoryStore.js";

const CategoryCard = ({ category }) => {
  const { updateCategory, deleteCategory } = useCategoryStore((state) => state);
  const [showSub, setShowSub] = useState(false);

  return (
    <div className="border p-4 rounded mb-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{category.name}</h3>
        <div className="flex gap-2">
          <button
            className="bg-yellow-400 px-2 py-1 rounded"
            onClick={() => {
              const newName = prompt("Enter new category name", category.name);
              if (newName) updateCategory(category.id, { name: newName });
            }}
          >
            Edit
          </button>
          <button
            className="bg-red-500 px-2 py-1 rounded text-white"
            onClick={() => deleteCategory(category.id)}
          >
            Delete
          </button>
          <button
            className="bg-blue-400 px-2 py-1 rounded text-white"
            onClick={() => setShowSub(!showSub)}
          >
            {showSub ? "Hide Subcategories" : "Show Subcategories"}
          </button>
        </div>
      </div>

      {showSub && category.subCategory?.length > 0 && (
        <ul className="mt-2 pl-4 list-disc">
          {category.subCategory.map((sub) => (
            <li key={sub.id}>{sub.name}</li>
          ))}
        </ul>
      )}

      {showSub && category.subCategory?.length === 0 && (
        <p className="mt-2 pl-4 text-gray-500">No subcategories</p>
      )}
    </div>
  );
};

export default CategoryCard;
