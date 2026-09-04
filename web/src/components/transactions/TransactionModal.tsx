"use client";

import { useEffect, useState } from "react";
import { formatMoney, formatTimestamp } from "@/lib/formatters";
import { normalizeSeverity } from "@/lib/severity";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { apiClient } from "@/lib/api";

interface TransactionModalProps {
  txId: string;
  onClose: () => void;
}

export function TransactionModal({ txId, onClose }: TransactionModalProps) {
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If backend isn't ready for individual TX, mock it for UI demo
    setTimeout(() => {
      setTx({
        id: txId,
        accountId: `acc_${Math.floor(Math.random() * 1000)}`,
        amount: Math.random() * 5000 + 10,
        timestamp: Date.now(),
        riskScore: {
          finalScore: Math.floor(Math.random() * 60) + 40,
          severity: "HIGH",
          signalsJson: JSON.stringify([
            { reason: "High LightGBM fraud probability", contribution: 40 },
            { reason: "Extreme transaction velocity (Spike)", contribution: 30 }
          ])
        }
      });
      setLoading(false);
    }, 500);
  }, [txId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-panel border border-border w-full max-w-2xl rounded shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/50">
          <div>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest">Transaction Investigation</h2>
            <p className="text-sm font-mono text-mutedText mt-1">{txId}</p>
          </div>
          <button onClick={onClose} className="p-1 text-mutedText hover:text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center items-center font-mono text-mutedText text-sm">
            LOADING EVIDENCE...
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-3 gap-4 border border-border bg-background p-4 rounded-sm">
              <div>
                <div className="text-[10px] text-mutedText uppercase mb-1 tracking-wider">Account</div>
                <div className="font-mono text-primary text-sm">{tx.accountId}</div>
              </div>
              <div>
                <div className="text-[10px] text-mutedText uppercase mb-1 tracking-wider">Amount</div>
                <div className="font-mono text-primary text-sm">{formatMoney(tx.amount)}</div>
              </div>
              <div>
                <div className="text-[10px] text-mutedText uppercase mb-1 tracking-wider">Timestamp</div>
                <div className="font-mono text-primary text-sm">{formatTimestamp(tx.timestamp)}</div>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-48 flex flex-col items-center shrink-0">
                <RiskGauge score={tx.riskScore.finalScore} severity={tx.riskScore.severity} />
              </div>

              <div className="flex-1 bg-background border border-border rounded-sm p-4">
                <h3 className="text-xs text-primary uppercase font-semibold tracking-widest mb-4">Why Flagged?</h3>
                <div className="space-y-4">
                  {JSON.parse(tx.riskScore.signalsJson).map((sig: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-mutedText">{sig.reason}</span>
                        <span className="text-primary">+{sig.contribution}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-critical rounded-full"
                          style={{ width: `${Math.min(100, (sig.contribution / 100) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </motion.div>
    </div>
  );
}

function RiskGauge({ score, severity }: { score: number, severity: string }) {
  const sev = normalizeSeverity(severity);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          className={sev.color}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-mono font-bold text-primary">{score}</span>
        <span className="text-[10px] text-mutedText">/ 100</span>
      </div>
      <div className={`mt-4 text-[11px] font-bold tracking-widest uppercase ${sev.color}`}>
        {sev.label}
      </div>
    </div>
  );
}
