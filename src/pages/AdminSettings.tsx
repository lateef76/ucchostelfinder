import React from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminSettings: React.FC = () => {
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
        <main className="flex-1 bg-white min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start overflow-x-auto">
          <div className="w-full max-w-2xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
              Platform Settings
            </h1>
            {/* Settings form/list placeholder */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="text-gray-600 text-center md:text-left">
                <p className="mb-2">Manage platform-wide settings here.</p>
                <p className="text-sm text-gray-400">
                  (Settings form or options will go here.)
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
