"use client";

import { useEffect, useState } from "react";
import { KanbanSquare, Check, Sparkles, Trash2 } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  deadline: string | null;
  aiSuggestions: string | null;
}

interface SuggestedTask {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  aiSuggestions: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAISuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestedTasks([]);
    try {
      const res = await fetch("/api/tasks?suggest=true", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSuggestedTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAcceptSuggestion = async (suggested: SuggestedTask) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggested.title,
          description: suggested.description,
          priority: suggested.priority,
          status: "TODO",
        }),
      });

      if (res.ok) {
        // Remove from recommendations list
        setSuggestedTasks((prev) => prev.filter((t) => t.title !== suggested.title));
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === "HIGH") return "bg-rose-500/10 border-rose-500/20 text-rose-400";
    if (p === "MEDIUM") return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <KanbanSquare className="w-8 h-8 text-indigo-400" /> Kanban Task Board
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Organize startup objectives. Trigger AI Recommendations based on chat alignments.
          </p>
        </div>

        <button
          onClick={fetchAISuggestions}
          disabled={loadingSuggestions}
          className="glow-button px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {loadingSuggestions ? "Consulting PM Agent..." : "AI Suggestions"}
        </button>
      </div>

      {/* Suggestion banner if suggestions exist */}
      {suggestedTasks.length > 0 && (
        <div className="glass-panel border-indigo-500/20 bg-indigo-950/5 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Suggested by PM Agent
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedTasks.map((sug, idx) => (
              <div key={idx} className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${getPriorityColor(sug.priority)}`}>
                    {sug.priority}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-200 mt-2 leading-snug">{sug.title}</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{sug.description}</p>
                  <p className="text-[9px] text-indigo-400 italic font-semibold">{sug.aiSuggestions}</p>
                </div>

                <button
                  onClick={() => handleAcceptSuggestion(sug)}
                  className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 rounded-lg text-[10px] font-bold border border-indigo-500/10 transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Accept Task
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Swimlanes and Task creator */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Task Creator */}
        <div className="glass-panel rounded-2xl p-6 h-fit space-y-4">
          <h3 className="font-bold text-sm text-white">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-zinc-700 outline-none"
            />
            <textarea
              placeholder="Description (optional)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-zinc-700 outline-none resize-none"
            />
            <div className="flex gap-2">
              {["LOW", "MEDIUM", "HIGH"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p as "LOW" | "MEDIUM" | "HIGH")}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-colors ${
                    priority === p
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-400"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Swimlanes */}
        {["TODO", "IN_PROGRESS", "DONE"].map((lane) => {
          const laneTasks = tasks.filter((t) => t.status === lane);
          const laneTitle = lane === "TODO" ? "To Do" : lane === "IN_PROGRESS" ? "In Progress" : "Completed";

          return (
            <div key={lane} className="glass-panel rounded-2xl p-4 space-y-4 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-zinc-300">{laneTitle}</span>
                <span className="text-[10px] font-bold bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                  {laneTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {laneTasks.map((t) => (
                  <div
                    key={t.id}
                    className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 flex flex-col gap-3 group relative"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-bold border px-1.5 py-0.2 rounded-full ${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200 mt-2 leading-snug">{t.title}</h4>
                      {t.description && (
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{t.description}</p>
                      )}
                      {t.aiSuggestions && (
                        <span className="text-[8px] font-bold text-indigo-400 block italic leading-snug">
                          {t.aiSuggestions}
                        </span>
                      )}
                    </div>

                    {/* Status update triggers */}
                    <div className="flex gap-1.5 mt-2 border-t border-white/5 pt-2">
                      {lane !== "TODO" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "TODO")}
                          className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          Todo
                        </button>
                      )}
                      {lane !== "IN_PROGRESS" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "IN_PROGRESS")}
                          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          In Progress
                        </button>
                      )}
                      {lane !== "DONE" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "DONE")}
                          className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5"
                        >
                          Complete <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
