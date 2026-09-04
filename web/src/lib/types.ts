export interface Transaction {
  id: string;
  accountId: string;
  deviceId?: string;
  ipAddress?: string;
  merchantId?: string;
  amount: number;
  timestamp: string | Date;
  type?: string;
  riskScore?: RiskScore;
}

export interface RiskScore {
  id: string;
  transactionId: string;
  finalScore: number;
  severity: string;
  signalsJson: string;
}

export interface Spike {
  id: string;
  startTime: string | Date;
  endTime?: string | Date | null;
  peakTps: number;
  baselineTps: number;
  transactionCount: number;
  amount: number;
  severity: string;
}

export interface AbuseRing {
  id: string;
  status: string;
  riskScore: number;
  severity: string;
  transactionCount: number;
  totalAmount: number;
  velocityMultiplier: number;
  temporalCoordination: number;
  createdAt: string | Date;
  members?: RingMember[];
}

export interface RingMember {
  id: string;
  ringId: string;
  accountId: string;
}

export interface GraphNode {
  id: string;
  type: "Account" | "Device" | "IP" | "Merchant";
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface RingDetectedEvent {
  event_type: "CRITICAL_RING_DETECTED" | string;
  ring_id: string;
  risk_score: number;
  severity: string;
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface NewTransactionEvent {
  transaction_id: string;
  amount: number;
  finalScore: number;
  severity: string;
}

export interface DashboardMetrics {
  live_tps: number;
  active_spikes: number;
  active_rings: number;
  money_at_risk: number;
  detection_latency_ms: number;
}
