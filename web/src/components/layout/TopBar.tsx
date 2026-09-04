"use client";

import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";

export function TopBar() {
  const [status, setStatus] = useState<"LIVE" | "RECONNECTING" | "OFFLINE">("OFFLINE");
  const [tps, setTps] = useState("0.0");
  const [time, setTime] = useState("");

  useEffect(() => {
    // Clock
    const timer = setInterval(() => {
      const d = new Date();
      setTime(d.toLocaleTimeString("en-GB", { hour12: false, fractionalSecondDigits: 3 }) + " IST");
    }, 50);

    // Socket status
    const socket = socketService.connect();
    
    const onConnect = () => setStatus("LIVE");
    const onDisconnect = () => setStatus("OFFLINE");
    const onReconnectAttempt = () => setStatus("RECONNECTING");

    if (socket.connected) setStatus("LIVE");
    else if (socket.active) setStatus("RECONNECTING");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    // Listen to metrics event for TPS if backend emits it, otherwise mock for demo shell
    socket.on("metrics_update", (data) => {
       if (data.tps) setTps(data.tps.toFixed(1));
    });

    return () => {
      clearInterval(timer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.off("metrics_update");
    };
  }, []);

  return (
    <div className="h-12 border-b border-border bg-background flex items-center justify-between px-4 select-none shrink-0">
      <div className="text-xs font-mono text-mutedText">
        ARGUS <span className="mx-2 text-border">/</span> COMMAND CENTER
      </div>

      <div className="flex items-center gap-6 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "LIVE" ? "bg-normal" : status === "RECONNECTING" ? "bg-suspicious" : "bg-critical"
            }`}
          />
          <span className={status === "LIVE" ? "text-primary" : "text-mutedText"}>
            {status === "LIVE" ? "STREAM CONNECTED" : status}
          </span>
        </div>

        <div className="text-primary">{tps} TPS</div>
        <div className="text-mutedText w-[110px] text-right tabular-nums">{time}</div>
      </div>
    </div>
  );
}
