"use client";
export default function EventsPage() {
  return (
    <div className="flex flex-col h-full bg-background p-4 min-h-0 overflow-hidden">
      <div className="flex justify-between items-end border-b border-border pb-4 shrink-0 mb-4">
        <div>
          <h1 className="text-lg font-bold text-primary font-mono">SYSTEM EVENTS</h1>
          <p className="text-[10px] uppercase tracking-widest text-mutedText mt-1">Infrastructure Logs</p>
        </div>
      </div>
      <div className="flex-1 bg-panel border border-border rounded-sm p-4 text-xs font-mono text-mutedText">
         Listening to system events...
      </div>
    </div>
  );
}
