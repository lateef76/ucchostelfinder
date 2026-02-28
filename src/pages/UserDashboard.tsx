import React from "react";

import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Welcome, {user?.name || "User"}!
      </h2>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
        Browse and book hostels, manage your favorites, and more.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link
          to="/hostels"
          className="bg-ucc-blue text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-blue-900 transition-colors"
        >
          Browse Hostels
        </Link>
        <Link
          to="/favorites"
          className="bg-white border border-ucc-blue text-ucc-blue px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
        >
          My Favorites
        </Link>
        <Link
          to="/profile"
          className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
        >
          My Profile
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
