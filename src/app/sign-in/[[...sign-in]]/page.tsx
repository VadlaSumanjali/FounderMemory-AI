import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      {/* Mesh Gradient background */}
      <div className="absolute inset-0 z-0 bg-[#030303]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-2xl shadow-2xl flex flex-col items-center">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">FounderMemory AI</h2>
          <p className="text-sm text-zinc-400 mt-1">The AI Co-Founder That Never Forgets</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              card: "bg-transparent border-0 shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-white font-medium rounded-xl transition-all",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all",
              formFieldLabel: "text-zinc-300 font-medium",
              formFieldInput: "bg-zinc-800/50 border-zinc-700/80 text-white rounded-xl placeholder-zinc-500",
              footerActionLink: "text-indigo-400 hover:text-indigo-300",
              dividerLine: "bg-zinc-800",
              dividerText: "text-zinc-400",
            },
          }}
        />
      </div>
    </main>
  );
}
