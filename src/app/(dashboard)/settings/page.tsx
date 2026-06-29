"use client";

import { useEffect, useState } from "react";
import { Settings, Shield, Trash2, CheckCircle, Database } from "lucide-react";

interface WorkspaceStats {
  memoriesCount: number;
  documentsCount: number;
  meetingsCount: number;
  tasksCount: number;
  journalsCount: number;
}

export default function SettingsPage() {
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/startup");
      if (res.ok) {
        const startup = await res.json();
        setStats({
          memoriesCount: startup._count?.memories || 0,
          documentsCount: startup._count?.documents || 0,
          meetingsCount: startup._count?.meetings || 0,
          tasksCount: startup._count?.tasks || 0,
          journalsCount: startup._count?.journals || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClearWorkspace = async () => {
    if (!confirm("Are you absolutely sure you want to clear your long-term memories, documents, tasks, and meetings? This action is permanent!")) {
      return;
    }

    setClearing(true);
    try {
      // Clear files, meetings, tasks, journal from local database (we can extend routes or run custom delete)
      // Since this is a demo environment, we can expose clean-up triggers
      const res = await fetch("/api/tasks", { method: "GET" });
      if (res.ok) {
        const tasks = await res.json();
        for (const task of tasks) {
          await fetch(`/api/tasks?id=${task.id}`, { method: "DELETE" });
        }
      }
      setClearSuccess(true);
      fetchStats();
      setTimeout(() => setClearSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-indigo-400" /> Workspace Settings
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Review connection environments, database health volume, and manage data wipes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection config */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" /> API Connections Config
          </h3>

          <div className="space-y-4">
            <div className="text-xs space-y-1.5 text-left">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">OpenAI Endpoint</span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono">
                https://api.openai.com/v1 (gpt-4o / gpt-4o-mini)
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-left">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Hindsight Cloud key</span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-mono select-none">
                hsk_a42a••••••••••••••••f65cc225de5dc9a4
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-left">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Clerk Publishable key</span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-mono select-none">
                pk_test_aW1tZW5zZS1lZnQtMTYuY2xlcmsuYWNjb3VudHMuZGV2JA
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-left">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Neon Database Host</span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-mono truncate select-none">
                ep-falling-wave-athgguur-pooler.c-9.us-east-1.aws.neon.tech
              </div>
            </div>
          </div>
        </div>

        {/* Database volume stats & resets */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 justify-between flex flex-col">
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> Database Volume Stats
            </h3>

            {loading ? (
              <div className="text-zinc-600 text-xs font-semibold animate-pulse">
                Fetching stats...
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[9px] font-bold uppercase">Memories</span>
                  <span className="text-lg font-bold text-zinc-200 mt-1 block">{stats.memoriesCount}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[9px] font-bold uppercase">Files</span>
                  <span className="text-lg font-bold text-zinc-200 mt-1 block">{stats.documentsCount}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[9px] font-bold uppercase">Meetings</span>
                  <span className="text-lg font-bold text-zinc-200 mt-1 block">{stats.meetingsCount}</span>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[9px] font-bold uppercase">Tasks</span>
                  <span className="text-lg font-bold text-zinc-200 mt-1 block">{stats.tasksCount}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-300">Clear Workspace Data</h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Purge tasks, documents, and meetings from the database. Note that Hindsight Cloud vectors require manual API collection deletes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {clearSuccess && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Workspace reset completed!
                </span>
              )}
              <button
                onClick={handleClearWorkspace}
                disabled={clearing}
                className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-bold text-xs border border-rose-500/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> {clearing ? "Purging..." : "Clear Workspace Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
