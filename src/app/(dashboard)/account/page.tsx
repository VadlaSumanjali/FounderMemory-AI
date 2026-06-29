"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { User, ShieldCheck, Mail, CreditCard, Sparkles, LogOut, KeyRound, Radio } from "lucide-react";
import { useState } from "react";

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [selectedPlan, setSelectedPlan] = useState("Pro");

  const plans = [
    {
      name: "Free Solo",
      price: "$0",
      description: "Basic Hindsight memory fallback and 1 document indexing slot.",
      features: ["100 Vector queries/mo", "Fallback Hindsight local memory", "1 document limit"],
    },
    {
      name: "Founder Pro",
      price: "$29",
      description: "Standard plan for active startup building. Complete AI Co-Founder access.",
      features: ["Unlimited Vector queries", "Premium Hindsight Vector Store", "Unlimited Document parses", "AI PM task generator"],
    },
    {
      name: "VC Scale",
      price: "$99",
      description: "Built for incubators and multi-startup portfolio management.",
      features: ["Multi-workspace sharing", "Extended context windows", "Daily PDF executive brief", "Direct Slack memory sync"],
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <User className="w-8 h-8 text-indigo-400" /> Account Management
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your personal profile, workspace membership, active billing subscriptions, and Clerk sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: User Profile Info Card */}
        <div className="glass-panel rounded-2xl p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-white">Identity Details</h3>

          {!isLoaded ? (
            <div className="space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-zinc-800" />
              <div className="h-4 bg-zinc-800 rounded w-2/3" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.imageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full border-2 border-indigo-500/20 object-cover shadow-lg"
              />
              <div>
                <h4 className="font-bold text-white text-base leading-tight">
                  {user?.fullName || "Founder"}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 justify-center">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> {user?.primaryEmailAddress?.emailAddress || "Stealth Founder"}
                </p>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-full border border-indigo-500/10">
                Workspace Creator
              </span>
            </div>
          )}

          <div className="border-t border-zinc-900 pt-6 space-y-4 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-zinc-500" /> Identity Status</span>
              <span className="font-semibold text-emerald-400">Verified</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-zinc-500" /> Authentication</span>
              <span className="text-zinc-200">Clerk Auth Provider</span>
            </div>
          </div>

          <div className="pt-2">
            <SignOutButton>
              <button className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 rounded-xl font-bold text-xs transition-all border border-zinc-800 flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> End Active Session
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* RIGHT: Subscriptions & Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Workspace Tier */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-white">Active Plan Tier</h3>
                <p className="text-xs text-zinc-500">Subscription billing status</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1.5 rounded-xl font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Founder Pro Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {plans.map((p) => {
                const isSelected = selectedPlan === (p.name.includes("Pro") ? "Pro" : p.name.includes("Free") ? "Free" : "Scale");
                return (
                  <div
                    key={p.name}
                    onClick={() => setSelectedPlan(p.name.includes("Pro") ? "Pro" : p.name.includes("Free") ? "Free" : "Scale")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-48 ${
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white shadow-md shadow-indigo-500/5"
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>{p.name}</span>
                        <Radio className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-zinc-600"}`} />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2 line-clamp-3 leading-snug">{p.description}</p>
                    </div>
                    <div className="text-lg font-extrabold text-white mt-4 flex items-baseline gap-1">
                      {p.price}<span className="text-[10px] text-zinc-500 font-medium">/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing & Active Security Sessions */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-zinc-400" /> Workspace Subscriptions
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-200">Payment Method</p>
                  <p className="text-[10px] text-zinc-500">Visa ending in •••• 4242</p>
                </div>
                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-all">
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-200">Billing Cycle</p>
                  <p className="text-[10px] text-zinc-500">Next renewal on July 29, 2026 ($29.00 USD)</p>
                </div>
                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-all">
                  Invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
