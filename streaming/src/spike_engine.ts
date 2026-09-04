export interface Spike {
    id: string;
    startTime: number;
    endTime: number | null;
    peakTps: number;
    baselineTps: number;
    transactionCount: number;
    amount: number;
    affectedAccounts: Set<string>;
    affectedMerchants: Set<string>;
    riskScore: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SpikeEngine {
    activeSpikes: Map<string, Spike> = new Map();
    historicalSpikes: Spike[] = [];

    // Track global TPS
    txTimestamps: number[] = [];

    private getTps(now: number): number {
        this.txTimestamps = this.txTimestamps.filter(t => now - t <= 1000);
        return this.txTimestamps.length;
    }

    processTransaction(tx: any, isAlert: boolean, riskScore: number): Spike | null {
        const now = Date.now();
        this.txTimestamps.push(now);
        const currentTps = this.getTps(now);

        // Group spike by target (merchant or account). Let's use a global "system_spike" if many alerts happen,
        // or specifically by affected account/merchant. For now, simple account-based spike tracking.
        const spikeKey = `spike_acc_${tx.account_id}`;
        let spike = this.activeSpikes.get(spikeKey);

        if (isAlert) {
            if (!spike) {
                // Start new spike
                spike = {
                    id: `spk_${now}_${Math.floor(Math.random()*1000)}`,
                    startTime: now,
                    endTime: null,
                    peakTps: currentTps,
                    baselineTps: Math.max(1, currentTps - 1),
                    transactionCount: 0,
                    amount: 0,
                    affectedAccounts: new Set(),
                    affectedMerchants: new Set(),
                    riskScore: riskScore,
                    severity: 'HIGH'
                };
                this.activeSpikes.set(spikeKey, spike);
                console.log(`\n🚨 [SPIKE DETECTED] New Spike ${spike.id} started affecting ${tx.account_id}!`);
            }
            
            // Update active spike
            spike.transactionCount++;
            spike.amount += tx.amount;
            spike.affectedAccounts.add(tx.account_id);
            spike.affectedMerchants.add(tx.merchant_id);
            if (currentTps > spike.peakTps) spike.peakTps = currentTps;
            spike.riskScore = Math.max(spike.riskScore, riskScore);

            if (spike.riskScore > 90) spike.severity = 'CRITICAL';
            
            return spike;
        } else {
            // If normal transaction but there is an active spike, it might be ending
            if (spike) {
                if (now - spike.startTime > 5000) { // If it survives 5s of normal traffic, close it.
                    spike.endTime = now;
                    this.historicalSpikes.push(spike);
                    this.activeSpikes.delete(spikeKey);
                    console.log(`\n✅ [SPIKE RESOLVED] Spike ${spike.id} ended. Total Amount: $${spike.amount.toFixed(2)}\n`);
                }
            }
        }
        
        return null;
    }
}
