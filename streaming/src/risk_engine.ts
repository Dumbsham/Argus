export interface RiskInputs {
    transactionId: string;
    mlScore: number;       
    spikeScore: number;    
    graphScore: number;    
    temporalScore: number; 
}

export interface RiskResult {
    transactionId: string;
    finalScore: number;
    severity: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
    reasons: Array<{ reason: string, contribution: number }>;
}

export class RiskEngine {
    evaluate(inputs: RiskInputs): RiskResult {
        let finalScore = 0;
        const reasons: Array<{ reason: string, contribution: number }> = [];
        
        // 1. ML Score (Fraud Probability) - Max 40 points
        if (inputs.mlScore > 0) {
            let mlContrib = inputs.mlScore * 0.4;
            finalScore += mlContrib;
            if (mlContrib >= 10) {
                reasons.push({ reason: "High LightGBM fraud probability", contribution: mlContrib });
            }
        }
        
        // 2. Spike Score (Velocity/Volume) - Max 30 points
        if (inputs.spikeScore > 0) {
            let spikeContrib = inputs.spikeScore * 0.3;
            finalScore += spikeContrib;
            if (spikeContrib >= 10) {
                reasons.push({ reason: "Extreme transaction velocity (Spike)", contribution: spikeContrib });
            }
        }
        
        // 3. Graph/Ring Score (Shared Infrastructure) - Max 30 points
        if (inputs.graphScore > 0) {
            let graphContrib = inputs.graphScore * 0.3;
            finalScore += graphContrib;
            if (graphContrib >= 10) {
                reasons.push({ reason: "Suspicious shared infrastructure (Abuse Ring)", contribution: graphContrib });
            }
        }
        
        // 4. Temporal Coordination (Synchronization) - Max 10 bonus points
        if (inputs.temporalScore > 0) {
            let tempContrib = inputs.temporalScore * 0.1;
            finalScore += tempContrib;
            if (tempContrib >= 5) {
                reasons.push({ reason: "High temporal synchronization across accounts", contribution: tempContrib });
            }
        }
        
        finalScore = Math.min(100, Math.max(0, finalScore));
        
        let severity: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'NORMAL';
        if (finalScore >= 80) severity = 'CRITICAL';
        else if (finalScore >= 60) severity = 'HIGH';
        else if (finalScore >= 40) severity = 'ELEVATED';
        
        // Sort explanations by highest contribution
        reasons.sort((a, b) => b.contribution - a.contribution);
        
        return {
            transactionId: inputs.transactionId,
            finalScore: Math.round(finalScore),
            severity,
            reasons
        };
    }
}
