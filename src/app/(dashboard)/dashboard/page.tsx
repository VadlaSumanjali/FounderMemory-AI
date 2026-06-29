import Link from "next/link";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import {
  Brain,
  CheckCircle,
  FileText,
  Video,
  ChevronRight,
  TrendingUp,
  Heart,
  Plus,
} from "lucide-react";

export const revalidate = 0; // Disable caching to fetch live data

export default async function DashboardPage() {
  const { startupId } = await getOrCreateUserContext();

  // Fetch all stats directly in server component
  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      tasks: true,
      documents: { orderBy: { createdAt: "desc" }, take: 3 },
      meetings: { orderBy: { date: "desc" }, take: 3 },
      journals: { orderBy: { date: "desc" }, take: 3 },
      memories: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!startup) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Error loading workspace</h2>
        <p className="text-zinc-500 mt-2">Could not locate startup profile records.</p>
      </div>
    );
  }

  // Calculate Startup Health Score
  const profileFields = [
    startup.mission,
    startup.vision,
    startup.goals,
    startup.customers,
    startup.pricing,
    startup.competitors,
    startup.roadmap,
    startup.techStack,
  ];
  const filledProfileFields = profileFields.filter(Boolean).length;
  const profileCompletionScore = (filledProfileFields / profileFields.length) * 100;

  const totalTasks = startup.tasks.length;
  const completedTasks = startup.tasks.filter(t => t.status === "DONE").length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const healthScore = Math.round(
    profileCompletionScore * 0.4 +
    taskCompletionRate * 0.4 +
    Math.min(100, startup.documents.length * 10) * 0.1 +
    Math.min(100, startup.journals.length * 15) * 0.1
  );

  const decisions = startup.memories.filter(m => m.category === "Decision").slice(0, 4);

  return (
    <div className="space-y-8 pb-10">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Startup Command Center
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Running diagnostics for **{startup.name}** • {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/chat"
            className="glow-button px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Ask Co-Founder
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Startup Health Score */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Health Score</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{healthScore}%</span>
            <span className="text-xs font-semibold text-zinc-500">Optimal</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                healthScore > 75 ? "bg-emerald-500" : healthScore > 40 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Memory Growth */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Durable Memories</span>
            <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{startup.memories.length}</span>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +100% active
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">Permanently synced to Hindsight.</p>
        </div>

        {/* Tasks Completion */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tasks Done</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">
              {completedTasks}/{totalTasks}
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              {Math.round(taskCompletionRate)}% rate
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Documents Indexed */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Indexed Documents</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{startup.documents.length}</span>
            <span className="text-xs font-semibold text-zinc-500">Files parsed</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">PDF, DOCX, TXT fully chunks search ready.</p>
        </div>
      </div>

      {/* Main Grid: Decisions & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Decisions Timeline */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="font-bold text-lg text-white">Recent Product Decisions</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Timeline of key strategic alignments and pivots.</p>
            </div>
            <Link
              href="/dashboard/explorer"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Explore Graph <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {decisions.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              No decisions extracted yet. Chat with your AI Co-Founder to establish workspace alignments.
            </div>
          ) : (
            <div className="relative pl-6 border-l border-zinc-800 space-y-8">
              {decisions.map((dec) => (
                <div key={dec.id} className="relative">
                  {/* Timeline point */}
                  <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-500 bg-zinc-950 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  </span>

                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block mb-1">
                      {new Date(dec.createdAt).toLocaleDateString()}
                    </span>
                    <p className="text-sm font-semibold text-zinc-200 leading-relaxed">{dec.content}</p>
                    <div className="flex gap-2 mt-2">
                      {dec.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Strategic Suggestions & Actionables */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="font-bold text-lg text-white">AI Strategy Checklist</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Automated recommendations from CEO Agent.</p>
            </div>
          </div>

          <div className="space-y-4">
            {profileCompletionScore < 100 && (
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex gap-3 text-left">
                <Brain className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Fill Startup profile</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    Your profile completion is at {Math.round(profileCompletionScore)}%. Define customers, pricing, and competitors to give specialized agents hyper-contextual reasoning.
                  </p>
                  <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 mt-2.5">
                    Update Profile <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {totalTasks === 0 ? (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Bootstrap task management</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    Setup initial Todo items on your Kanban board to let the PM agent calculate velocity.
                  </p>
                  <Link href="/dashboard/tasks" className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-300 mt-2.5">
                    Open Kanban <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Review Board</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    You have {totalTasks - completedTasks} active tasks. Use the PM &quot;AI Suggest&quot; button to extract decisions directly into your sprint backlog.
                  </p>
                  <Link href="/dashboard/tasks" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 mt-2.5">
                    Open Kanban <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {startup.documents.length === 0 && (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex gap-3 text-left">
                <FileText className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Index business documents</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    Index technical architecture docs, pitch decks, or market reports. The AI Co-Founder recalls them dynamically during chat.
                  </p>
                  <Link href="/dashboard/documents" className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-300 mt-2.5">
                    Index Files <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row: Recent documents, meetings, journals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Files */}
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Recent Documents</h4>
            <Link href="/dashboard/documents" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          <div className="space-y-2">
            {startup.documents.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4 text-center">No documents uploaded.</p>
            ) : (
              startup.documents.map(d => (
                <div key={d.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-zinc-300 truncate font-semibold">{d.name}</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    .{d.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Meetings Summarized</h4>
            <Link href="/dashboard/meetings" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          <div className="space-y-2">
            {startup.meetings.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4 text-center">No meeting transcripts.</p>
            ) : (
              startup.meetings.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 truncate">
                    <Video className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-zinc-300 truncate font-semibold">{m.title}</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold">
                    {m.date.toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Journals */}
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Recent Journal Logs</h4>
            <Link href="/dashboard/journal" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          <div className="space-y-2">
            {startup.journals.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4 text-center">No reflection entries.</p>
            ) : (
              startup.journals.map(j => (
                <div key={j.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-zinc-300 truncate font-semibold">{j.title}</span>
                  <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
                    {j.mood || "Neutral"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
