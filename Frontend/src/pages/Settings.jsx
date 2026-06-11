import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ShieldCheck, ArrowLeft, Moon, Sun } from "lucide-react";
import clsx from "clsx";

export default function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [units, setUnits] = useState("metric");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Preferences would be persisted to backend in a full implementation
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Preferences */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">

          {/* Dark mode toggle */}
          <SettingRow
            label="Dark Mode"
            description="Use dark theme across the app"
            icon={darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          >
            <Toggle value={darkMode} onChange={setDarkMode} />
          </SettingRow>

          {/* Notifications toggle */}
          <SettingRow
            label="Health Alerts"
            description="Receive risk warnings and reminders"
          >
            <Toggle value={notifications} onChange={setNotifications} />
          </SettingRow>

          {/* Units */}
          <SettingRow
            label="Measurement Units"
            description="Choose your preferred unit system"
          >
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500"
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lb, in)</option>
            </select>
          </SettingRow>

        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={clsx(
            "w-full py-3 rounded-xl font-semibold text-sm transition",
            saved
              ? "bg-green-500/20 border border-green-500/30 text-green-400"
              : "bg-teal-500 hover:bg-teal-400 text-gray-950"
          )}
        >
          {saved ? "✓ Preferences Saved" : "Save Preferences"}
        </button>

        {/* Danger zone */}
        <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
            Danger Zone
          </h2>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition"
          >
            Log Out of GlucoGuard
          </button>
        </div>

      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SettingRow({ label, description, icon, children }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        {icon && <span className="text-gray-400">{icon}</span>}
        <div>
          <p className="text-sm text-white font-medium">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange((p) => !p)}
      className={clsx(
        "w-11 h-6 rounded-full transition-colors relative",
        value ? "bg-teal-500" : "bg-gray-700"
      )}
    >
      <span className={clsx(
        "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
        value ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );
}