import React from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminHostels: React.FC = () => {
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
          <div className="w-full max-w-4xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
              Hostel Management
            </h1>
            {/* Hostel table/list placeholder */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
              <table className="min-w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example row */}
                  <tr className="border-t hover:bg-yellow-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      Sunrise Hostel
                    </td>
                    <td className="px-4 py-3 text-gray-600">Campus Road</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition cursor-not-allowed opacity-60"
                        disabled
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                  {/* More rows will go here */}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHostels;
