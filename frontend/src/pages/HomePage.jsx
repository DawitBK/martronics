import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/productService";
import { listCategories } from "../api/categoryService";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetchProducts(),
          listCategories(),
        ]);
        setFeaturedProducts(productsRes.data.slice(0, 4));
        setCategories(categoriesRes.data.slice(0, 3)); // Show top 3 categories
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://i.pinimg.com/1200x/f3/69/22/f36922174ca3b0b6e09043e0528e28fc.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Martronics</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-3xl leading-relaxed">
            Your one-stop destination for the latest electronics, fashion
            trends, and home essentials. Experience premium quality and
            unbeatable prices.
          </p>
          <div className="mt-12 flex gap-4">
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent py-4 px-10 rounded-full font-bold text-lg text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 hover:scale-105"
            >
              Shop Now
            </Link>
            <Link
              to="/categories"
              className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white/30 py-4 px-10 rounded-full font-bold text-lg text-white hover:bg-white/20 transition-all duration-300 shadow-xl transform hover:-translate-y-1"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections across electronics, fashion, and stationery
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-72 bg-gray-200 rounded-2xl animate-pulse"
                ></div>
              ))
            : categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-72 flex items-center justify-center bg-white transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                <h3 className="relative z-10 text-3xl font-bold text-white tracking-wider uppercase group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                  {category.name}
                </h3>
              </Link>
            ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of trending items
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading
              ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-96 bg-gray-200 rounded-2xl animate-pulse"
                  ></div>
                ))
              : featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col transform hover:-translate-y-2"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Out of Stock
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        ${product.price}
                      </span>
                      <span className="text-sm font-semibold text-purple-600 group-hover:text-purple-700 flex items-center gap-1">
                        View Details
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-600 text-lg font-bold rounded-full text-purple-600 bg-white hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View All Products
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
