import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../api/client";
import { useAuthStore } from "../store/authStore";
import {
  ShieldCheck, Activity, Droplets, Moon,
  Footprints, ChevronRight, LogOut, AlertTriangle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import clsx from "clsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardAPI.get();
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        } else {
          setError("Failed to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  const { user, health_snapshot, glucose_trend, latest_prediction,
    recommendations, stats } = data;

  const riskColor = {
    Low: "text-green-400",
    Moderate: "text-yellow-400",
    High: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span className="font-bold tracking-tight">GlucoGuard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Hi, <span className="text-white font-medium">{user.full_name.split(" ")[0]}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full space-y-8">

        {/* Health score + risk */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Health Score"
            value={`${stats.health_score}/100`}
            sub="Overall wellness"
            color={
              stats.health_score >= 70 ? "text-green-400"
              : stats.health_score >= 40 ? "text-yellow-400"
              : "text-red-400"
            }
          />
          <StatCard
            label="Avg Glucose (7d)"
            value={stats.avg_glucose_7d ? `${stats.avg_glucose_7d} mg/dL` : "—"}
            sub="7-day average"
            color="text-teal-400"
          />
          <StatCard
            label="Avg Steps (7d)"
            value={stats.avg_steps_7d ? stats.avg_steps_7d.toLocaleString() : "—"}
            sub="Daily average"
            color="text-blue-400"
          />
        </div>

        {/* Risk prediction banner */}
        {latest_prediction ? (
          <div className={clsx(
            "rounded-2xl border p-5 flex items-center justify-between",
            latest_prediction.risk_label === "High"
              ? "bg-red-500/10 border-red-500/30"
              : latest_prediction.risk_label === "Moderate"
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-green-500/10 border-green-500/30"
          )}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={clsx("w-5 h-5", riskColor[latest_prediction.risk_label])} />
              <div>
                <p className="text-sm text-gray-400">Latest Prediction</p>
                <p className={clsx("text-xl font-bold", riskColor[latest_prediction.risk_label])}>
                  {latest_prediction.risk_label} Risk — {latest_prediction.risk_percentage}%
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/predict")}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition"
            >
              Run again <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 flex items-center justify-between">
            <p className="text-gray-400 text-sm">No prediction run yet</p>
            <button
              onClick={() => navigate("/log-metrics")}
              className="text-sm bg-teal-500 hover:bg-teal-400 text-gray-950 font-semibold px-4 py-2 rounded-xl transition"
            >
              Run First Prediction →
            </button>
          </div>
        )}

        {/* Glucose trend chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
            Glucose Trend — Last 7 Days
          </h2>
          {glucose_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={glucose_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="glucose"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  dot={{ fill: "#2dd4bf", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
              No glucose data yet —{" "}
              <button
                onClick={() => navigate("/log-metrics")}
                className="text-teal-400 ml-1 hover:underline"
              >
                log your first metric
              </button>
            </div>
          )}
        </div>

        {/* Health snapshot + recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Latest snapshot */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Latest Snapshot
              </h2>
              <button
                onClick={() => navigate("/log-metrics")}
                className="text-teal-400 text-xs hover:text-teal-300 transition flex items-center gap-1"
              >
                Update <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {health_snapshot ? (
              <div className="space-y-3">
                <SnapshotRow icon={<Activity className="w-4 h-4 text-teal-400" />} label="Glucose" value={health_snapshot.glucose} unit="mg/dL" />
                <SnapshotRow icon={<Activity className="w-4 h-4 text-blue-400" />} label="BMI" value={health_snapshot.bmi} unit="kg/m²" />
                <SnapshotRow icon={<Activity className="w-4 h-4 text-purple-400" />} label="Blood Pressure" value={health_snapshot.blood_pressure} unit="mmHg" />
                <SnapshotRow icon={<Droplets className="w-4 h-4 text-cyan-400" />} label="Water Intake" value={health_snapshot.water_intake_ml} unit="ml" />
                <SnapshotRow icon={<Moon className="w-4 h-4 text-indigo-400" />} label="Sleep" value={health_snapshot.sleep_hours} unit="hrs" />
                <SnapshotRow icon={<Footprints className="w-4 h-4 text-green-400" />} label="Steps" value={health_snapshot.steps_today} unit="steps" />
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No metrics logged yet.</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Recommendations
              </h2>
              {recommendations.length > 0 && (
                <span className="bg-teal-500 text-gray-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {recommendations.filter(r => !r.is_read).length} new
                </span>
              )}
            </div>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-gray-800 rounded-xl px-4 py-3 text-sm"
                  >
                    <p className="text-xs text-teal-400 uppercase font-semibold mb-1">
                      {rec.category}
                    </p>
                    <p className="text-white font-medium">{rec.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Run a prediction to get personalised recommendations.
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Log Metrics", path: "/log-metrics", color: "bg-teal-500 hover:bg-teal-400 text-gray-950" },
            { label: "Run Prediction", path: "/predict", color: "bg-blue-500 hover:bg-blue-400 text-white" },
            { label: "Analytics", path: "/analytics", color: "bg-gray-800 hover:bg-gray-700 text-white" },
            { label: "Settings", path: "/settings", color: "bg-gray-800 hover:bg-gray-700 text-white" },
          ].map(({ label, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={clsx("py-3 rounded-xl text-sm font-semibold transition", color)}
            >
              {label}
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={clsx("text-2xl font-bold", color)}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{sub}</p>
    </div>
  );
}

function SnapshotRow({ icon, label, value, unit }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        {icon}
        {label}
      </div>
      <span className="text-white text-sm font-medium">
        {value != null ? `${value} ${unit}` : <span className="text-gray-600">—</span>}
      </span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <ShieldCheck className="w-10 h-10 text-teal-400 mx-auto mb-3 animate-pulse" />
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-sm">{message}</p>
      </div>
    </div>
  );
}