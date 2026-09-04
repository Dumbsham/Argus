import * as crypto from 'crypto';
import { Redis } from 'ioredis';

export interface RingJSON {
  ring_id: string;
  status: string;
  risk_score: number;
  accounts: string[];
  devices: string[];
  ips: string[];
  merchants: string[];
  transaction_count: number;
  total_amount: number;
  velocity_multiplier: number;
  temporal_coordination: number;
  created_at: number;
  signals: {
    shared_device: number;
    shared_ip: number;
    temporal_coordination: number;
    velocity: number;
    merchant_coordination: number;
    amount_similarity: number;
  };
}

export class GraphEngine {
    txWindow: any[] = [];
    activeRings: Map<string, RingJSON> = new Map();
    redisPublisher: Redis;

    constructor() {
        this.redisPublisher = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();
    }

    processTransaction(tx: any) {
        this.txWindow.push(tx);
    }

    detectAbuseRings(): RingJSON[] {
        const now = Date.now();
        // 60-second sliding window
        this.txWindow = this.txWindow.filter(tx => now - tx.timestamp <= 60000);

        // 1. Find suspicious devices and IPs (>= 3 accounts)
        const accountsPerDevice = new Map<string, Set<string>>();
        const accountsPerIP = new Map<string, Set<string>>();

        for (const tx of this.txWindow) {
            if (!accountsPerDevice.has(tx.device_id)) accountsPerDevice.set(tx.device_id, new Set());
            accountsPerDevice.get(tx.device_id)!.add(tx.account_id);
            
            if (!accountsPerIP.has(tx.ip_address)) accountsPerIP.set(tx.ip_address, new Set());
            accountsPerIP.get(tx.ip_address)!.add(tx.account_id);
        }

        const candidateClusters: Array<{ accounts: Set<string>, coreNode: string, type: 'device' | 'ip' }> = [];

        for (const [dev, accounts] of accountsPerDevice.entries()) {
            if (accounts.size >= 3) candidateClusters.push({ accounts, coreNode: dev, type: 'device' });
        }
        for (const [ip, accounts] of accountsPerIP.entries()) {
            if (accounts.size >= 3) candidateClusters.push({ accounts, coreNode: ip, type: 'ip' });
        }

        const ringsThisCycle: RingJSON[] = [];

        for (const cluster of candidateClusters) {
            // Collect all tx for these accounts
            const clusterTxs = this.txWindow.filter(tx => cluster.accounts.has(tx.account_id));
            if (clusterTxs.length < 5) continue; // Minimum transactions

            const accounts = new Set<string>();
            const devices = new Set<string>();
            const ips = new Set<string>();
            const merchants = new Set<string>();
            let totalAmount = 0;

            for (const tx of clusterTxs) {
                accounts.add(tx.account_id);
                devices.add(tx.device_id);
                ips.add(tx.ip_address);
                merchants.add(tx.merchant_id);
                totalAmount += tx.amount;
            }

            // Fingerprint
            const sortedAccs = Array.from(accounts).sort().join(',');
            const sortedDevs = Array.from(devices).sort().join(',');
            const sortedIPs = Array.from(ips).sort().join(',');
            const fingerprintRaw = `${sortedAccs}|${sortedDevs}|${sortedIPs}`;
            const ringId = 'RING-' + crypto.createHash('md5').update(fingerprintRaw).digest('hex').substring(0, 8).toUpperCase();

            // Calculate Scores
            // A. Shared Device
            let maxAccsOnDev = 0;
            for (const dev of devices) {
                const count = Array.from(accounts).filter(a => clusterTxs.some(t => t.account_id === a && t.device_id === dev)).length;
                if (count > maxAccsOnDev) maxAccsOnDev = count;
            }
            let sharedDeviceScore = 0;
            if (maxAccsOnDev >= 8) sharedDeviceScore = 25;
            else if (maxAccsOnDev >= 5) sharedDeviceScore = 20;
            else if (maxAccsOnDev >= 3) sharedDeviceScore = 15;

            // B. Shared IP
            let maxAccsOnIP = 0;
            for (const ip of ips) {
                const count = Array.from(accounts).filter(a => clusterTxs.some(t => t.account_id === a && t.ip_address === ip)).length;
                if (count > maxAccsOnIP) maxAccsOnIP = count;
            }
            let sharedIpScore = 0;
            if (maxAccsOnIP >= 20) sharedIpScore = 20;
            else if (maxAccsOnIP >= 10) sharedIpScore = 15;
            else if (maxAccsOnIP >= 5) sharedIpScore = 10;

            // C. Temporal Coordination
            clusterTxs.sort((a, b) => a.timestamp - b.timestamp);
            let maxTxsIn10s = 0;
            for (let i = 0; i < clusterTxs.length; i++) {
                let j = i;
                let count = 0;
                while (j < clusterTxs.length && clusterTxs[j].timestamp - clusterTxs[i].timestamp <= 10000) {
                    count++;
                    j++;
                }
                if (count > maxTxsIn10s) maxTxsIn10s = count;
            }
            const syncRatio = maxTxsIn10s / clusterTxs.length;
            let temporalScore = 0;
            if (syncRatio >= 0.8) temporalScore = 20;
            else if (syncRatio >= 0.6) temporalScore = 15;
            else if (syncRatio >= 0.4) temporalScore = 10;

            // D. Velocity
            const baseline = accounts.size * (60 / 60); // 1 tx per account per minute is normal
            const velocityMultiplier = clusterTxs.length / Math.max(1, baseline);
            let velocityScore = 0;
            if (velocityMultiplier > 10) velocityScore = 15;
            else if (velocityMultiplier > 5) velocityScore = 12;
            else if (velocityMultiplier > 3) velocityScore = 8;
            else if (velocityMultiplier > 2) velocityScore = 5;

            // E. Merchant Coordination
            let maxAccsOnMerch = 0;
            for (const m of merchants) {
                const count = Array.from(accounts).filter(a => clusterTxs.some(t => t.account_id === a && t.merchant_id === m)).length;
                if (count > maxAccsOnMerch) maxAccsOnMerch = count;
            }
            let merchScore = 0;
            if (maxAccsOnMerch >= 3) merchScore = 10;
            else if (maxAccsOnMerch === 2) merchScore = 5;

            // F. Amount Similarity
            const amounts = clusterTxs.map(t => t.amount);
            const meanAmt = totalAmount / clusterTxs.length;
            const variance = amounts.reduce((a, b) => a + Math.pow(b - meanAmt, 2), 0) / clusterTxs.length;
            const stdAmt = Math.sqrt(variance);
            const cv = meanAmt > 0 ? stdAmt / meanAmt : 0;
            let amountScore = 0;
            if (cv < 0.1) amountScore = 10; // Very similar
            else if (cv < 0.3) amountScore = 5; // Moderately similar

            let rawScore = sharedDeviceScore + sharedIpScore + temporalScore + velocityScore + merchScore + amountScore;
            rawScore = Math.min(100, Math.max(0, rawScore));

            // Strong Confirmation Rule
            let status = 'NORMAL';
            if (rawScore >= 80) status = 'CRITICAL_RING';
            else if (rawScore >= 60) status = 'HIGH_RISK_RING';
            else if (rawScore >= 40) status = 'SUSPICIOUS_CLUSTER';

            if (status === 'CRITICAL_RING' || status === 'HIGH_RISK_RING') {
                let strongSignals = 0;
                if (sharedDeviceScore >= 15) strongSignals++;
                if (sharedIpScore >= 10) strongSignals++;
                if (temporalScore >= 15) strongSignals++;
                if (velocityScore >= 12) strongSignals++;
                
                if (strongSignals < 2) {
                    status = 'SUSPICIOUS_CLUSTER';
                    rawScore = Math.min(rawScore, 59);
                }
            }
            
            // Special rule: 3 accounts generally suspicious unless very strong
            if (accounts.size === 3 && status !== 'NORMAL' && rawScore < 80) {
               status = 'SUSPICIOUS_CLUSTER';
               rawScore = Math.min(rawScore, 59);
            }

            const ringOutput: RingJSON = {
                ring_id: ringId,
                status,
                risk_score: rawScore,
                accounts: Array.from(accounts),
                devices: Array.from(devices),
                ips: Array.from(ips),
                merchants: Array.from(merchants),
                transaction_count: clusterTxs.length,
                total_amount: parseFloat(totalAmount.toFixed(2)),
                velocity_multiplier: parseFloat(velocityMultiplier.toFixed(1)),
                temporal_coordination: parseFloat(syncRatio.toFixed(2)),
                created_at: now,
                signals: {
                    shared_device: sharedDeviceScore,
                    shared_ip: sharedIpScore,
                    temporal_coordination: temporalScore,
                    velocity: velocityScore,
                    merchant_coordination: merchScore,
                    amount_similarity: amountScore
                }
            };

            // Deduplicate rings in this cycle
            if (!ringsThisCycle.some(r => r.ring_id === ringId)) {
                ringsThisCycle.push(ringOutput);
            }
        }

        // Publish new or escalated rings
        for (const ring of ringsThisCycle) {
            const prev = this.activeRings.get(ring.ring_id);
            if (!prev || ring.risk_score > prev.risk_score) {
                this.activeRings.set(ring.ring_id, ring);
                if (ring.risk_score >= 60) {
                    const event_type = ring.risk_score >= 80 ? 'CRITICAL_RING_DETECTED' : 'RING_DETECTED';
                    this.redisPublisher.publish('ring_alerts', JSON.stringify({
                        event_type,
                        ring_id: ring.ring_id,
                        risk_score: ring.risk_score,
                        severity: ring.status
                    }));
                }
            }
        }

        return ringsThisCycle;
    }
}
