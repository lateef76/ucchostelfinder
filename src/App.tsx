import { useAuth } from "./hooks/useAuth";
import { useState } from "react";
import loginImage from "./assets/login-image.jpg";
// Add a modern font (e.g., Inter) via CDN in index.html for best effect, or use Tailwind's font-sans

function App() {
  const { user, loading, login, signup, logout } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Show loading state
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

  // Show auth screen if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-200 via-blue-100 to-blue-300 p-0 md:p-4 font-sans">
        <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex-col md:flex-row">
          {/* Left image section (hidden on mobile) */}
          <div className="hidden md:block md:w-1/2 relative min-h-100">
            <img
              src={loginImage}
              alt="Hostel background"
              className="object-cover w-full h-full min-h-100 max-h-175"
              style={{ minHeight: 400, maxHeight: 700 }}
            />
            {/* Optional: Use a subtle gradient overlay for better readability */}
            <div className="absolute inset-0 bg-linear-to-br from-ucc-blue/30 to-transparent" />
          </div>
          {/* Form section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-linear-to-br from-white/90 via-blue-50/80 to-blue-100/80">
            <div className="mb-8 text-center">
              <h1
                className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2 tracking-tight"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                UCC Hostel Finder
              </h1>
              <p
                className="text-gray-700 text-base md:text-lg font-medium"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Find your perfect student accommodation
              </p>
            </div>
            {/* Auth Card */}
            <div>
              <h2
                className="text-2xl font-bold text-blue-800 mb-6 text-center tracking-tight"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {isLoginView ? "Welcome Back" : "Create Account"}
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (isLoginView) {
                    await login(email, password);
                  } else {
                    await signup(email, password, name);
                  }
                }}
                className="space-y-5"
              >
                {/* Name field - only for signup */}
                {!isLoginView && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucc-blue focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                      required={!isLoginView}
                      minLength={2}
                    />
                  </div>
                )}
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucc-blue focus:border-transparent outline-none transition"
                    placeholder="student@ucc.edu.gh"
                    required
                  />
                </div>
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucc-blue focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                </div>
                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-ucc-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 transition-colors touch-manipulation shadow-md"
                >
                  {isLoginView ? "Sign In" : "Create Account"}
                </button>
              </form>
              {/* Toggle between login/signup */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="text-ucc-blue hover:underline touch-manipulation"
                >
                  {isLoginView
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
            {/* UCC Note */}
            <p
              className="text-xs text-gray-500 text-center mt-6"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Use your UCC email for student verification
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main app for logged in users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-ucc-blue">
              UCC Hostel Finder
            </h1>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors touch-manipulation"
              >
                <span className="text-sm font-medium">
                  {user.displayName || "User"}
                </span>
                <div className="w-8 h-8 bg-ucc-blue rounded-full flex items-center justify-center text-white">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
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
