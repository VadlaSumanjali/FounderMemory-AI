import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-white flex">
      {/* Mesh Gradient background */}
      <div className="mesh-gradient-bg" />

      {/* Floating Sidebar */}
      <Sidebar />

      {/* Spotlight Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Main Content Pane */}
      <main className="flex-1 pl-72 p-6 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
