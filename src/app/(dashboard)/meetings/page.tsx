"use client";

import { useEffect, useState } from "react";
import { Video, Clock, CheckCircle, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface MeetingItem {
  id: string;
  title: string;
  date: string;
  transcript: string;
  summary: string | null;
  actionItems: string[] | null;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetings();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleUploadMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !transcript) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, transcript }),
      });

      if (res.ok) {
        setTitle("");
        setTranscript("");
        fetchMeetings();
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
          <Video className="w-8 h-8 text-indigo-400" /> Meeting Notes & Transcripts
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Paste meeting transcripts. The PM/Operations Agent drafts summaries, action items, and populates Kanban tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Meeting Uploader */}
        <div className="glass-panel rounded-2xl p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-white">Upload Transcript</h3>

          <form onSubmit={handleUploadMeeting} className="space-y-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Meeting Title
              </label>
              <input
                type="text"
                placeholder="e.g. Weekly Sync, Standup, Board Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-zinc-700 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Raw Transcript / Discussion text
              </label>
              <textarea
                placeholder="Paste transcript turns (e.g. Alice: Let's change the price, Bob: Agree)..."
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-650 focus:border-zinc-700 outline-none resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={!title || !transcript || submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Analyzing discussion...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Compile Meeting summary
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: Meeting Logs List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-lg text-white">Summary Records</h3>

          {loading && meetings.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs font-semibold animate-pulse">
              Loading meetings index...
            </div>
          ) : meetings.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs">
              No meeting logs recorded in this workspace.
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const isExpanded = expandedId === meeting.id;
                // Parse action items if JSON string (handles SQLite fallback or Pg)
                let items: string[] = [];
                if (meeting.actionItems) {
                  items = typeof meeting.actionItems === "string"
                    ? JSON.parse(meeting.actionItems)
                    : (meeting.actionItems as unknown as string[]);
                }

                return (
                  <div
                    key={meeting.id}
                    className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden"
                  >
                    {/* Collapsible header */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/20 transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-zinc-200 truncate">{meeting.title}</h4>
                          <span className="text-[10px] text-zinc-500 mt-1 block">
                            Conducted {new Date(meeting.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button className="text-zinc-500 hover:text-zinc-300">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Collapsible content body */}
                    {isExpanded && (
                      <div className="border-t border-zinc-850 p-4 space-y-4 bg-zinc-950/20 text-xs">
                        <div className="space-y-1.5">
                          <h5 className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">AI Summary</h5>
                          <p className="text-zinc-300 leading-relaxed font-medium bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                            {meeting.summary}
                          </p>
                        </div>

                        {items.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Action Items Extracted</h5>
                            <div className="space-y-1">
                              {items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-zinc-300">
                                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                  <span className="font-medium">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
