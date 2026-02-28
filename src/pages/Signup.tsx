import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const { signup, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Name is required");
      return;
    }
    try {
      await signup(email, password, name);
      navigate("/dashboard");
    } catch {
      setFormError("Signup failed. Please check your details.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-ucc-blue">
          Create Your Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ucc-blue"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ucc-blue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="flex justify-between mt-6 text-sm">
          <span>
            Already have an account?{" "}
            <Link to="/login" className="text-ucc-blue hover:underline">
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
