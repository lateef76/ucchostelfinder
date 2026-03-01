
import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

import {
  fetchPlatformAnalytics,
  fetchPlatformReports,
  fetchPlatformSettings,
} from "../lib/platform";
import type { PlatformAnalytics, PlatformReports, PlatformSettings } from "../lib/platform";

const AdminSettings: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [reports, setReports] = useState<PlatformReports | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [a, r, s] = await Promise.all([
        fetchPlatformAnalytics(),
        fetchPlatformReports(),
        fetchPlatformSettings(),
      ]);
      setAnalytics(a);
      setReports(r);
      setSettings(s);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 -z-10 bg-linear-to-tr from-yellow-300 via-yellow-400 to-yellow-500" />
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
            <div className="bg-white rounded-xl shadow-md border border-yellow-200 p-6">
              {/* Analytics Section */}
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-yellow-700">Analytics</h2>
                {loading ? (
                  <div className="text-gray-400 text-sm">Loading analytics...</div>
                ) : analytics ? (
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Total Users: <span className="font-semibold">{analytics.totalUsers}</span></li>
                    <li>Total Hostels: <span className="font-semibold">{analytics.totalHostels}</span></li>
                    <li>Total Bookings: <span className="font-semibold">{analytics.totalBookings}</span></li>
                    <li>Total Reviews: <span className="font-semibold">{analytics.totalReviews}</span></li>
                  </ul>
                ) : (
                  <div className="text-gray-400 text-sm">No analytics data.</div>
                )}
              </section>
              <hr className="my-4 border-yellow-200" />
              {/* Reports Section */}
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-yellow-700">Reports</h2>
                {loading ? (
                  <div className="text-gray-400 text-sm">Loading reports...</div>
                ) : reports ? (
                  <div className="text-sm text-gray-700">
                    <div>Last Report: <span className="font-semibold">{reports.lastReportDate}</span></div>
                    <a
                      href={reports.downloadUrl}
                      className="inline-block mt-2 px-3 py-1 rounded bg-yellow-500 text-white text-xs font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Report
                    </a>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No reports available.</div>
                )}
              </section>
              <hr className="my-4 border-yellow-200" />
              {/* App-wide Settings Section */}
              <section>
                <h2 className="text-lg font-semibold mb-2 text-yellow-700">App-wide Settings</h2>
                {loading ? (
                  <div className="text-gray-400 text-sm">Loading settings...</div>
                ) : settings ? (
                  <form className="space-y-4">
                    <div>
                      <label className="block font-medium text-sm">
                        Enable Maintenance Mode
                      </label>
                      <input
                        type="checkbox"
                        className="toggle toggle-warning"
                        checked={settings.maintenanceMode}
                        readOnly
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-sm">
                        Default Booking Limit
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full max-w-xs border-yellow-300"
                        value={settings.defaultBookingLimit}
                        readOnly
                        disabled
                      />
                    </div>
                    <button
                      className="w-full py-2 rounded bg-yellow-500 text-white font-medium text-sm"
                      disabled
                    >
                      Save Settings
                    </button>
                  </form>
                ) : (
                  <div className="text-gray-400 text-sm">No settings found.</div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
