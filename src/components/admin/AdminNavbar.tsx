import React from "react";
import { FaBell, FaUserCircle, FaBars, FaBuilding } from "react-icons/fa";

interface AdminNavbarProps {
  name?: string;
  onMenuClick?: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ name, onMenuClick }) => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-linear-to-r from-yellow-300 via-yellow-400 to-yellow-500 shadow-md border-b border-yellow-200 relative z-10">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden mr-2 text-blue-700 text-2xl p-1 rounded hover:bg-blue-100 transition"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>
      {/* Logo + Admin for desktop, hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 select-none">
        <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center shadow-lg ring-2 ring-pink-300/40">
          <FaBuilding className="text-white text-xl drop-shadow-lg" />
        </div>
        <span className="text-xl font-extrabold text-gray-800 tracking-wide drop-shadow-sm animate-pulse shadow-[0_0_8px_1px_rgba(236,72,153,0.3)]">
          Admin
        </span>
      </div>
      {/* Empty space for mobile */}
      <div className="md:hidden" />
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative text-blue-700 hover:text-blue-900 text-xl p-2 rounded-full hover:bg-blue-100 transition">
          <FaBell />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            2
          </span>
        </button>
        {/* Profile dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 text-blue-700 font-semibold focus:outline-none p-2 rounded-full hover:bg-blue-100 transition"
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="Profile menu"
          >
            <FaUserCircle className="text-2xl" />
            <span className="hidden sm:inline">{name || "Admin"}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-20">
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50">
                Profile
              </button>
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50">
                Settings
              </button>
              <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
