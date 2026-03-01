import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import { FaEdit } from "react-icons/fa";
import React, { useState } from "react";

const AdminUserList: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  type User = { name: string; email: string; role: string };
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const closeModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  // Example user data
  const users = [
    { name: "John Doe", email: "john@example.com", role: "Admin" },
    // Add more users here
  ];

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
        <main className="flex-1 bg-white min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start overflow-x-auto">
          <div className="w-full max-w-4xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
              User Management
            </h1>
            {/* User table/list placeholder */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
              <table className="min-w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example row */}
                  {users.map((user, idx) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-yellow-50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                          onClick={() => handleEdit(user)}
                        >
                          <FaEdit className="text-base" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Edit Modal (placeholder) */}
                  {editModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
                        <h2 className="text-lg font-bold mb-4 text-gray-800">
                          Edit User
                        </h2>
                        <div className="mb-4">
                          <div className="font-semibold text-gray-700">
                            Name:
                          </div>
                          <div className="text-gray-900">
                            {selectedUser?.name}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="font-semibold text-gray-700">
                            Email:
                          </div>
                          <div className="text-gray-900">
                            {selectedUser?.email}
                          </div>
                        </div>
                        <div className="mb-6">
                          <div className="font-semibold text-gray-700">
                            Role:
                          </div>
                          <div className="text-gray-900">
                            {selectedUser?.role}
                          </div>
                        </div>
                        <button
                          className="w-full py-2 rounded-lg bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
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

export default AdminUserList;
