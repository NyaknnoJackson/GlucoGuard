import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import clsx from "clsx";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      // Registration successful — send to login
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div
        className="flex items-center gap-2 mb-8 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <ShieldCheck className="w-6 h-6 text-teal-400" />
        <span className="text-xl font-bold tracking-tight">GlucoGuard</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-gray-400 text-sm mb-6">
          Start monitoring your health with GlucoGuard
        </p>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Full Name</label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="e.g. Jackson Nyaknno"
              value={form.full_name}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              required
              placeholder="Re-enter your password"
              value={form.confirm_password}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 transition"
            />
          </div>

          {/* Password match indicator */}
          {form.confirm_password && (
            <p className={clsx(
              "text-xs",
              form.password === form.confirm_password
                ? "text-green-400"
                : "text-red-400"
            )}>
              {form.password === form.confirm_password
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full py-2.5 rounded-xl font-semibold text-sm transition mt-2",
              loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-400 text-gray-950"
            )}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 transition">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}