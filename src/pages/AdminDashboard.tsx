import React from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Sidebar open state for mobile
  // Only gradient background
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 -z-10 bg-linear-to-tr from-blue-500 via-purple-500 to-pink-400" />
      <AdminNavbar name="Admin" onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 min-h-0" style={{ minHeight: 0 }}>
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {/* Overlay for mobile/tablet when sidebar is open - after sidebar so sidebar is above overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}
        <main className="flex-1 bg-white min-h-screen" />
      </div>
    </div>
  );
};

export default AdminDashboard;
