import { useNavigate } from "react-router-dom";
import { ShieldCheck, Activity, Brain, ChevronRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
          <span className="text-xl font-bold tracking-tight">GlucoGuard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-400 hover:text-white transition px-4 py-2"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm bg-teal-500 hover:bg-teal-400 text-gray-950 font-semibold px-4 py-2 rounded-xl transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
          <Brain className="w-3.5 h-3.5" />
          AI-Powered Diabetes Risk Detection
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight max-w-3xl">
          Know Your Risk.{" "}
          <span className="text-teal-400">Protect Your Health.</span>
        </h1>

        <p className="text-gray-400 text-lg mt-6 max-w-xl leading-relaxed">
          GlucoGuard uses machine learning to predict your diabetes risk, track
          your health metrics, and deliver personalised lifestyle recommendations
          — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold px-8 py-3 rounded-xl transition text-sm"
          >
            Start for Free <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
          >
            I already have an account
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-8 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {[
          {
            icon: <Brain className="w-6 h-6 text-teal-400" />,
            title: "AI Risk Prediction",
            desc: "XGBoost model trained on clinical data predicts your diabetes risk with high accuracy."
          },
          {
            icon: <Activity className="w-6 h-6 text-teal-400" />,
            title: "Health Tracking",
            desc: "Log glucose, BMI, blood pressure, sleep, steps, and hydration in one dashboard."
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
            title: "Smart Recommendations",
            desc: "Receive personalised diet, exercise, and lifestyle tips based on your risk profile."
          }
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-teal-500/30 transition"
          >
            <div className="mb-3">{icon}</div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-5 text-center text-gray-600 text-xs">
        © 2026 GlucoGuard. Built with FastAPI, React, and XGBoost.
      </footer>

    </div>
  );
}