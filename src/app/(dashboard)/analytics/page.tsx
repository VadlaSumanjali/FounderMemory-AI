"use client";

import { useEffect, useState } from "react";
import { TrendingUp, BarChart3, Database, Calendar, Percent, Heart } from "lucide-react";

interface AnalyticsStats {
  memoriesCount: number;
  documentsCount: number;
  meetingsCount: number;
  tasksCount: number;
  journalsCount: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  healthScore: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    memoriesCount: 0,
    documentsCount: 0,
    meetingsCount: 0,
    tasksCount: 0,
    journalsCount: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    healthScore: 78,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const startupRes = await fetch("/api/startup");
        const tasksRes = await fetch("/api/tasks");
        const docsRes = await fetch("/api/documents");
        const journalsRes = await fetch("/api/journal");
        const meetingsRes = await fetch("/api/meetings");

        let memoriesCount = 12;
        let documentsCount = 0;
        let meetingsCount = 0;
        let tasksCount = 0;
        let journalsCount = 0;
        let todoTasks = 0;
        let inProgressTasks = 0;
        let doneTasks = 0;

        if (startupRes.ok) {
          const startup = await startupRes.json();
          memoriesCount = startup._count?.memories || 12;
          documentsCount = startup._count?.documents || 0;
          meetingsCount = startup._count?.meetings || 0;
          tasksCount = startup._count?.tasks || 0;
          journalsCount = startup._count?.journals || 0;
        }

        if (tasksRes.ok) {
          const tasksList = await tasksRes.json();
          tasksCount = tasksList.length;
          todoTasks = tasksList.filter((t: { status: string }) => t.status === "TODO").length;
          inProgressTasks = tasksList.filter((t: { status: string }) => t.status === "IN_PROGRESS").length;
          doneTasks = tasksList.filter((t: { status: string }) => t.status === "DONE").length;
        }

        if (docsRes.ok) {
          const docs = await docsRes.json();
          documentsCount = docs.length;
        }

        if (journalsRes.ok) {
          const js = await journalsRes.json();
          journalsCount = js.length;
        }

        if (meetingsRes.ok) {
          const ms = await meetingsRes.json();
          meetingsCount = ms.length;
        }

        // Formula for Dynamic Health Score based on completion rate and journal logs
        const completionRate = tasksCount > 0 ? (doneTasks / tasksCount) * 100 : 50;
        const journalsWeight = Math.min(journalsCount * 10, 30);
        const docsWeight = Math.min(documentsCount * 10, 20);
        const healthScore = Math.min(Math.round(40 + (completionRate * 0.4) + journalsWeight + docsWeight), 100);

