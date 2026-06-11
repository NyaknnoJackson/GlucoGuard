import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { metricsAPI, predictAPI } from "../api/client";
import { ShieldCheck, ArrowLeft, User } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          metricsAPI.list({ limit: 1 }),
          predictAPI.history(),
        ]);
        setStats({
          totalMetrics: mRes.data.total,
          totalPredictions: pRes.data.total || pRes.data.predictions?.length || 0,
          latestPrediction: pRes.data.predictions?.[0] || null,
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span className="font-bold tracking-tight">GlucoGuard</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
      </nav>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full space-y-6">

        <h1 className="text-2xl font-bold">My Profile</h1>

        {/* Avatar + name */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <User className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <p className="text-lg font-bold">GlucoGuard User</p>
            <p className="text-gray-400 text-sm">Health monitoring since 2026</p>
          </div>
        </div>

        {/* Usage stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Metrics Logged", value: stats?.totalMetrics ?? "—" },
            { label: "Predictions Run", value: stats?.totalPredictions ?? "—" },
            {
              label: "Latest Risk",
              value: stats?.latestPrediction
                ? `${stats.latestPrediction.risk_label}`
                : "—",
              color: {
                Low: "text-green-400",
                Moderate: "text-yellow-400",
                High: "text-red-400",
              }[stats?.latestPrediction?.risk_label] || "text-white"
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${color || "text-white"}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {[
            { label: "Log Health Metrics", path: "/log-metrics" },
            { label: "Run Prediction", path: "/predict" },
            { label: "View Analytics", path: "/analytics" },
            { label: "Settings", path: "/settings" },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full text-left px-5 py-4 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition flex items-center justify-between"
            >
              {label}
              <ArrowLeft className="w-4 h-4 rotate-180 text-gray-600" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition"
        >
          Log Out
        </button>

      </main>
    </div>
  );
}