import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Brain, ArrowRight, Activity, Network, ShieldCheck, Database, Calendar } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  const features = [
    {
      title: "Permanent Organizational Memory",
      desc: "Unlike normal assistants that wipe history, FounderMemory extracts and links company decisions, tech stacks, and investor notes forever using Hindsight.",
      icon: Brain,
    },
    {
      title: "Multi-Agent Executive Suite",
      desc: "Instantly route questions to specialized AI executives: CEO for strategy, CTO for systems, PM for user stories, or CFO for runway calculations.",
      icon: Activity,
    },
    {
      title: "Interactive Knowledge Graph",
      desc: "Watch your business relationships grow. Visually trace connections between founders, decisions, tasks, documents, and competitors.",
      icon: Network,
    },
    {
      title: "Secure Document Indexing",
      desc: "Drop PDF, Word, or Markdown files directly. The Brain parses, chunks, and semantically recalls context inside chat streams when relevant.",
      icon: Database,
    },
    {
      title: "Meeting Summary & Actions",
      desc: "Upload transcripts to automatically compile summary reports, output action checklists, and schedule Kanban board items.",
      icon: Calendar,
    },
    {
      title: "Enterprise Grade Security",
      desc: "Fully isolated workspace banks, environment validation, sanitized inputs, and Clerk-protected route middleware protect your IP.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      {/* Mesh Gradient background */}
      <div className="mesh-gradient-bg" />

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-white tracking-tight">FounderMemory AI</span>
          </div>

          <div className="flex items-center gap-4">
            {userId ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-bold bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                Go to Command Center <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="glow-button px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-semibold text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          The AI Co-Founder That Never Forgets
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] text-white">
          A Permanent Brain for <br />
          <span className="text-glow-gradient">Your Startup Workspace</span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-medium">
          FounderMemory AI learns from your conversations, documents, meetings, and daily logs, building long-term organizational memory that grows with your team.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          {userId ? (
            <Link
              href="/dashboard"
              className="glow-button px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/30 text-white flex items-center gap-3 transition-all"
            >
              Open Active Workspace <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="glow-button px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/30 text-white flex items-center gap-3 transition-all"
              >
                Get Started for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-in"
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-sm border border-white/5 text-zinc-300 hover:text-white transition-all"
              >
                Log in to Workspace
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <h2 className="text-2xl sm:text-4xl font-bold text-center tracking-tight text-white mb-16">
          Everything Revolves Around <br />
          <span className="text-glow-gradient">A Persistent Business Brain</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-card rounded-2xl p-6 flex flex-col gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-lg text-zinc-100">{feat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 text-center">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-zinc-400 mb-16 max-w-md mx-auto text-sm font-medium">
          Scale your memory workspace as your startup grows from initial seed idea to series funding.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8 text-left">
          {/* Free Tier */}
          <div className="glass-card rounded-2xl p-8 flex flex-col gap-6 relative">
            <div>
              <h3 className="font-bold text-lg text-zinc-200">Stealth Tier</h3>
              <p className="text-xs text-zinc-500 mt-1">Perfect for solo founders starting out.</p>
            </div>
            <div className="text-4xl font-extrabold text-white">
              $0 <span className="text-sm font-medium text-zinc-500">/ forever</span>
            </div>
            <ul className="text-xs text-zinc-400 flex flex-col gap-2.5 font-medium border-t border-white/5 pt-4">
              <li>• 1 Startup Workspace profile</li>
              <li>• Standard Hindsight vector bank</li>
              <li>• Standard CEO/CTO Agent tools</li>
              <li>• Up to 20 document parses</li>
              <li>• 10 meeting summaries</li>
            </ul>
            <Link
              href="/sign-up"
              className="mt-auto py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs text-center border border-white/5 text-zinc-200 hover:text-white transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Paid Tier */}
          <div className="glass-card rounded-2xl p-8 flex flex-col gap-6 relative border-indigo-500/20 bg-indigo-950/5">
            <div className="absolute -top-3 right-4 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-400 shadow-md">
              Most Popular
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-200">Scale Stage</h3>
              <p className="text-xs text-zinc-500 mt-1">For teams scaling operations and fundraising.</p>
            </div>
            <div className="text-4xl font-extrabold text-white">
              $29 <span className="text-sm font-medium text-zinc-500">/ month</span>
            </div>
            <ul className="text-xs text-zinc-400 flex flex-col gap-2.5 font-medium border-t border-white/5 pt-4">
              <li>• Unlimited Startup Workspaces</li>
              <li>• Highly prioritized Hindsight indexing</li>
              <li>• Custom SWOT, BMC, PRD models</li>
              <li>• Unlimited Document & Meeting uploads</li>
              <li>• Direct export of summaries to investor portals</li>
            </ul>
            <Link
              href="/sign-up"
              className="glow-button mt-auto py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-center text-white transition-all"
            >
              Unlock Scale Stage
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-zinc-500 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="text-zinc-300 font-bold">FounderMemory AI</span>
          </div>
          <p>© {new Date().getFullYear()} FounderMemory AI. Built for the modern startup builder.</p>
          <div className="flex gap-4">
            <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
