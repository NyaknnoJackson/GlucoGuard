import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { metricsAPI, predictAPI } from "../api/client";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import clsx from "clsx";

export default function Analytics() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          metricsAPI.list({ days: 30, limit: 30 }),
          predictAPI.history(),
        ]);
        setMetrics(mRes.data.metrics || []);
        setPredictions(pRes.data.predictions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Format metrics for charts
  const chartData = [...metrics].reverse().map((m) => ({
    date: new Date(m.recorded_at).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
    glucose: m.glucose,
    bmi: m.bmi,
    blood_pressure: m.blood_pressure,
    sleep: m.sleep_hours,
    steps: m.steps_today,
    water: m.water_intake_ml ? Math.round(m.water_intake_ml / 100) / 10 : null,
  }));

  const predictionChartData = [...predictions].reverse().map((p) => ({
    date: new Date(p.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
    risk: Math.round(p.risk_score * 100),
    label: p.risk_label,
  }));

  if (loading) return <LoadingScreen />;

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

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full space-y-8">

        <h1 className="text-2xl font-bold">Health Analytics</h1>

        {metrics.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-400 mb-4">No metrics logged yet.</p>
            <button
              onClick={() => navigate("/log-metrics")}
              className="bg-teal-500 hover:bg-teal-400 text-gray-950 font-semibold px-5 py-2 rounded-xl text-sm transition"
            >
              Log Your First Metric
            </button>
          </div>
        ) : (
          <>
            {/* Glucose trend */}
            <ChartCard title="Blood Glucose — Last 30 Days" unit="mg/dL">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="glucose" stroke="#2dd4bf" strokeWidth={2} dot={{ fill: "#2dd4bf", r: 3 }} name="Glucose (mg/dL)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* BMI + Blood pressure */}
            <ChartCard title="BMI & Blood Pressure Trends">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
                  <Line type="monotone" dataKey="bmi" stroke="#818cf8" strokeWidth={2} dot={false} name="BMI" />
                  <Line type="monotone" dataKey="blood_pressure" stroke="#fb923c" strokeWidth={2} dot={false} name="BP (mmHg)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Lifestyle */}
            <ChartCard title="Lifestyle — Sleep & Steps">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
                  <Bar dataKey="sleep" fill="#a78bfa" name="Sleep (hrs)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="steps" fill="#34d399" name="Steps (00s)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Risk score history */}
            {predictionChartData.length > 0 && (
              <ChartCard title="Diabetes Risk Score History" unit="%">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={predictionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name, props) => [
                        `${value}% — ${props.payload.label}`,
                        "Risk Score"
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#f87171"
                      strokeWidth={2}
                      dot={{ fill: "#f87171", r: 4 }}
                      name="Risk %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChartCard({ title, unit, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        {title} {unit && <span className="text-gray-600 normal-case">({unit})</span>}
      </h2>
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <ShieldCheck className="w-10 h-10 text-teal-400 animate-pulse" />
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};