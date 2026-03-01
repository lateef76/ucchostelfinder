import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaHome, FaCogs, FaTimes, FaBuilding } from "react-icons/fa";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  return (
    <aside
      className={`fixed z-40 inset-y-0 left-0 transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out w-64 bg-linear-to-b from-yellow-300 via-yellow-400 to-yellow-500 flex flex-col py-8 px-6 border-r border-yellow-200
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Close button for mobile */}
      <button
        className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-blue-600 text-2xl"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        <FaTimes />
      </button>
      {/* Logo + Admin header only on mobile/tablet */}
      <div className="flex items-center gap-2 mb-10 md:hidden">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center shadow-xl ring-4 ring-pink-300/40 animate-pulse">
          <FaBuilding className="text-white text-3xl drop-shadow-lg" />
        </div>
        <span className="text-2xl font-extrabold text-gray-800 tracking-wide select-none drop-shadow-sm animate-pulse shadow-[0_0_16px_2px_rgba(236,72,153,0.4)]">
          Admin
        </span>
      </div>
      <nav className="flex flex-col gap-3 md:mt-0">
        <button
          className="flex items-center gap-4 text-left px-4 py-3 rounded-xl bg-linear-to-r from-blue-50 to-white hover:from-blue-100 hover:to-white text-blue-700 font-semibold text-base transition-all duration-150 shadow-sm hover:shadow-md group"
          onClick={() => {
            setSidebarOpen(false);
            navigate("/admin/users");
          }}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 group-hover:bg-blue-200 text-blue-600 text-xl">
            <FaUsers />
          </span>
          <span className="tracking-wide">User Management</span>
        </button>
        <button
          className="flex items-center gap-4 text-left px-4 py-3 rounded-xl bg-linear-to-r from-purple-50 to-white hover:from-purple-100 hover:to-white text-purple-700 font-semibold text-base transition-all duration-150 shadow-sm hover:shadow-md group"
          onClick={() => {
            setSidebarOpen(false);
            navigate("/admin/hostels");
          }}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 group-hover:bg-purple-200 text-purple-600 text-xl">
            <FaHome />
          </span>
          <span className="tracking-wide">Hostel Management</span>
        </button>
        <button
          className="flex items-center gap-4 text-left px-4 py-3 rounded-xl bg-linear-to-r from-green-50 to-white hover:from-green-100 hover:to-white text-green-700 font-semibold text-base transition-all duration-150 shadow-sm hover:shadow-md group"
          onClick={() => {
            setSidebarOpen(false);
            navigate("/admin/settings");
          }}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 group-hover:bg-green-200 text-green-600 text-xl">
            <FaCogs />
          </span>
          <span className="tracking-wide">Platform Settings</span>
        </button>
      </nav>
      <div className="mt-auto pt-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} UHF Hostel Finder
      </div>
    </aside>
  );
};

export default AdminSidebar;
