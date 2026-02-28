import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { FaHome } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";

// Modal component using React Portal
function Modal({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-[2px] pointer-events-none">
      <div className="pointer-events-auto">{children}</div>
    </div>,
    document.body,
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ucc-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <Signup />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <header className="w-full py-6 bg-white shadow">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a
            href="/"
            className="flex items-center gap-1 group focus:outline-none align-middle"
            title="Go to Home Page"
          >
            <span className="inline-block text-ucc-blue drop-shadow-md align-middle text-3xl">
              <FaHome className="inline-block mr-0 text-ucc-blue drop-shadow-md text-3xl" />
            </span>
              <span
                className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-ucc-blue via-blue-400 to-blue-700 text-3xl font-sans drop-shadow-sm transition-all duration-500 animate-fade-in align-middle relative"
              style={{
                fontFamily: "Poppins, Inter, Arial, sans-serif",
                top: "2px",
              }}
            >
              UHF
            </span>
          </a>
          <div>
            <a
              href="/login"
              className="text-ucc-blue font-medium hover:underline mr-4"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="text-ucc-blue font-medium hover:underline"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Find Your Perfect Hostel at UCC
        </h2>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
          Welcome to the UCC Hostel Finder. Browse, filter, and discover the
          best student hostels around the University of Cape Coast. Sign up or
          log in to get started!
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="bg-ucc-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="bg-white border border-ucc-blue text-ucc-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign Up
          </a>
        </div>
      </main>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    setShowConfirm(false);
    logout();
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Confirmation Modal using Portal */}
      <Modal open={showConfirm}>
        <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-xs sm:max-w-sm mx-auto animate-fade-in flex flex-col items-center">
          <div className="text-base font-semibold mb-3 text-gray-800 text-center">
            Are you sure you want to log out?
          </div>
          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={confirmLogout}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
            >
              Yes, Log Out
            </button>
            <button
              onClick={cancelLogout}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <header className="bg-white shadow-sm">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-1 group focus:outline-none align-middle"
              title="Go to Home Page"
            >
              <span className="inline-block text-ucc-blue drop-shadow-md align-middle text-3xl">
                <FaHome className="inline-block mr-0 text-ucc-blue drop-shadow-md text-3xl" />
              </span>
                <span
                  className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-ucc-blue via-blue-400 to-blue-700 text-3xl font-sans drop-shadow-sm transition-all duration-500 animate-fade-in align-middle relative"
                style={{
                  fontFamily: "Poppins, Inter, Arial, sans-serif",
                  top: "2px",
                }}
              >
                UHF
              </span>
            </a>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  {user?.displayName || "User"}
                </span>
                <div className="w-8 h-8 bg-ucc-blue rounded-full flex items-center justify-center text-white">
                  {user?.displayName?.charAt(0) || "U"}
                </div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 text-base sm:text-lg"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden xs:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mobile-container py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to UCC Hostel Finder! 🎉
          </h2>
          <p className="text-gray-600">
            You're successfully logged in. Ready to find your perfect hostel?
          </p>
        </div>
      </main>
    </div>
  );
}

// Add keyframes for fade-in animation if not present
<style>{`
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.8s ease;
}
`}</style>;

export default App;
