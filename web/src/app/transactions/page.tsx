"use client";
import { TransactionStream } from "@/components/command-center/TransactionStream";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-full bg-background p-4 min-h-0 overflow-hidden">
      <div className="flex justify-between items-end border-b border-border pb-4 shrink-0 mb-4">
        <div>
          <h1 className="text-lg font-bold text-primary font-mono">ALL TRANSACTIONS</h1>
          <p className="text-[10px] uppercase tracking-widest text-mutedText mt-1">Real-Time Event Stream</p>
        </div>
      </div>
      <div className="flex-1 bg-panel border border-border rounded-sm flex flex-col min-h-0">
        <TransactionStream />
      </div>
    </div>
  );
}
