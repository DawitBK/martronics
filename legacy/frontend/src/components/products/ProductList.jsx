import React, { useEffect, useState, useMemo } from "react";
import useProductStore from "../../stores/productStore.js"; // adjust path
import ProductCard from "./ProductCard.jsx";

// Per-category collapsing with pagination inside expanded category sections.
const ProductList = () => {
  const { products, getProducts, loading, error } = useProductStore();
  const PREVIEW_SIZE = 4; // items to show when collapsed
  const PAGE_SIZE = 12; // items per page when expanded

  const [expanded, setExpanded] = useState({}); // categoryName -> boolean
  const [pageByCategory, setPageByCategory] = useState({}); // categoryName -> page

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  // Group products by category name
  const grouped = products.reduce((acc, p) => {
    const cat = p.category?.name || "Uncategorized";
    acc[cat] = acc[cat] || [];
    acc[cat].push(p);
    return acc;
  }, {});

  const toggleCategory = (categoryName) => {
    setExpanded((prev) => ({ ...prev, [categoryName]: !prev[categoryName] }));
    // reset page to 1 when expanding
    setPageByCategory((prev) => ({ ...prev, [categoryName]: 1 }));
  };

  const setCategoryPage = (categoryName, page) => {
    setPageByCategory((prev) => ({ ...prev, [categoryName]: page }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {Object.entries(grouped).map(([categoryName, items]) => {
        const isExpanded = !!expanded[categoryName];
        const total = items.length;
        const page = pageByCategory[categoryName] || 1;
        const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

        const visibleItems = isExpanded
          ? items.slice(
              (page - 1) * PAGE_SIZE,
              (page - 1) * PAGE_SIZE + PAGE_SIZE
            )
          : items.slice(0, PREVIEW_SIZE);

        return (
          <section key={categoryName} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block w-2 h-2 rounded-full bg-indigo-500"
                  aria-hidden="true"
                />
                <h3 className="text-2xl font-bold text-gray-900">
                  {categoryName}
                </h3>
                <span className="text-sm text-gray-500">{total} products</span>
              </div>

              <div className="flex items-center gap-2">
                {total > PREVIEW_SIZE && (
                  <button
                    onClick={() => toggleCategory(categoryName)}
                    className="px-3 py-1.5 rounded-md text-sm bg-white border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? "Collapse" : `Show full preview`}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductUpdated={() => getProducts()}
                  onProductDeleted={() => getProducts()}
                />
              ))}
            </div>

            {/* If expanded and there are more than a page, show pagination */}
            {isExpanded && total > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setCategoryPage(categoryName, Math.max(1, page - 1))
                  }
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-md border bg-white text-sm disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: pageCount }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCategoryPage(categoryName, p)}
                      aria-current={p === page ? "page" : undefined}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCategoryPage(categoryName, Math.min(pageCount, page + 1))
                  }
                  disabled={page === pageCount}
                  className="px-3 py-1.5 rounded-md border bg-white text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            {/* If collapsed and more items exist, show a small indicator */}
            {!isExpanded && total > PREVIEW_SIZE && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => toggleCategory(categoryName)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View all {total} items
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default ProductList;
