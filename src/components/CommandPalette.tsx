"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  MessageSquareCode,
  Network,
  KanbanSquare,
  FileText,
  Video,
  BookOpen,
  User,
  Settings,
  Sparkles,
} from "lucide-react";

interface CommandItem {
  id: string;
  name: string;
  category: "Navigation" | "AI Tools";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Command palette items list
  const commands: CommandItem[] = [
    { id: "dash", name: "Go to Dashboard", category: "Navigation", icon: LayoutDashboard, action: () => router.push("/dashboard") },
    { id: "chat", name: "Go to AI Co-Founder Chat", category: "Navigation", icon: MessageSquareCode, action: () => router.push("/chat") },
    { id: "graph", name: "Go to Memory Graph Explorer", category: "Navigation", icon: Network, action: () => router.push("/memory") },
    { id: "tasks", name: "Go to Kanban Task Board", category: "Navigation", icon: KanbanSquare, action: () => router.push("/tasks") },
    { id: "docs", name: "Go to Uploaded Documents", category: "Navigation", icon: FileText, action: () => router.push("/documents") },
    { id: "meetings", name: "Go to Meeting Notes", category: "Navigation", icon: Video, action: () => router.push("/meetings") },
    { id: "journal", name: "Go to Reflections Journal", category: "Navigation", icon: BookOpen, action: () => router.push("/journal") },
    { id: "profile", name: "Go to Startup Profile Details", category: "Navigation", icon: User, action: () => router.push("/startup") },
    { id: "settings", name: "Go to Workspace Settings", category: "Navigation", icon: Settings, action: () => router.push("/settings") },
    
    // Tools shortcuts
    { id: "swot", name: "Trigger SWOT Analysis Report", category: "AI Tools", icon: Sparkles, action: () => router.push("/chat?prompt=Please+generate+a+SWOT+analysis+report+for+my+startup.") },
    { id: "bmc", name: "Trigger Business Model Canvas", category: "AI Tools", icon: Sparkles, action: () => router.push("/chat?prompt=Please+compile+a+Business+Model+Canvas+report.") },
    { id: "prd", name: "Generate Product Requirements Document (PRD)", category: "AI Tools", icon: Sparkles, action: () => router.push("/chat?prompt=Help+me+draft+a+PRD+for+our+core+feature.") },
    { id: "pitch", name: "Generate Investor Pitch Deck Outline", category: "AI Tools", icon: Sparkles, action: () => router.push("/chat?prompt=Compile+an+investor+pitch+deck+outline.") },
  ];

  // Filter commands by search query
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  // Listen for keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        setIsOpen(false);
        setSearch("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] bg-black/60 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />

      {/* Main command modal panel */}
      <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]">
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands, routes, and AI tools..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-white border-0 outline-none text-sm placeholder-zinc-500"
          />
          <span className="text-[10px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded border border-zinc-700">
            ESC
          </span>
        </div>

        {/* Command list content */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No matching commands or actions found.
            </div>
          ) : (
            <div>
              {/* Group by category */}
              {["Navigation", "AI Tools"].map((cat) => {
                const catCommands = filteredCommands.filter((c) => c.category === cat);
                if (catCommands.length === 0) return null;

                return (
                  <div key={cat} className="mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-1 block">
                      {cat}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {catCommands.map((cmd) => {
                        const globalIndex = filteredCommands.indexOf(cmd);
                        const isSelected = globalIndex === activeIndex;
                        const Icon = cmd.icon;

                        return (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              cmd.action();
                              setIsOpen(false);
                              setSearch("");
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                                : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-zinc-400"}`} />
                            <span className="flex-1 truncate">{cmd.name}</span>
                            {isSelected && (
                              <span className="text-[10px] font-semibold opacity-70 bg-black/20 px-2 py-0.5 rounded">
                                ENTER
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
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
