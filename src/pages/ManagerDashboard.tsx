import React from "react";

const ManagerDashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-2">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Hostel Manager Dashboard
      </h2>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
        Welcome, Hostel Manager! Here you can manage your hostels, bookings, and
        reviews.
      </p>
      <div className="w-full max-w-2xl grid gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold mb-2">My Hostels</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm">
            <li>View and edit your hostel listings</li>
            <li>Add new hostels</li>
            <li>Remove or update hostel details</li>
          </ul>
          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-max">
            Manage Hostels
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold mb-2">Bookings</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm">
            <li>View all bookings for your hostels</li>
            <li>Approve or reject booking requests</li>
          </ul>
          <button className="mt-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-max">
            Manage Bookings
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold mb-2">Reviews</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm">
            <li>View reviews for your hostels</li>
            <li>Respond to or report inappropriate reviews</li>
          </ul>
          <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-max">
            Manage Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
