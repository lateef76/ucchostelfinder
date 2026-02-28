import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login, loginWithGoogle, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-ucc-blue">
          Sign In to Your Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ucc-blue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ucc-blue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {(formError || error) && (
            <div className="text-red-600 text-sm text-center">
              {formError || error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-ucc-blue text-white py-2 rounded font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <button
          onClick={handleGoogle}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100 transition-colors"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.7 30.77 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.04l7.18 5.59C43.98 37.13 46.1 31.3 46.1 24.55z"
              />
              <path
                fill="#FBBC05"
                d="M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.18-5.59c-2.01 1.35-4.6 2.15-8.72 2.15-6.38 0-11.87-3.63-14.33-8.79l-7.98 6.2C6.73 42.2 14.82 48 24 48z"
              />
            </g>
          </svg>
          <span>Sign in with Google</span>
        </button>
        <div className="flex justify-between mt-6 text-sm">
          <Link to="/forgot-password" className="text-ucc-blue hover:underline">
            Forgot password?
          </Link>
          <span>
            New here?{" "}
            <Link to="/signup" className="text-ucc-blue hover:underline">
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
