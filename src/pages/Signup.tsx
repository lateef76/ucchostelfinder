import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaInfoCircle,
} from "react-icons/fa";
import loginImage from "../assets/login-image.jpg";
import * as yup from "yup";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password,
  );
}

const signupSchema = yup.object().shape({
  name: yup.string().required("Name is required."),
  email: yup
    .string()
    .email("Enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .required("Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .matches(/[A-Z]/, "Must include an uppercase letter.")
    .matches(/[a-z]/, "Must include a lowercase letter.")
    .matches(/\d/, "Must include a number.")
    .matches(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Must include a special character.",
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match.")
    .required("Please confirm your password."),
  terms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions."),
});

const Signup: React.FC = () => {
  const { signup, loading, error, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [terms, setTerms] = useState(false);
  // role is always 'user' for signup
  const role = "user";
  const [formError, setFormError] = useState<string | null>(null);
  const [yupErrors, setYupErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setYupErrors({});
    try {
      await signupSchema.validate(
        { name, email, password, confirmPassword, terms },
        { abortEarly: false },
      );
    } catch (err) {
      if (err instanceof yup.ValidationError && err.inner) {
        const errors: { [key: string]: string } = {};
        err.inner.forEach((e) => {
          if (e.path) errors[e.path] = e.message;
        });
        setYupErrors(errors);
        return;
      }
    }
    try {
      await signup(email, password, name, role);
      navigate("/dashboard");
    } catch {
      setFormError("Signup failed. Please check your details.");
    }
  };

  // Password strength meter logic
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++;
    if (score <= 2) return "Weak";
    if (score === 3 || score === 4) return "Medium";
    if (score === 5) return "Strong";
    return "";
  };

  React.useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
  }, [password]);

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
            Create Account
          </h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            <div className="w-full">
              <label className="block text-xs font-medium mb-1">Name</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-blue-400 pointer-events-none text-base md:text-lg">
                  <FaUser />
                </span>
                <input
                  type="text"
                  className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs md:text-base ${
                    (touched.name && !name.trim()) || yupErrors.name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  required
                  autoFocus
                  placeholder="Your name"
                />
              </div>
              {/* Error message directly below the input field */}
              {(yupErrors.name || (!name.trim() && touched.name)) && (
                <div className="text-xs text-red-500 mt-1 ml-1">
                  {yupErrors.name || "Name is required."}
                </div>
              )}
            </div>
            <div className="w-full">
              <label className="block text-xs font-medium mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs ${
                    (touched.email && !validateEmail(email)) || yupErrors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </div>
              {(touched.email && !validateEmail(email)) || yupErrors.email ? (
                <div className="text-xs text-red-500 mt-1">
                  {yupErrors.email || "Enter a valid email address."}
                </div>
              ) : null}
            </div>
            <div className="w-full">
              <label className="text-xs font-medium mb-1 flex items-center gap-1">
                Password
                <button
                  type="button"
                  className="ml-1 text-blue-400 hover:text-blue-600 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPasswordInfo((v) => !v)}
                  aria-label="Show password requirements"
                >
                  <FaInfoCircle />
                </button>
              </label>
              {showPasswordInfo && (
                <div className="bg-blue-50 border border-blue-200 text-xs text-blue-700 rounded p-2 mb-2 animate-fade-in">
                  Password must be at least 8 characters and include uppercase,
                  lowercase, number, and special character.
                </div>
              )}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs ${
                    (touched.password && !validatePassword(password)) ||
                    yupErrors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
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
              {/* Password strength meter */}
              {password && (
                <div className="w-full mt-1 flex items-center gap-2">
                  <div
                    className={`flex-1 h-1 rounded ${
                      passwordStrength === "Weak"
                        ? "bg-red-400"
                        : passwordStrength === "Medium"
                          ? "bg-yellow-400"
                          : passwordStrength === "Strong"
                            ? "bg-green-500"
                            : "bg-gray-200"
                    }`}
                  ></div>
                  <span
                    className={`text-xs ${
                      passwordStrength === "Weak"
                        ? "text-red-500"
                        : passwordStrength === "Medium"
                          ? "text-yellow-600"
                          : passwordStrength === "Strong"
                            ? "text-green-600"
                            : "text-gray-400"
                    }`}
                  >
                    {passwordStrength}
                  </span>
                </div>
              )}
              {(touched.password && !validatePassword(password)) ||
              yupErrors.password ? (
                <div className="text-xs text-red-500 mt-1">
                  {yupErrors.password ||
                    "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."}
                </div>
              ) : null}
            </div>
            {/* Confirm Password */}
            <div className="w-full">
              <label className="block text-xs font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full pl-3 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs ${
                    (touched.password && confirmPassword !== password) ||
                    yupErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {(touched.password && confirmPassword !== password) ||
              yupErrors.confirmPassword ? (
                <div className="text-xs text-red-500 mt-1">
                  {yupErrors.confirmPassword || "Passwords must match."}
                </div>
              ) : null}
            </div>
            {/* Terms and Conditions */}
            <div className="w-full flex items-center gap-2 mt-2">
              <input
                id="terms"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="accent-blue-500 w-4 h-4"
              />
              <label htmlFor="terms" className="text-xs">
                I agree to the{" "}
                <a href="#" className="text-blue-500 underline">
                  terms and conditions
                </a>
              </label>
            </div>
            {yupErrors.terms && (
              <div className="text-xs text-red-500 mt-1 ml-1">
                {yupErrors.terms}
              </div>
            )}
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
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded font-semibold shadow-sm hover:bg-gray-100 transition-colors text-xs bg-white text-gray-700"
              disabled={loading}
              aria-label="Sign up with Google"
            >
              <FaGoogle className="text-lg" />
              Continue with Google
            </button>
            {/* Desktop/tablet extra fields */}
          </form>
          <div className="flex flex-col justify-between items-center mt-6 text-xs gap-2">
            <span>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
      {/* Desktop/tablet form (add Google button) */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-linear-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden mx-2 sm:mx-4 my-4 sm:my-8">
          {/* Left image for desktop */}
          <div className="hidden md:block md:w-1/2 bg-gray-100">
            <img
              src={loginImage}
              alt="Signup visual"
              className="object-cover w-full h-full min-h-100"
              loading="lazy"
            />
          </div>
          {/* Form section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-center bg-linear-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Create Account
            </h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-blue-400 pointer-events-none text-base md:text-lg">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base ${
                      (touched.name && !name.trim()) || yupErrors.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    required
                    autoFocus
                    placeholder="Your name"
                  />
                </div>
                {/* Error message directly below the input field */}
                {(yupErrors.name || (!name.trim() && touched.name)) && (
                  <div className="text-xs text-red-500 mt-1 ml-1">
                    {yupErrors.name || "Name is required."}
                  </div>
                )}
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base ${
                      (touched.email && !validateEmail(email)) ||
                      yupErrors.email
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                  />
                  {(touched.email && !validateEmail(email)) ||
                  yupErrors.email ? (
                    <div className="text-xs text-red-500 mt-1">
                      {yupErrors.email || "Enter a valid email address."}
                    </div>
                  ) : null}
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                  Password
                  <button
                    type="button"
                    className="ml-1 text-blue-400 hover:text-blue-600 focus:outline-none"
                    tabIndex={-1}
                    onClick={() => setShowPasswordInfo((v) => !v)}
                    aria-label="Show password requirements"
                  >
                    <FaInfoCircle />
                  </button>
                </label>
                {showPasswordInfo && (
                  <div className="bg-blue-50 border border-blue-200 text-xs text-blue-700 rounded p-2 mb-2 animate-fade-in">
                    Password must be at least 8 characters and include
                    uppercase, lowercase, number, and special character.
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base ${
                      (touched.password && !validatePassword(password)) ||
                      yupErrors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    required
                    autoComplete="new-password"
                    placeholder="Create a password"
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
                {/* Password strength meter */}
                {password && (
                  <div className="w-full mt-1 flex items-center gap-2">
                    <div
                      className={`flex-1 h-1 rounded ${
                        passwordStrength === "Weak"
                          ? "bg-red-400"
                          : passwordStrength === "Medium"
                            ? "bg-yellow-400"
                            : passwordStrength === "Strong"
                              ? "bg-green-500"
                              : "bg-gray-200"
                      }`}
                    ></div>
                    <span
                      className={`text-xs ${
                        passwordStrength === "Weak"
                          ? "text-red-500"
                          : passwordStrength === "Medium"
                            ? "text-yellow-600"
                            : passwordStrength === "Strong"
                              ? "text-green-600"
                              : "text-gray-400"
                      }`}
                    >
                      {passwordStrength}
                    </span>
                  </div>
                )}
                {(touched.password && !validatePassword(password)) ||
                yupErrors.password ? (
                  <div className="text-xs text-red-500 mt-1">
                    {yupErrors.password ||
                      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."}
                  </div>
                ) : null}
              </div>
              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full pl-3 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base ${
                      (touched.password && confirmPassword !== password) ||
                      yupErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {(touched.password && confirmPassword !== password) ||
                yupErrors.confirmPassword ? (
                  <div className="text-xs text-red-500 mt-1">
                    {yupErrors.confirmPassword || "Passwords must match."}
                  </div>
                ) : null}
              </div>
              {/* Terms and Conditions */}
              <div className="w-full flex items-center gap-2 mt-2">
                <input
                  id="terms-desktop"
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="accent-blue-500 w-4 h-4"
                />
                <label htmlFor="terms-desktop" className="text-xs">
                  I agree to the{" "}
                  <a href="#" className="text-blue-500 underline">
                    terms and conditions
                  </a>
                </label>
              </div>
              {yupErrors.terms && (
                <div className="text-xs text-red-500 mt-1 ml-1">
                  {yupErrors.terms}
                </div>
              )}
              {(formError || error) && (
                <div className="text-red-600 text-xs sm:text-sm text-center">
                  {formError || error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-500 to-pink-500 text-white py-2 rounded font-semibold shadow hover:from-blue-600 hover:to-pink-600 transition-colors disabled:opacity-60 text-base mb-2"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded font-semibold shadow-sm hover:bg-gray-100 transition-colors text-base bg-white text-gray-700"
                disabled={loading}
                aria-label="Sign up with Google"
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>
            </form>
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-xs sm:text-sm gap-2">
              <span>
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Sign In
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
