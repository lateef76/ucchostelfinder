import React, { useEffect, useState, useRef } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminAnnouncements: React.FC = () => {
  // ...existing state and logic...

        useEffect(() => {
          const handleScroll = () => {
            if (sidebarRef.current) {
              setShowScrollTop(sidebarRef.current.scrollTop > 60);
            }
          };
          const sidebar = sidebarRef.current;
          if (sidebar) {
            sidebar.addEventListener("scroll", handleScroll);
          }
          return () => {
            if (sidebar) {
              sidebar.removeEventListener("scroll", handleScroll);
            }
          };
  // ...existing state and logic...
  // Place the SidebarWithScroll inside the main return below
  return (
    <div className="relative min-h-screen bg-gray-50">
      <AdminNavbar />
      <SidebarWithScroll />
      {/* Sidebar for mobile (slide-in) */}
      <div className="md:hidden">
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      {/* Main content area, scrollable, offset for fixed sidebar/navbar */}
      <div className="flex flex-1 min-h-0 pt-[64px] md:pt-[72px] ml-0 md:ml-64" style={{ minHeight: 0 }}>
        <main className="flex-1 bg-white min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start overflow-x-auto">
          {/* ...existing code for form and list... */}
        </main>
      </div>
    </div>
  );
};

// --- SidebarWithScroll: Fixed sidebar with scroll and scroll-to-top button ---
const SidebarWithScroll: React.FC = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        setShowScrollTop(sidebarRef.current.scrollTop > 60);
      }
    };
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (sidebar) {
        sidebar.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed z-40 inset-y-0 left-0 w-64 hidden md:block h-screen bg-white">
      <div
        ref={sidebarRef}
        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <AdminSidebar sidebarOpen={false} setSidebarOpen={() => {}} />
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed left-4 bottom-8 z-50 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-2 shadow-lg transition"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            aria-label="Scroll sidebar to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
            >
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  required
                  maxLength={100}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Content</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 min-h-[80px]"
                  required
                  maxLength={1000}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div>
                  <label className="font-semibold text-gray-700 mr-2">
                    Audience
                  </label>
                  <select
                    name="audience"
                    value={form.audience}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    <option value="managers">Managers</option>
                    <option value="users">Users</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 mr-2">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={form.expiresAt}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                >
                  {editing ? "Update" : "Create"} Announcement
                </button>
                {editing && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
                    onClick={() => {
                      setEditing(null);
                      setForm({
                        title: "",
                        content: "",
                        audience: "all",
                        expiresAt: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {/* List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                All Announcements
              </h2>
              {loading ? (
                <div className="text-center text-gray-400">Loading...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center text-gray-400">
                  No announcements found.
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {announcements.map((a) => (
                    <li
                      key={a.id}
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-bold text-gray-800 text-base">
                            {a.title}
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            {a.content}
                          </div>
                          <div className="text-xs text-gray-400">
                            Audience: {a.audience} | Created: {" "}
                            {a.createdAt?.seconds
                              ? new Date(
                                  a.createdAt.seconds * 1000,
                                ).toLocaleString()
                              : "-"} {" "}
                            {a.expiresAt && (
                              <>
                                | Expires: {" "}
                                {new Date(
                                  a.expiresAt.seconds * 1000,
                                ).toLocaleString()}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition"
                            onClick={() => handleEdit(a)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                            onClick={() => handleDelete(a.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
                  >
                    <option value="all">All</option>
                    <option value="managers">Managers</option>
                    <option value="users">Users</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 mr-2">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={form.expiresAt}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                >
                  {editing ? "Update" : "Create"} Announcement
                </button>
                {editing && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
                    onClick={() => {
                      setEditing(null);
                      setForm({
                        title: "",
                        content: "",
                        audience: "all",
                        expiresAt: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {/* List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                All Announcements
              </h2>
              {loading ? (
                <div className="text-center text-gray-400">Loading...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center text-gray-400">
                  No announcements found.
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {announcements.map((a) => (
                    <li
                      key={a.id}
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-bold text-gray-800 text-base">
                            {a.title}
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            {a.content}
                          </div>
                          <div className="text-xs text-gray-400">
                            Audience: {a.audience} | Created:{" "}
                            {a.createdAt?.seconds
                              ? new Date(
                                  a.createdAt.seconds * 1000,
                                ).toLocaleString()
                              : "-"}{" "}
                            {a.expiresAt && (
                              <>
                                | Expires:{" "}
                                {new Date(
                                  a.expiresAt.seconds * 1000,
                                ).toLocaleString()}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition"
                            onClick={() => handleEdit(a)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                            onClick={() => handleDelete(a.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
