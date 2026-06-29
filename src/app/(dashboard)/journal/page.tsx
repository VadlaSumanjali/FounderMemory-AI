"use client";

import { useEffect, useState } from "react";
import { BookOpen, Calendar, Plus, Clock, Smile } from "lucide-react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string | null;
  milestones: string | null;
  lessons: string | null;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchJournal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJournal();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        fetchJournal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-indigo-400" /> Daily Reflections Journal
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Record reflections, mood, lessons learned, and milestones. The AI OS extracts patterns and indexes them to guide strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Journal Entry Form */}
        <div className="glass-panel rounded-2xl p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-white">Record Reflection</h3>

          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Log Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Pivot ideas, Standup reflection, Wins"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-zinc-700 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Entry Content
              </label>
              <textarea
                placeholder="What did you learn today? What went wrong? How is the team mood?..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-zinc-700 outline-none resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={!title || !content || submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Distilling lessons...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Save Reflection entry
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: Journal Entries History Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-lg text-white">Journal History</h3>

          {loading && entries.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs font-semibold animate-pulse">
              Loading journal records...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs">
              No journal logs written. Start journaling to extract founder metrics.
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-4 space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-white/5 pb-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">{entry.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-[10px] text-zinc-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700 flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-indigo-400" /> {entry.mood || "Neutral"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-medium whitespace-pre-line">
                    {entry.content}
                  </p>

                  {(entry.milestones || entry.lessons) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-3 text-[10px] leading-relaxed">
                      {entry.lessons && (
                        <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                          <span className="font-bold text-amber-400 uppercase tracking-wider block text-[8px] mb-1">
                            Lesson Extracted
                          </span>
                          <span className="font-medium text-zinc-300">{entry.lessons}</span>
                        </div>
                      )}
                      {entry.milestones && (
                        <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                          <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[8px] mb-1">
                            Milestone Extracted
                          </span>
                          <span className="font-medium text-zinc-300">{entry.milestones}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
