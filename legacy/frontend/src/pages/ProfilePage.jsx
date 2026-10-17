// src/pages/ProfilePage.jsx
import React from "react";
import useAuthStore from "../stores/authStore";

const ProfilePage = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-12 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-indigo-100 mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                First Name
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {user.firstName}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Last Name
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {user.lastName}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Email Address
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {user.email}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Role
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : user.role === "manager"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
