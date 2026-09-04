"use client";
import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";

export function VelocityChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate some initial data or fetch from API
    // For demo purposes if backend isn't emitting live points rapidly
    const points = [];
    let time = Date.now() - 60000;
    for(let i=0; i<60; i++) {
       points.push({
         time: time + (i*1000),
         tps: Math.random() * 5 + 1,
         baseline: 2,
       });
    }
    setData(points);

    let hasReceivedReal = false;
    const socket = socketService.connect();
    const onMetrics = (metricsData: any) => {
        hasReceivedReal = true;
        setData(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: Date.now(),
                tps: metricsData.live_tps || 0,
                baseline: 2
            });
            return next;
        });
    };
    socket.on('metrics_update', onMetrics);

    const interval = setInterval(() => {
      if (!hasReceivedReal) {
          setData(prev => {
            const next = [...prev.slice(1)];
            // Add random spike chance
            const isSpike = Math.random() > 0.95;
            next.push({
              time: Date.now(),
              tps: isSpike ? Math.random() * 40 + 20 : Math.random() * 5 + 1,
              baseline: 2
            });
            return next;
          });
      }
    }, 1000);

    return () => {
        clearInterval(interval);
        socket.off('metrics_update', onMetrics);
    };
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis 
          dataKey="time" 
          tickFormatter={(val) => new Date(val).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}
          stroke="#526071"
          tick={{ fill: "#8A97A8", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
          minTickGap={30}
        />
        <YAxis 
          stroke="#526071"
          tick={{ fill: "#8A97A8", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: "#0F1722", border: "1px solid #1D2938", borderRadius: "2px" }}
          labelStyle={{ color: "#8A97A8", fontSize: "10px", fontFamily: "var(--font-jetbrains-mono)" }}
          itemStyle={{ fontSize: "12px", fontFamily: "var(--font-jetbrains-mono)" }}
          labelFormatter={(val: any) => new Date(val).toLocaleTimeString() + " IST"}
        />
        <Line type="monotone" dataKey="tps" stroke="#E7EDF5" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        <Line type="step" dataKey="baseline" stroke="#526071" strokeDasharray="3 3" strokeWidth={1} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
