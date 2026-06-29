"use client";

import { useEffect, useState } from "react";
import { User, Save, RefreshCw, CheckCircle, Info } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [goals, setGoals] = useState("");
  const [customers, setCustomers] = useState("");
  const [pricing, setPricing] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [techStack, setTechStack] = useState("");
  const [investorNotes, setInvestorNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/startup");
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setMission(data.mission || "");
        setVision(data.vision || "");
        setGoals(data.goals || "");
        setCustomers(data.customers || "");
        setPricing(data.pricing || "");
        setCompetitors(data.competitors || "");
        setRoadmap(data.roadmap || "");
        setTechStack(data.techStack || "");
        setInvestorNotes(data.investorNotes || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/startup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mission,
          vision,
          goals,
          customers,
          pricing,
          competitors,
          roadmap,
          techStack,
          investorNotes,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs font-semibold animate-pulse flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" /> Loading startup profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <User className="w-8 h-8 text-indigo-400" /> Startup Profile
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Maintain your core startup vectors. Fill details to ground the AI Co-Founder Agents.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Grid details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Company Identity</h3>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Startup Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Company Mission</label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Company Vision</label>
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
          </div>

          {/* Strategy Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Business Strategy</h3>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Customers</label>
              <textarea
                value={customers}
                onChange={(e) => setCustomers(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pricing Model</label>
              <input
                type="text"
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Competitors</label>
              <textarea
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
          </div>

          {/* Operations Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Operations & Roadmap</h3>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Short-term Goals</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Roadmap Phases</label>
              <textarea
                value={roadmap}
                onChange={(e) => setRoadmap(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
          </div>

          {/* Architecture & Funding */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Tech Stack & Investment</h3>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tech Architecture</label>
              <textarea
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Investor Pitch Notes</label>
              <textarea
                value={investorNotes}
                onChange={(e) => setInvestorNotes(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-zinc-700 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> All fields are index searchable
          </span>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Profile saved successfully!
              </span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="glow-button px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Commit Profile Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
