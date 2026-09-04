"use client";

import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { RingDetectedEvent } from "@/lib/types";
import { formatMoney } from "@/lib/formatters";
import { normalizeSeverity } from "@/lib/severity";
import { useRouter } from "next/navigation";

export function ActiveThreats() {
  const [rings, setRings] = useState<any[]>([
    {
      ring_id: "RING-E8FA132C",
      risk_score: 95,
      severity: "CRITICAL_RING",
      transactionCount: 15,
      totalAmount: 3902.14
    }
  ]);
  
  const [spikes, setSpikes] = useState<any[]>([
    {
      spike_id: "SPIKE-1050",
      peakTps: 45.2,
      baselineTps: 1.8,
      severity: "HIGH",
      transactionCount: 215,
      amount: 45000
    },
    {
      spike_id: "SPIKE-1051",
      peakTps: 18.5,
      baselineTps: 2.1,
      severity: "SUSPICIOUS",
      transactionCount: 84,
      amount: 12000
    }
  ]);
  const router = useRouter();

  useEffect(() => {
    const socket = socketService.connect();
    
    const onRing = (data: any) => {
      setRings(prev => {
        const exists = prev.findIndex(r => r.ring_id === data.ring_id);
        if (exists >= 0) {
          const next = [...prev];
          next[exists] = data;
          return next;
        }
        return [data, ...prev].slice(0, 10);
      });
    };

    const onSpike = (data: any) => {
      setSpikes(prev => {
        const exists = prev.findIndex(s => s.spike_id === data.spike_id);
        if (exists >= 0) {
          const next = [...prev];
          next[exists] = data;
          return next;
        }
        return [data, ...prev].slice(0, 10);
      });
    };

    socket.on("ring_detected", onRing);
    socket.on("spike_detected", onSpike);
    return () => {
      socket.off("ring_detected", onRing);
      socket.off("spike_detected", onSpike);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 divide-x divide-border">
      {/* RINGS PANEL */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-border bg-secondary/50">
          <h3 className="text-[11px] font-semibold text-mutedText tracking-widest uppercase">Active Rings</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {rings.length === 0 && <div className="text-mutedText text-xs p-2 text-center mt-4 font-mono">NO ACTIVE RINGS</div>}
          {rings.map((ring) => {
            const sev = normalizeSeverity(ring.severity);
            return (
              <div 
                key={ring.ring_id}
                onClick={() => router.push(`/rings?id=${ring.ring_id}`)}
                className="flex items-center gap-3 p-2 bg-background border border-border hover:border-mutedBg cursor-pointer rounded-sm transition-colors"
              >
                <div className={`w-1.5 h-full self-stretch rounded-sm ${sev.bg}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-primary text-xs truncate">{ring.ring_id}</span>
                    <span className={`text-[10px] font-bold ${sev.color}`}>RISK {ring.risk_score}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-mutedText font-mono">
                    <span>{ring.transactionCount || 5} TX</span>
                    <span>{formatMoney(ring.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPIKES PANEL */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-border bg-secondary/50">
          <h3 className="text-[11px] font-semibold text-mutedText tracking-widest uppercase">Active Spikes</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {spikes.length === 0 && <div className="text-mutedText text-xs p-2 text-center mt-4 font-mono">NO ACTIVE SPIKES</div>}
           {spikes.map((spike) => {
            const sev = normalizeSeverity(spike.severity);
            return (
              <div 
                key={spike.spike_id}
                onClick={() => router.push(`/spikes`)}
                className="flex items-center gap-3 p-2 bg-background border border-border hover:border-mutedBg cursor-pointer rounded-sm transition-colors"
              >
                <div className={`w-1.5 h-full self-stretch rounded-sm ${sev.bg}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-primary text-xs truncate">{spike.spike_id}</span>
                    <span className={`text-[10px] font-bold ${sev.color}`}>{spike.peakTps} TPS</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-mutedText font-mono">
                    <span>{spike.transactionCount || 0} TX</span>
                    <span>{formatMoney(spike.amount || 0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
