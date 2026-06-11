import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { metricsAPI } from "../api/client";
import { Activity, Droplets, Moon, Footprints, HeartPulse } from "lucide-react";
import clsx from "clsx";

const FIELDS = [
  {
    section: "Clinical Measurements",
    icon: <HeartPulse className="w-5 h-5" />,
    fields: [
      { name: "glucose", label: "Blood Glucose", unit: "mg/dL", required: true, min: 0, max: 500, placeholder: "e.g. 110" },
      { name: "blood_pressure", label: "Diastolic Blood Pressure", unit: "mmHg", required: false, min: 0, max: 300, placeholder: "e.g. 72" },
      { name: "insulin", label: "Insulin Level", unit: "mu U/ml", required: false, min: 0, max: 900, placeholder: "e.g. 80" },
      { name: "bmi", label: "BMI", unit: "kg/m²", required: false, min: 0, max: 100, placeholder: "e.g. 27.5" },
      { name: "skin_thickness", label: "Skin Thickness", unit: "mm", required: false, min: 0, max: 100, placeholder: "e.g. 20" },
    ]
  },
  {
    section: "Personal Details",
    icon: <Activity className="w-5 h-5" />,
    fields: [
      { name: "age", label: "Age", unit: "years", required: false, min: 1, max: 120, placeholder: "e.g. 34", isInt: true },
      { name: "pregnancies", label: "Pregnancies", unit: "count", required: false, min: 0, max: 20, placeholder: "e.g. 0", isInt: true },
      { name: "diabetes_pedigree", label: "Diabetes Pedigree Score", unit: "score", required: false, min: 0, max: 2.5, placeholder: "e.g. 0.47", step: "0.01" },
    ]
  },
  {
    section: "Lifestyle",
    icon: <Droplets className="w-5 h-5" />,
    fields: [
      { name: "water_intake_ml", label: "Water Intake", unit: "ml", required: false, min: 0, placeholder: "e.g. 2000", isInt: true },
      { name: "steps_today", label: "Steps Today", unit: "steps", required: false, min: 0, placeholder: "e.g. 8000", isInt: true },
      { name: "sleep_hours", label: "Sleep Hours", unit: "hrs", required: false, min: 0, max: 24, placeholder: "e.g. 7.5" },
    ]
  }
];

export default function LogMetrics() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value === "" ? undefined : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.glucose) {
      setError("Blood glucose is required.");
      return;
    }

    setLoading(true);
    try {
      // Parse all values to correct numeric types before sending
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => {
          const field = FIELDS.flatMap(s => s.fields).find(f => f.name === k);
          return [k, field?.isInt ? parseInt(v, 10) : parseFloat(v)];
        })
      );

      await metricsAPI.log(payload);
      setSuccess(true);

      // Brief pause so user sees success state, then redirect
      setTimeout(() => navigate("/predict"), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to log metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Log Health Metrics</h1>
          <p className="text-gray-400 mt-1">
            Enter your measurements below. Only blood glucose is required — fill in as much as you can for a more accurate prediction.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
            ✓ Metrics saved! Redirecting to prediction...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {FIELDS.map(({ section, icon, fields }) => (
            <div key={section} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-5 text-teal-400 font-semibold text-sm uppercase tracking-wider">
                {icon}
                <span>{section}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ name, label, unit, required, min, max, placeholder, step, isInt }) => (
                  <div key={name} className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">
                      {label}
                      {required && <span className="text-teal-400 ml-1">*</span>}
                      <span className="text-gray-600 ml-1">({unit})</span>
                    </label>
                    <input
                      type="number"
                      name={name}
                      min={min}
                      max={max}
                      step={step || (isInt ? "1" : "0.1")}
                      placeholder={placeholder}
                      value={form[name] ?? ""}
                      onChange={handleChange}
                      required={required}
                      className={clsx(
                        "bg-gray-800 border rounded-lg px-3 py-2 text-white text-sm",
                        "placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500",
                        "border-gray-700 hover:border-gray-600 transition"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className={clsx(
              "w-full py-3 rounded-xl font-semibold text-sm transition",
              loading || success
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-400 text-gray-950"
            )}
          >
            {loading ? "Saving..." : success ? "Saved ✓" : "Save Metrics & Continue to Prediction →"}
          </button>
        </form>
      </div>
    </div>
  );
}