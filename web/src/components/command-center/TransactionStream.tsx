"use client";

import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { NewTransactionEvent } from "@/lib/types";
import { formatMoney, formatTimestamp } from "@/lib/formatters";
import { normalizeSeverity } from "@/lib/severity";
import { motion, AnimatePresence } from "framer-motion";
import { TransactionModal } from "../transactions/TransactionModal";

export function TransactionStream() {
  const [events, setEvents] = useState<NewTransactionEvent[]>([]);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  useEffect(() => {
    const socket = socketService.connect();
    
    let receivedReal = false;
    const onNewTx = (data: NewTransactionEvent) => {
      receivedReal = true;
      setEvents(prev => [data, ...prev].slice(0, 50));
    };

    socket.on("new_transaction", onNewTx);
    
    // Fallback: If backend isn't running, generate mock traffic after 3 seconds
    const mockInterval = setInterval(() => {
        if (!receivedReal) {
            setEvents(prev => [{
                transaction_id: `tx_mock_${Math.random().toString(36).substring(7)}`,
                amount: Math.random() * 5000 + 10,
                finalScore: Math.floor(Math.random() * 100),
                severity: Math.random() > 0.9 ? "CRITICAL" : (Math.random() > 0.7 ? "HIGH" : (Math.random() > 0.5 ? "SUSPICIOUS" : "NORMAL"))
            }, ...prev].slice(0, 50));
        }
    }, 1200);

    return () => {
      socket.off("new_transaction", onNewTx);
      clearInterval(mockInterval);
    };
  }, []);

  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-0 bg-background font-mono text-xs">
        <AnimatePresence initial={false}>
          {events.length === 0 && (
             <div className="p-4 text-mutedText text-center mt-10">Waiting for transactions...</div>
          )}
          {events.map((tx) => {
            const sev = normalizeSeverity(tx.severity);
            return (
              <motion.div
                key={tx.transaction_id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="border-b border-border hover:bg-secondary cursor-pointer transition-colors"
                onClick={() => setSelectedTx(tx.transaction_id)}
              >
                <div className="p-3 flex flex-col gap-1.5 border-l-2" style={{ borderLeftColor: `var(--tw-colors-${sev.label.toLowerCase()})` }}>
                  <div className="flex justify-between items-center text-mutedText">
                    <span>{formatTimestamp(Date.now())}</span>
                    <span className={sev.color}>{tx.finalScore} / 100</span>
                  </div>
                  <div className="flex justify-between items-center text-primary">
                    <span className="truncate max-w-[150px]">{tx.transaction_id}</span>
                    <span>{formatMoney(tx.amount)}</span>
                  </div>
                  <div className={`text-[10px] uppercase font-bold tracking-widest ${sev.color}`}>
                    {sev.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {selectedTx && (
        <TransactionModal txId={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </>
  );
}
