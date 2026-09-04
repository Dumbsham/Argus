"use client";

import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { RingDetectedEvent } from "@/lib/types";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/formatters";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalAlerts() {
  const [alert, setAlert] = useState<RingDetectedEvent & { amount?: number, txCount?: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const socket = socketService.connect();
    
    const onRing = (data: any) => {
      if (data.event_type === "CRITICAL_RING_DETECTED") {
        setAlert({
          ...data,
          // Extract mock info from data if it wasn't provided in base event
          amount: data.totalAmount || 0,
          txCount: data.transactionCount || 0
        });
      }
    };

    socket.on("ring_detected", onRing);

    return () => {
      socket.off("ring_detected", onRing);
    };
  }, []);

  if (!alert) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 right-4 z-50 w-80 bg-background border border-critical shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded font-mono text-sm"
      >
        <div className="bg-critical/10 text-critical font-bold p-2 text-xs flex justify-between items-center border-b border-critical/20">
          <span>CRITICAL RING DETECTED</span>
          <button onClick={() => setAlert(null)} className="hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-3">
          <div className="mb-1 text-primary">{alert.ring_id}</div>
          <div className="text-mutedText text-xs mb-2">Risk Score: {alert.risk_score}</div>
          {alert.txCount !== undefined && alert.amount !== undefined && (
            <div className="text-mutedText text-xs mb-3">
              {alert.txCount} transactions / {formatMoney(alert.amount)}
            </div>
          )}
          <button 
            onClick={() => {
              setAlert(null);
              router.push(`/rings?id=${alert.ring_id}`);
            }}
            className="w-full text-left text-xs text-primary hover:text-white mt-1 uppercase"
          >
            VIEW RING →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
