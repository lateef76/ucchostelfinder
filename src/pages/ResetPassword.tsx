import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import loginImage from "../assets/login-image.jpg";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function validatePassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password,
  );
}

const ResetPassword: React.FC = () => {
  const { confirmPasswordReset, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();
  const oobCode = query.get("oobCode") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!oobCode) {
      setError("Invalid or missing reset code.");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      );
      return;
    }
    try {
      await confirmPasswordReset(oobCode, password);
      setMessage("Password reset successful! You can now sign in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Failed to reset password. The link may be invalid or expired.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden mx-4">
        {/* Left image for desktop */}
        <div className="hidden md:block md:w-1/2 bg-gray-100">
          <img
            src={loginImage}
            alt="Reset password visual"
            className="object-cover w-full h-full min-h-100"
            loading="lazy"
          />
        </div>
        {/* Form section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold mb-6 text-center bg-linear-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    touched && !validatePassword(password)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(true)}
                  required
                  minLength={8}
                  autoFocus
                  autoComplete="new-password"
                  placeholder="Create a new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {touched && !validatePassword(password) && (
                <div className="text-xs text-red-500 mt-1">
                  Password must be at least 8 characters, include uppercase,
                  lowercase, number, and special character.
                </div>
              )}
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            {message && (
              <div className="text-green-600 text-sm text-center">
                {message}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-500 to-pink-500 text-white py-2 rounded font-semibold shadow hover:from-blue-600 hover:to-pink-600 transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          <div className="flex justify-between mt-6 text-sm">
            <Link to="/login" className="text-blue-500 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
