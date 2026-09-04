"use client";

import { VelocityChart } from "@/components/command-center/VelocityChart";
import { formatMoney, formatTimestamp } from "@/lib/formatters";
import { normalizeSeverity } from "@/lib/severity";

export default function SpikesPage() {
  const mockSpikes = [
    {
      id: "SPIKE-1049",
      startTime: Date.now() - 400000,
      endTime: Date.now() - 100000,
      peakTps: 84.5,
      baselineTps: 2.1,
      transactionCount: 842,
      amount: 125000,
      severity: "CRITICAL"
    },
    {
      id: "SPIKE-1050",
      startTime: Date.now() - 15000,
      endTime: null,
      peakTps: 45.2,
      baselineTps: 1.8,
      transactionCount: 215,
      amount: 45000,
      severity: "HIGH"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background p-4 gap-4 min-h-0 overflow-hidden">
      <div className="flex justify-between items-end border-b border-border pb-4 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-primary font-mono">SPIKE TIMELINE</h1>
          <p className="text-[10px] uppercase tracking-widest text-mutedText mt-1">Real-Time Velocity Anomalies</p>
        </div>
      </div>

      <div className="h-[40%] bg-panel border border-border rounded-sm p-4 shrink-0 flex flex-col relative">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">System Velocity (TPS)</h2>
         </div>
         <div className="flex-1 min-h-0 relative">
           <VelocityChart />
         </div>
      </div>

      <div className="flex-1 bg-panel border border-border rounded-sm flex flex-col min-h-0">
         <div className="p-3 border-b border-border bg-secondary/50">
           <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Spike Events</h2>
         </div>
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-background text-mutedText border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-normal">STATUS</th>
                  <th className="px-4 py-3 font-normal">SPIKE ID</th>
                  <th className="px-4 py-3 font-normal">START</th>
                  <th className="px-4 py-3 font-normal">END</th>
                  <th className="px-4 py-3 font-normal text-right">PEAK TPS</th>
                  <th className="px-4 py-3 font-normal text-right">TRANSACTIONS</th>
                  <th className="px-4 py-3 font-normal text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockSpikes.map((spike) => {
                  const sev = normalizeSeverity(spike.severity);
                  return (
                    <tr key={spike.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${sev.color} border-current`}>
                          {spike.endTime ? sev.label : "ONGOING"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-primary">{spike.id}</td>
                      <td className="px-4 py-3 text-mutedText">{formatTimestamp(spike.startTime)}</td>
                      <td className="px-4 py-3 text-mutedText">{spike.endTime ? formatTimestamp(spike.endTime) : "-"}</td>
                      <td className="px-4 py-3 text-right text-primary">{spike.peakTps} <span className="text-mutedText">/ {spike.baselineTps}</span></td>
                      <td className="px-4 py-3 text-right text-mutedText">{spike.transactionCount}</td>
                      <td className="px-4 py-3 text-right text-mutedText">{formatMoney(spike.amount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
