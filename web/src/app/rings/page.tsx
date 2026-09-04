"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { formatMoney } from "@/lib/formatters";
import { normalizeSeverity } from "@/lib/severity";
import { RingGraph } from "@/components/graph/RingGraph";

function RingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("id");

  const [rings, setRings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll mock the data if the API isn't wired fully
    setTimeout(() => {
      const mockRings = [
        {
          id: "RING-E8FA132C",
          severity: "CRITICAL_RING",
          riskScore: 95,
          transactionCount: 15,
          totalAmount: 3902.14,
          status: "ACTIVE",
          velocityMultiplier: 4.8,
          temporalCoordination: 0.91,
          signals: {
            "Shared Device": 25,
            "Shared IP": 20,
            "Temporal Coordination": 20,
            "Velocity Multiplier": 15,
            "Amount Similarity": 10,
          },
          members: [
            { accountId: "acc_119", transactions: 3 },
            { accountId: "acc_587", transactions: 4 },
            { accountId: "acc_98", transactions: 2 },
            { accountId: "acc_461", transactions: 5 },
            { accountId: "acc_989", transactions: 1 },
          ],
          graphData: {
            nodes: [
              { id: "acc_119", type: "Account" },
              { id: "acc_587", type: "Account" },
              { id: "acc_98", type: "Account" },
              { id: "acc_461", type: "Account" },
              { id: "acc_989", type: "Account" },
              { id: "dev_24", type: "Device" },
              { id: "192.168.200.1", type: "IP" }
            ],
            edges: [
              { source: "acc_119", target: "dev_24", weight: 3 },
              { source: "acc_587", target: "dev_24", weight: 4 },
              { source: "acc_98", target: "dev_24", weight: 2 },
              { source: "acc_461", target: "dev_24", weight: 5 },
              { source: "acc_989", target: "dev_24", weight: 1 },
              { source: "acc_119", target: "192.168.200.1", weight: 3 },
              { source: "acc_587", target: "192.168.200.1", weight: 4 },
            ]
          }
        },
        {
          id: "RING-4B254686",
          severity: "SUSPICIOUS_CLUSTER",
          riskScore: 55,
          transactionCount: 6,
          totalAmount: 850.00,
          status: "ACTIVE",
          velocityMultiplier: 1.2,
          temporalCoordination: 0.60,
          signals: {
            "Shared Device": 20,
            "Shared IP": 15,
            "Temporal Coordination": 15,
            "Velocity Multiplier": 0,
            "Amount Similarity": 5,
          },
          members: [
            { accountId: "acc_600", transactions: 3 },
            { accountId: "acc_601", transactions: 2 },
            { accountId: "acc_602", transactions: 1 }
          ],
          graphData: { 
            nodes: [
              { id: "acc_600", type: "Account" },
              { id: "acc_601", type: "Account" },
              { id: "acc_602", type: "Account" },
              { id: "dev_88", type: "Device" }
            ], 
            edges: [
              { source: "acc_600", target: "dev_88", weight: 3 },
              { source: "acc_601", target: "dev_88", weight: 2 },
              { source: "acc_602", target: "dev_88", weight: 1 }
            ] 
          }
        }
      ];
      setRings(mockRings);
      setLoading(false);
      
      // Auto-select first if none selected
      if (!selectedId && mockRings.length > 0) {
        router.replace(`/rings?id=${mockRings[0].id}`);
      }
    }, 600);
  }, []);

  const selectedRing = rings.find(r => r.id === selectedId) || rings[0];

  return (
    <div className="flex h-full min-h-0 bg-background overflow-hidden">
      
      {/* LEFT PANE: Ring List */}
      <div className="w-[320px] shrink-0 border-r border-border bg-panel flex flex-col min-h-0">
        <div className="p-4 border-b border-border bg-secondary/50">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-widest">Abuse Rings</h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
          {loading ? (
             <div className="p-4 space-y-4">
               <div className="h-16 bg-elevated animate-pulse rounded-sm"></div>
               <div className="h-16 bg-elevated animate-pulse rounded-sm"></div>
             </div>
          ) : rings.length === 0 ? (
             <div className="p-6 text-center text-xs text-mutedText font-mono">NO ACTIVE RINGS</div>
          ) : (
             rings.map((ring) => {
               const sev = normalizeSeverity(ring.severity);
               const isActive = selectedRing?.id === ring.id;
               
               return (
                 <div 
                   key={ring.id}
                   onClick={() => router.push(`/rings?id=${ring.id}`)}
                   className={`p-3 cursor-pointer transition-colors ${isActive ? 'bg-elevated' : 'hover:bg-secondary'}`}
                 >
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${sev.color}`}>{sev.label}</span>
                     <span className="text-[10px] text-mutedText font-mono">{ring.status}</span>
                   </div>
                   <div className="font-mono text-primary text-sm mb-1">{ring.id}</div>
                   <div className="flex justify-between items-center text-xs font-mono text-mutedText">
                     <span>{ring.transactionCount} TX</span>
                     <span>{formatMoney(ring.totalAmount)}</span>
                   </div>
                 </div>
               )
             })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Investigation Workspace */}
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-y-auto">
        {selectedRing ? (
          <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
            
            {/* Header */}
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 shrink-0 border border-border flex flex-col items-center justify-center bg-panel rounded-sm">
                <span className={`text-2xl font-mono font-bold ${normalizeSeverity(selectedRing.severity).color}`}>{selectedRing.riskScore}</span>
                <span className="text-[10px] text-mutedText uppercase tracking-wider">Score</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-mono text-primary font-bold">{selectedRing.id}</h1>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${normalizeSeverity(selectedRing.severity).color} border-current`}>
                    {normalizeSeverity(selectedRing.severity).label}
                  </span>
                </div>
                <div className="flex gap-6 text-xs font-mono text-mutedText">
                  <span><strong className="text-primary">{selectedRing.transactionCount}</strong> TRANSACTIONS</span>
                  <span><strong className="text-primary">{formatMoney(selectedRing.totalAmount)}</strong> TOTAL</span>
                  <span>VELOCITY <strong className="text-primary">×{selectedRing.velocityMultiplier}</strong></span>
                  <span>SYNC <strong className="text-primary">{selectedRing.temporalCoordination}</strong></span>
                </div>
              </div>
            </div>

            {/* Middle row: Graph + Signals */}
            <div className="flex gap-6 h-[400px]">
              
              <div className="flex-[2] flex flex-col gap-2">
                <h3 className="text-[11px] font-semibold text-mutedText uppercase tracking-widest">Network Visualization</h3>
                <RingGraph data={selectedRing.graphData} />
              </div>
              
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-[11px] font-semibold text-mutedText uppercase tracking-widest">Scoring Signals</h3>
                <div className="flex-1 bg-panel border border-border p-4 rounded-sm flex flex-col gap-4 overflow-y-auto">
                  {Object.entries(selectedRing.signals).map(([key, val]: any) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-mutedText uppercase">{key}</span>
                        <span className="text-primary">{val} pts</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${Math.min(100, (val / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom row: Members */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[11px] font-semibold text-mutedText uppercase tracking-widest">Connected Accounts</h3>
              <div className="bg-panel border border-border rounded-sm overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-secondary/50 text-mutedText border-b border-border">
                    <tr>
                      <th className="px-4 py-2 font-normal">ACCOUNT ID</th>
                      <th className="px-4 py-2 font-normal text-right">TRANSACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedRing.members.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-secondary/50">
                        <td className="px-4 py-3 text-primary">{m.accountId}</td>
                        <td className="px-4 py-3 text-right text-mutedText">{m.transactions}</td>
                      </tr>
                    ))}
                    {selectedRing.members.length === 0 && (
                      <tr><td colSpan={2} className="p-4 text-center text-mutedText">No members extracted.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-xs font-mono text-mutedText">SELECT A RING TO INVESTIGATE</div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function RingsPage() {
  return (
    <Suspense fallback={<div className="flex h-full min-h-0 bg-background items-center justify-center text-xs font-mono text-mutedText">LOADING RINGS...</div>}>
      <RingsContent />
    </Suspense>
  );
}
