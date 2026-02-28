// ...existing code...
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
          <h1 className="text-2xl font-bold text-ucc-blue">
            UCC Hostel Finder
          </h1>
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
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-ucc-blue">
              UCC Hostel Finder
            </h1>
            <div className="relative">
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors touch-manipulation"
              >
                <span className="text-sm font-medium">
                  {user?.displayName || "User"}
                </span>
                <div className="w-8 h-8 bg-ucc-blue rounded-full flex items-center justify-center text-white">
                  {user?.displayName?.charAt(0) || "U"}
                </div>
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

export default App;
