import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";
import loginImage from "../assets/login-image.jpg";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password,
  );
}

const Login: React.FC = () => {
  const { login, loginWithGoogle, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setFormError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      );
      return;
    }
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setFormError("Invalid email or password");
    }
  };

  const handleGoogle = async () => {
    setFormError(null);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch {
      setFormError("Google sign-in failed");
    }
  };

  return (
    <>
      {/* Mobile form */}
      <div className="md:hidden min-h-screen flex items-center justify-center bg-linear-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="w-full max-w-xs bg-white rounded-xl shadow-lg mx-2 my-8 p-6 flex flex-col justify-center">
          <h1 className="text-2xl font-extrabold mb-4 text-center bg-linear-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            <div className="w-full">
              <label className="block text-xs font-medium mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs md:text-base ${
                    touched.email && !validateEmail(email)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </div>
              {touched.email && !validateEmail(email) && (
                <div className="text-xs text-red-500 mt-1">
                  Enter a valid email address.
                </div>
              )}
            </div>
            <div className="w-full">
              <label className="block text-xs font-medium mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs md:text-base ${
                    touched.password && !validatePassword(password)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
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
              {touched.password && !validatePassword(password) && (
                <div className="text-xs text-red-500 mt-1">
                  Password must be at least 8 characters, include uppercase,
                  lowercase, number, and special character.
                </div>
              )}
            </div>
            {(formError || error) && (
              <div className="text-red-600 text-xs text-center">
                {formError || error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-500 to-pink-500 text-white py-2 rounded font-semibold shadow hover:from-blue-600 hover:to-pink-600 transition-colors disabled:opacity-60 text-xs mb-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded font-semibold shadow-sm hover:bg-gray-100 transition-colors text-xs bg-white text-gray-700"
              disabled={loading}
              type="button"
            >
              <FaGoogle className="text-lg" />
              <span>Sign in with Google</span>
            </button>
            <div className="flex justify-between w-full mt-6 text-xs">
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
              <span>
                New here?{" "}
                <Link to="/signup" className="text-pink-500 hover:underline">
                  Sign Up
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
      {/* Desktop/tablet form */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-linear-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden mx-4">
          {/* Left image for desktop */}
          <div className="hidden md:block md:w-1/2 bg-gray-100">
            <img
              src={loginImage}
              alt="Login visual"
              className="object-cover w-full h-full min-h-100"
              loading="lazy"
            />
          </div>
          {/* Form section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-10">
            <h1 className="text-3xl font-extrabold mb-6 text-center bg-linear-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Welcome Back
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
                      touched.email && !validateEmail(email)
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="you@email.com"
                  />
                </div>
                {touched.email && !validateEmail(email) && (
                  <div className="text-xs text-red-500 mt-1">
                    Enter a valid email address.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      touched.password && !validatePassword(password)
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {touched.password && !validatePassword(password) && (
                  <div className="text-xs text-red-500 mt-1">
                    Password must be at least 8 characters, include uppercase,
                    lowercase, number, and special character.
                  </div>
                )}
              </div>
              {(formError || error) && (
                <div className="text-red-600 text-sm text-center">
                  {formError || error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-500 to-pink-500 text-white py-2 rounded font-semibold shadow hover:from-blue-600 hover:to-pink-600 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <button
              onClick={handleGoogle}
              className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100 transition-colors font-semibold text-gray-700"
              disabled={loading}
              type="button"
            >
              <FaGoogle className="text-lg" />
              <span>Sign in with Google</span>
            </button>
            <div className="flex justify-between mt-6 text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
              <span>
                New here?{" "}
                <Link to="/signup" className="text-pink-500 hover:underline">
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