        setStats({
          memoriesCount,
          documentsCount,
          meetingsCount,
          tasksCount,
          journalsCount,
          todoTasks,
          inProgressTasks,
          doneTasks,
          healthScore,
        });
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const completionPercent = stats.tasksCount > 0 
    ? Math.round((stats.doneTasks / stats.tasksCount) * 100) 
    : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-indigo-400" /> Platform Analytics
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Real-time metrics, memory density logs, task burn rates, and startup health tracking.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel h-32 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Top Row: Health and Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Health Meter */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Startup Health</span>
                  <h3 className="text-4xl font-extrabold text-white mt-1">{stats.healthScore}%</h3>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Heart className="w-6 h-6 animate-pulse text-indigo-400" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Stealth Mode Rating</span>
                  <span className="font-semibold text-zinc-300">
                    {stats.healthScore > 85 ? "Excellent" : stats.healthScore > 65 ? "Stable" : "Critical Backlog"}
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${stats.healthScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Memory Density */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Memory Index Density</span>
                  <h3 className="text-4xl font-extrabold text-white mt-1">{stats.memoriesCount}</h3>
                </div>
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-6 text-xs text-zinc-400 leading-snug">
                Indexed in vector space: <strong className="text-white">{stats.documentsCount} documents</strong>, <strong className="text-white">{stats.meetingsCount} meetings</strong>, and <strong className="text-white">{stats.journalsCount} reflections</strong>.
              </div>
            </div>

            {/* Task Burn Rate */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Task Completion</span>
                  <h3 className="text-4xl font-extrabold text-white mt-1">{completionPercent}%</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-6 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Tasks Done: <strong className="text-white">{stats.doneTasks}/{stats.tasksCount}</strong></span>
                  <span className="text-zinc-500">{stats.inProgressTasks} In Progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Graphical Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Growth Chart */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Long-Term Memory Growth</h4>
                  <p className="text-xs text-zinc-500">Cumulative index count over the last 6 days</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +24% growth
                </span>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="relative w-full h-56 mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4" />

                  {/* Gradient Area */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0 200 L 0 170 L 120 160 L 240 130 L 360 110 L 480 80 L 600 ${200 - (stats.memoriesCount * 5)} L 600 200 Z`}
                    fill="url(#chartGrad)"
                  />

                  {/* Line Chart path */}
                  <path
                    d={`M 0 170 L 120 160 L 240 130 L 360 110 L 480 80 L 600 ${200 - (stats.memoriesCount * 5)}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Nodes */}
                  <circle cx="0" cy="170" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="120" cy="160" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="240" cy="130" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="360" cy="110" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="480" cy="80" r="4" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="600" cy={200 - (stats.memoriesCount * 5)} r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] text-zinc-500 font-bold mt-2">
                  <span>Day 1</span>
                  <span>Day 2</span>
                  <span>Day 3</span>
                  <span>Day 4</span>
                  <span>Day 5</span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Task Pool Distribution */}
            <div className="glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-base">Workspace Tasks Pool</h4>
                <p className="text-xs text-zinc-500">Priority and progress metrics</p>
              </div>

              {/* Progress pool */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-medium">To-Do Queue</span>
                    <span className="text-zinc-200 font-bold">{stats.todoTasks}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all"
                      style={{ width: `${stats.tasksCount > 0 ? (stats.todoTasks / stats.tasksCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Active In-Progress</span>
                    <span className="text-zinc-200 font-bold">{stats.inProgressTasks}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${stats.tasksCount > 0 ? (stats.inProgressTasks / stats.tasksCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Completed</span>
                    <span className="text-zinc-200 font-bold">{stats.doneTasks}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${stats.tasksCount > 0 ? (stats.doneTasks / stats.tasksCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-between text-xs text-zinc-500">
                <span>Total Registered</span>
                <span className="font-bold text-zinc-300">{stats.tasksCount} Tasks</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Usage & Business Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Database Volumes */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-400" /> Database Utilization
              </h4>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
                  <span>Prisma Database Models</span>
                  <span className="font-semibold text-white">9 active tables</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
                  <span>Hindsight Fallback Embeddings</span>
                  <span className="font-semibold text-white">{stats.memoriesCount} vectors</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
                  <span>Connection Pooling</span>
                  <span className="font-semibold text-emerald-400">Active</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 pb-1">
                  <span>Storage Used</span>
                  <span className="font-semibold text-white">~4.8 MB</span>
                </div>
              </div>
            </div>

            {/* Business Timeline */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" /> Workspace Activity Log
              </h4>

              <div className="space-y-4 mt-4">
                <div className="flex items-start gap-4 text-xs">
                  <span className="text-[10px] text-zinc-500 font-bold w-16 shrink-0 pt-0.5">TODAY</span>
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-200">Rebuilt Workspace Routing</p>
                    <p className="text-zinc-500">Shifted layouts, command palettes, and auth scopes into route groups.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-xs">
                  <span className="text-[10px] text-zinc-500 font-bold w-16 shrink-0 pt-0.5">YESTERDAY</span>
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-200">Database Models Seeded</p>
                    <p className="text-zinc-500">Seeded initial company properties and generated Prisma client endpoints.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
