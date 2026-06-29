"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  MessageSquareCode,
  Network,
  KanbanSquare,
  FileText,
  Video,
  BookOpen,
  User,
  Settings,
  BrainCircuit,
  BarChart3,
  UserCog,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat", href: "/chat", icon: MessageSquareCode },
    { name: "Memory Explorer", href: "/memory", icon: Network },
    { name: "Startup Profile", href: "/startup", icon: User },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Meetings", href: "/meetings", icon: Video },
    { name: "Tasks", href: "/tasks", icon: KanbanSquare },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Account", href: "/account", icon: UserCog },
  ];

  return (
    <aside className="fixed top-4 left-4 bottom-4 w-64 glass-panel rounded-2xl flex flex-col justify-between p-4 z-40 shadow-2xl border border-white/5">
      {/* Brand Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2 py-3 border-b border-white/5">
          <BrainCircuit className="w-8 h-8 text-indigo-400 animate-pulse" />
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">
              FounderMemory
            </h1>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
              AI Startup OS
            </span>
          </div>
        </div>

        {/* Workspace Switcher Details */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-zinc-200 truncate leading-none">Stealth Workspace</p>
            <span className="text-[10px] text-zinc-500 font-medium">Production active</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session profile */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 rounded-full border border-white/10",
              },
            }}
          />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-zinc-200 truncate leading-tight">
              {user?.fullName || "Founder"}
            </p>
            <p className="text-[10px] text-zinc-500 truncate leading-none">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
