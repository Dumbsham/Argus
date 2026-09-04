"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { formatMoney } from "@/lib/formatters";
import { normalizeSeverity } from "@/lib/severity";

// Next.js needs dynamic import for react-force-graph to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export function RingGraph({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#0A0F18] border border-border rounded-sm">
      <div className="absolute top-2 left-2 z-10 font-mono text-[10px] text-mutedText uppercase flex gap-4">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Account</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-none bg-purple-500"></span> IP</span>
        <span className="flex items-center gap-1"><span className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent border-b-orange-500"></span> Device</span>
      </div>
      
      {dimensions.width > 0 && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={{ nodes: data.nodes || [], links: data.edges || [] }}
          nodeLabel="id"
          nodeColor={(node: any) => {
            if (node.type === "Account") return "#3B82F6";
            if (node.type === "IP") return "#A855F7";
            if (node.type === "Device") return "#F97316";
            return "#8A97A8";
          }}
          nodeVal={5}
          linkColor={() => "#1D2938"}
          linkWidth={(link: any) => link.weight ? Math.min(link.weight * 0.5, 3) : 1}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
             const label = node.id;
             const fontSize = 12/globalScale;
             ctx.font = `\${fontSize}px var(--font-jetbrains-mono)`;
             
             // Draw Node
             ctx.beginPath();
             if (node.type === "Device") {
                ctx.moveTo(node.x, node.y - 4);
                ctx.lineTo(node.x - 4, node.y + 4);
                ctx.lineTo(node.x + 4, node.y + 4);
                ctx.fillStyle = "#F97316";
                ctx.fill();
             } else if (node.type === "IP") {
                ctx.rect(node.x - 3, node.y - 3, 6, 6);
                ctx.fillStyle = "#A855F7";
                ctx.fill();
             } else {
                ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                ctx.fillStyle = "#3B82F6";
                ctx.fill();
             }

             // Draw Label
             if (globalScale > 1.5) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = "#8A97A8";
                ctx.fillText(label, node.x, node.y + 8);
             }
          }}
        />
      )}
    </div>
  );
}
