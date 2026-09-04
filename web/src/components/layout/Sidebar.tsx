"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Network, ShieldAlert, TrendingUp, Terminal } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { group: "COMMAND CENTER", items: [{ name: "Overview", href: "/", icon: Activity }] },
  { group: "INVESTIGATE", items: [
    { name: "Abuse Rings", href: "/rings", icon: Network },
    { name: "Transactions", href: "/transactions", icon: ShieldAlert }
  ]},
  { group: "ANALYTICS", items: [{ name: "Spike Timeline", href: "/spikes", icon: TrendingUp }] },
  { group: "SYSTEM", items: [{ name: "Event Stream", href: "/events", icon: Terminal }] },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[240px] flex-shrink-0 bg-secondary border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="font-mono text-primary font-bold tracking-widest text-lg">ARGUS</h1>
        <p className="text-[10px] uppercase text-mutedText tracking-wider mt-1">SEE EVERYTHING</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="px-4 text-[11px] font-semibold text-mutedText uppercase tracking-wider mb-2">
              {group.group}
            </h2>
            <ul>
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium transition-colors border-l-2",
                        isActive
                          ? "text-primary bg-elevated border-primary"
                          : "text-mutedText border-transparent hover:text-primary hover:bg-panel"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border text-xs font-mono text-mutedBg text-center">
        v1.0.0-PROD
      </div>
    </div>
  );
}
