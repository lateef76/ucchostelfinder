import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import loginImage from "../assets/login-image.jpg";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ForgotPassword: React.FC = () => {
  const { sendPasswordReset, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      await sendPasswordReset(email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch {
      setError("Failed to send reset email. Please check your email address.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden mx-4">
        {/* Left image for desktop */}
        <div className="hidden md:block md:w-1/2 bg-gray-100">
          <img
            src={loginImage}
            alt="Forgot password visual"
            className="object-cover w-full h-full min-h-100"
            loading="lazy"
          />
        </div>
        {/* Form section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold mb-6 text-center bg-linear-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
            Forgot Password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    touched && !validateEmail(email)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </div>
              {touched && !validateEmail(email) && (
                <div className="text-xs text-red-500 mt-1">
                  Enter a valid email address.
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
              {loading ? "Sending..." : "Send Reset Email"}
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

export default ForgotPassword;
