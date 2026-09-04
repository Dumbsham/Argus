"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Fake auth delay for SOC feel
    setTimeout(() => {
      localStorage.setItem("sentinel_auth", "true");
      router.push("/");
    }, 800);
  };

  return (
    <div className="h-full w-full bg-background flex flex-col items-center justify-center font-mono">
      <div className="w-[320px]">
        <div className="mb-8">
          <h1 className="text-2xl text-primary font-bold tracking-widest mb-1">ARGUS</h1>
          <p className="text-xs text-mutedText uppercase tracking-widest">SEE EVERYTHING</p>
        </div>

        <div className="bg-panel border border-border p-6 rounded shadow-lg">
          <h2 className="text-xs text-primary mb-4 border-b border-border pb-2">ACCESS TERMINAL</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] text-mutedText mb-1 uppercase">Password</label>
              <input 
                type="password" 
                className="w-full bg-secondary border border-border text-primary px-3 py-2 text-sm focus:outline-none focus:border-mutedText transition-colors rounded-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading || password.length === 0}
              className="w-full bg-primary text-background font-bold text-xs py-2 uppercase hover:bg-white disabled:opacity-50 transition-colors rounded-sm"
            >
              {loading ? "AUTHENTICATING..." : "[ AUTHENTICATE ]"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
