import { Redis } from 'ioredis';

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();
const REDIS_STREAM_KEY = 'transactions:stream';

interface Transaction {
    transaction_id: string;
    account_id: string;
    device_id: string;
    ip_address: string;
    merchant_id: string;
    amount: number;
    timestamp: number;
    type: 'normal' | 'spike_attack' | 'credential_stuffing';
}

async function simulateNormalTraffic() {
    const tx: Transaction = {
        transaction_id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        account_id: `acc_${Math.floor(Math.random() * 1000)}`,
        device_id: `dev_${Math.floor(Math.random() * 500)}`,
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        merchant_id: `merch_${Math.floor(Math.random() * 100)}`,
        amount: Math.random() * 500 + 10,
        timestamp: Date.now(),
        type: 'normal'
    };
    await redis.xadd(REDIS_STREAM_KEY, '*', 'data', JSON.stringify(tx));
    console.log(`[Normal] Sent tx: ${tx.transaction_id} for acc: ${tx.account_id}`);
}

async function simulateSpikeAttack() {
    const account_id = `acc_compromised_${Math.floor(Math.random() * 100)}`;
    console.log(`\n🚨 [SPIKE ATTACK START] Target: ${account_id}\n`);
    
    for (let i = 0; i < 20; i++) {
        const tx: Transaction = {
            transaction_id: `tx_atk_${Date.now()}_${i}`,
            account_id,
            device_id: `dev_attacker_${Math.floor(Math.random() * 5)}`,
            ip_address: `10.0.0.${Math.floor(Math.random() * 255)}`,
            merchant_id: `merch_cashout_${Math.floor(Math.random() * 10)}`,
            amount: Math.random() * 5000 + 1000,
            timestamp: Date.now(),
            type: 'spike_attack'
        };
        await redis.xadd(REDIS_STREAM_KEY, '*', 'data', JSON.stringify(tx));
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

async function simulateAbuseRing() {
    const ringDevice = `dev_ring_${Math.floor(Math.random() * 100)}`;
    console.log(`\n🕸️  [ABUSE RING START] Device: ${ringDevice}\n`);
    
    // Simulate 5 different accounts rapidly cashing out via the same device
    for (let i = 0; i < 5; i++) {
        const tx: Transaction = {
            transaction_id: `tx_ring_${Date.now()}_${i}`,
            account_id: `acc_ring_member_${Math.floor(Math.random() * 1000)}`, // different accounts
            device_id: ringDevice, // SAME device
            ip_address: `192.168.200.1`, // same IP
            merchant_id: `merch_target_${Math.floor(Math.random() * 10)}`,
            amount: Math.random() * 1000 + 500,
            timestamp: Date.now(),
            type: 'credential_stuffing'
        };
        await redis.xadd(REDIS_STREAM_KEY, '*', 'data', JSON.stringify(tx));
        await new Promise(resolve => setTimeout(resolve, 100)); // slightly slower than spike
    }
}

async function startSimulator() {
    console.log('Transaction Simulator Started...');
    
    setInterval(() => {
        simulateNormalTraffic().catch(console.error);
    }, 1000);
    
    setInterval(() => {
        const rand = Math.random();
        if (rand > 0.8) { 
            simulateSpikeAttack().catch(console.error);
        } else if (rand > 0.6) {
            simulateAbuseRing().catch(console.error);
        }
    }, 10000);
}

startSimulator();
