import React from "react";

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-2">
      <h2 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h2>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
        Welcome, Admin! Here you can manage users, hostels, and platform
        settings.
      </p>
      <div className="w-full max-w-2xl grid gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold mb-2">User Management</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm">
            <li>View all users and their roles</li>
            <li>Assign or change roles (admin, manager, user)</li>
            <li>Deactivate or delete users</li>
          </ul>
          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-max">
            Go to User Management
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold mb-2">Hostel Management</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm">
            <li>View all hostels</li>
            <li>Approve or remove hostel listings</li>
            <li>Assign managers to hostels</li>
          </ul>
          <button className="mt-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-max">
            Go to Hostel Management
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold mb-2">Platform Settings</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm">
            <li>Manage app-wide settings</li>
            <li>View analytics and reports</li>
          </ul>
          <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-max">
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
