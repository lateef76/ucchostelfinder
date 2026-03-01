import React from "react";

const HostelApprovalMobile: React.FC = () => {
  // Placeholder data for hostels pending approval
  const pendingHostels = [
    {
      id: "1",
      name: "Sunrise Hostel",
      manager: "John Doe",
      location: "North Campus",
      images: ["https://placehold.co/100x100"],
      submittedAt: "2026-02-28",
    },
    {
      id: "2",
      name: "Green Villa",
      manager: "Jane Smith",
      location: "West End",
      images: ["https://placehold.co/100x100"],
      submittedAt: "2026-02-27",
    },
  ];

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-center">Hostel Approval</h1>
      <div className="space-y-4">
        {pendingHostels.length === 0 ? (
          <div className="text-center text-gray-500">
            No hostels pending approval.
          </div>
        ) : (
          pendingHostels.map((hostel) => (
            <div
              key={hostel.id}
              className="bg-white rounded-xl shadow p-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={hostel.images[0]}
                  alt={hostel.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <div>
                  <div className="font-semibold text-base">{hostel.name}</div>
                  <div className="text-xs text-gray-500">{hostel.location}</div>
                  <div className="text-xs text-gray-400">
                    By {hostel.manager}
                  </div>
                  <div className="text-xs text-gray-400">
                    Submitted: {hostel.submittedAt}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-1 rounded bg-green-500 text-white font-medium text-sm">
                  Approve
                </button>
                <button className="flex-1 py-1 rounded bg-red-500 text-white font-medium text-sm">
                  Reject
                </button>
                <button className="flex-1 py-1 rounded bg-blue-500 text-white font-medium text-sm">
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HostelApprovalMobile;
