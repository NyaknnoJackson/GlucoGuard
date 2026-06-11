import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { predictAPI, metricsAPI } from "../api/client";
import { ShieldAlert, ShieldCheck, ShieldMinus, RefreshCw, ChevronRight } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import clsx from "clsx";

const RISK_CONFIG = {
  Low: {
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    gauge: "#4ade80",
    icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
    message: "Your risk profile looks healthy. Keep maintaining your current lifestyle habits."
  },
  Moderate: {
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    gauge: "#facc15",
    icon: <ShieldMinus className="w-8 h-8 text-yellow-400" />,
    message: "You have moderate risk factors. Small lifestyle changes now can significantly reduce your risk."
  },
  High: {
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    gauge: "#f87171",
    icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
    message: "Your risk level is high. We strongly recommend consulting a healthcare professional soon."
  }
};

export default function Prediction() {
  const navigate = useNavigate();
  const [latestMetric, setLatestMetric] = useState(null);
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMetric, setFetchingMetric] = useState(true);
  const [error, setError] = useState(null);

  // Load the user's latest logged metric on mount
  useEffect(() => {
    const loadLatest = async () => {
      try {
        const { data } = await metricsAPI.list({ limit: 1 });
        if (data.metrics?.length > 0) {
          setLatestMetric(data.metrics[0]);
        }
      } catch {
        // No metrics logged yet — handled in UI
      } finally {
        setFetchingMetric(false);
      }
    };
    loadLatest();
  }, []);

  const runPrediction = async () => {
    if (!latestMetric) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRecommendations([]);

    try {
      const payload = {
        glucose: latestMetric.glucose,
        bmi: latestMetric.bmi ?? 32.0,
        age: latestMetric.age ?? 29,
        blood_pressure: latestMetric.blood_pressure ?? 72.0,
        insulin: latestMetric.insulin ?? 30.5,
        pregnancies: latestMetric.pregnancies ?? 0,
        diabetes_pedigree: latestMetric.diabetes_pedigree ?? 0.37,
        skin_thickness: latestMetric.skin_thickness ?? 23.0,
      };

      const { data } = await predictAPI.run(payload);
      setResult(data);

      // Load the auto-generated recommendations that were created server-side
const recRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/recommendations/?limit=5`, {
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});
const recData = await recRes.json();
setRecommendations(recData.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Gauge chart data — recharts RadialBarChart expects value 0–100
  const gaugeData = result
    ? [{ value: result.risk_percentage, fill: RISK_CONFIG[result.risk_label]?.gauge }]
    : [{ value: 0, fill: "#374151" }];

  const risk = result ? RISK_CONFIG[result.risk_label] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Diabetes Risk Prediction</h1>
          <p className="text-gray-400 mt-1">
            Uses your latest logged metrics and an XGBoost model trained on the Pima Indians Diabetes dataset.
          </p>
        </div>

        {/* Latest metric snapshot */}
        {fetchingMetric ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse h-32" />
        ) : latestMetric ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Using Latest Metrics
              </h2>
              <button
                onClick={() => navigate("/log-metrics")}
                className="text-teal-400 text-sm flex items-center gap-1 hover:text-teal-300 transition"
              >
                Update <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricPill label="Glucose" value={latestMetric.glucose} unit="mg/dL" />
              <MetricPill label="BMI" value={latestMetric.bmi} unit="kg/m²" />
              <MetricPill label="BP" value={latestMetric.blood_pressure} unit="mmHg" />
              <MetricPill label="Age" value={latestMetric.age} unit="yrs" />
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6 text-center">
            <p className="text-yellow-400 font-medium mb-3">No metrics logged yet</p>
            <p className="text-gray-400 text-sm mb-4">You need to log at least one health metric before running a prediction.</p>
            <button
              onClick={() => navigate("/log-metrics")}
              className="bg-teal-500 hover:bg-teal-400 text-gray-950 font-semibold px-5 py-2 rounded-xl text-sm transition"
            >
              Log Metrics First →
            </button>
          </div>
        )}

        {/* Run prediction button */}
        {latestMetric && !result && (
          <button
            onClick={runPrediction}
            disabled={loading}
            className={clsx(
              "w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2",
              loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-400 text-gray-950"
            )}
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analysing...</>
            ) : (
              "Run Prediction"
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Result card */}
        {result && risk && (
          <div className={clsx("border rounded-2xl p-6", risk.border, risk.bg)}>

            {/* Risk gauge */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%" cy="50%"
                    innerRadius="70%" outerRadius="100%"
                    startAngle={90} endAngle={-270}
                    data={gaugeData}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#1f2937" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center -mt-4">
                {risk.icon}
                <p className={clsx("text-4xl font-bold mt-1", risk.color)}>
                  {result.risk_percentage}%
                </p>
                <p className={clsx("text-lg font-semibold mt-1", risk.color)}>
                  {result.risk_label} Risk
                </p>
                <p className="text-gray-400 text-sm mt-2 max-w-xs text-center">
                  {risk.message}
                </p>
              </div>
            </div>

            {/* Run again */}
            <button
              onClick={runPrediction}
              disabled={loading}
              className="w-full py-2 rounded-xl text-sm font-medium border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Run Again with Updated Metrics
            </button>
          </div>
        )}

        {/* Auto-generated recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Personalised Recommendations
            </h2>
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricPill({ label, value, unit }) {
  return (
    <div className="bg-gray-800 rounded-xl px-3 py-2 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">
        {value != null ? `${value} ${unit}` : <span className="text-gray-600">—</span>}
      </p>
    </div>
  );
}

const CATEGORY_COLORS = {
  diet: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  exercise: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  sleep: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  hydration: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  alert: "text-red-400 bg-red-500/10 border-red-500/20",
};

function RecommendationCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = CATEGORY_COLORS[rec.category] || "text-gray-400 bg-gray-800 border-gray-700";

  return (
    <div
      className={clsx("border rounded-xl p-4 cursor-pointer transition hover:brightness-110", colorClass)}
      onClick={() => setExpanded((p) => !p)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            {rec.category}
          </span>
          <span className="font-semibold text-sm text-white">{rec.title}</span>
        </div>
        <ChevronRight className={clsx("w-4 h-4 transition-transform", expanded && "rotate-90")} />
      </div>
      {expanded && (
        <p className="mt-3 text-sm text-gray-300 leading-relaxed">{rec.body}</p>
      )}
    </div>
  );
}