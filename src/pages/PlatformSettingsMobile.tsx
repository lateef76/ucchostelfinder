import React from "react";

const PlatformSettingsMobile: React.FC = () => {
  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-center">Platform Settings</h1>
      <div className="bg-white rounded-xl shadow p-4 space-y-6">
        {/* Analytics Section */}
        <section>
          <h2 className="text-base font-semibold mb-1">Analytics</h2>
          <p className="text-gray-600 mb-2 text-sm">
            View platform analytics and reports here.
          </p>
          <button
            className="w-full py-2 rounded bg-blue-500 text-white font-medium text-sm"
            disabled
          >
            Coming Soon
          </button>
        </section>
        <hr />
        {/* Reports Section */}
        <section>
          <h2 className="text-base font-semibold mb-1">Reports</h2>
          <p className="text-gray-600 mb-2 text-sm">
            Download or view platform reports.
          </p>
          <button
            className="w-full py-2 rounded bg-blue-500 text-white font-medium text-sm"
            disabled
          >
            Coming Soon
          </button>
        </section>
        <hr />
        {/* App-wide Settings Section */}
        <section>
          <h2 className="text-base font-semibold mb-1">App-wide Settings</h2>
          <form className="space-y-4">
            <div>
              <label className="block font-medium text-sm">
                Enable Maintenance Mode
              </label>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                disabled
              />
            </div>
            <div>
              <label className="block font-medium text-sm">
                Default Booking Limit
              </label>
              <input
                type="number"
                className="input input-bordered w-full max-w-xs"
                placeholder="e.g. 3"
                disabled
              />
            </div>
            <button
              className="w-full py-2 rounded bg-blue-500 text-white font-medium text-sm"
              disabled
            >
              Save Settings
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default PlatformSettingsMobile;
