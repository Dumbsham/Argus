"use client";

import { useEffect, useState } from "react";
import { DashboardMetrics } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { formatMoney } from "@/lib/formatters";
import { TransactionStream } from "@/components/command-center/TransactionStream";
import { ActiveThreats } from "@/components/command-center/ActiveThreats";
import { VelocityChart } from "@/components/command-center/VelocityChart";

export default function CommandCenter() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    live_tps: 0,
    active_spikes: 0,
    active_rings: 0,
    money_at_risk: 0,
    detection_latency_ms: 0,
  });
  
  useEffect(() => {
    // Initial fetch
    const fetchMetrics = async () => {
      try {
        const res = await apiClient.get('/api/dashboard/metrics');
        if (res.data) setMetrics(res.data);
      } catch (e) {
        // Fallback for demo if API isn't ready or backend is off
        setMetrics({
          live_tps: 42.5 + (Math.random() * 5 - 2.5),
          active_spikes: 2,
          active_rings: 1,
          money_at_risk: 28400.50 + Math.random() * 1000,
          detection_latency_ms: 45 + Math.floor(Math.random() * 10)
        });
      }
    };
    
    fetchMetrics();
    
    // Poll metrics every 3s as fallback
    const interval = setInterval(fetchMetrics, 3000);
    
    // Listen to real-time WebSockets
    const socket = socketService.connect();
    const onMetrics = (data: DashboardMetrics) => {
        setMetrics(data);
    };
    socket.on('metrics_update', onMetrics);

    return () => {
        clearInterval(interval);
        socket.off('metrics_update', onMetrics);
    };
  }, []);

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden bg-background">
      {/* KPI Strip */}
      <div className="flex items-center border border-border bg-panel rounded-sm mb-4 shrink-0 divide-x divide-border">
        <MetricBox label="LIVE TPS" value={metrics.live_tps.toFixed(1)} />
        <MetricBox label="ACTIVE SPIKES" value={metrics.active_spikes.toString().padStart(2, '0')} />
        <MetricBox label="ACTIVE RINGS" value={metrics.active_rings.toString().padStart(2, '0')} />
        <MetricBox label="MONEY AT RISK" value={formatMoney(metrics.money_at_risk)} />
        <MetricBox label="DETECTION LATENCY" value={`${metrics.detection_latency_ms}ms`} />
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column */}
        <div className="flex-1 flex flex-col min-w-0 gap-4">
          <div className="h-[45%] shrink-0 border border-border bg-panel flex flex-col relative rounded-sm">
             <div className="p-3 border-b border-border flex justify-between items-center bg-secondary/50">
               <div>
                 <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Transaction Velocity</h2>
                 <p className="text-[10px] text-mutedText tracking-wider mt-0.5">REAL-TIME STREAM</p>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-normal"></div>
                 <span className="text-[10px] font-mono text-primary">LIVE</span>
               </div>
             </div>
             <div className="flex-1 min-h-0 p-2 relative">
                <VelocityChart />
             </div>
          </div>
          
          <div className="flex-1 border border-border bg-panel flex flex-col min-h-0 rounded-sm">
             <ActiveThreats />
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[380px] shrink-0 border border-border bg-panel flex flex-col rounded-sm">
           <div className="p-3 border-b border-border flex justify-between items-center bg-secondary/50">
             <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Live Transactions</h2>
             <span className="text-[10px] text-mutedText font-mono border border-border px-1.5 py-0.5 rounded-sm">STREAMING</span>
           </div>
           <TransactionStream />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, context }: { label: string, value: string | number, context?: string }) {
  return (
    <div className="flex-1 p-3">
      <div className="text-[10px] text-mutedText font-semibold tracking-wider mb-1 uppercase">{label}</div>
      <div className="text-2xl font-mono text-primary">{value}</div>
      {context && <div className="text-[10px] text-mutedText mt-1">{context}</div>}
    </div>
  );
}
