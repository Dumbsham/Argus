# 🚨 FRAUD SPIKE DETECTOR + ABUSE RING SENTINEL

## Master Development Plan

### Current Status

✅ ML Spike Detection Pipeline already completed.

Existing ML pipeline:

* PaySim dataset
* Historical/leakage-safe feature engineering
* Rolling velocity & volume features
* Synthetic spike injection
* Z-Score baseline
* Isolation Forest
* LightGBM
* Cost-sensitive threshold tuning
* Business-cost evaluation

**Best model → LightGBM**

---

# PHASE 1 — FREEZE & PACKAGE EXISTING ML

Do NOT rebuild the existing ML pipeline.

Convert it into a reusable ML service.

```text
Existing ML Pipeline
        ↓
Model Artifact
        ↓
Feature Contract
        ↓
Python ML Service
        ↓
/predict API
```

ML service responsibilities:

```text
Input:
transaction + engineered features

Output:
{
  fraud_probability,
  risk_score,
  model_version
}
```

Also expose:

```text
/model/info
/model/health
/predict
```

---

# PHASE 2 — REAL-TIME TRANSACTION SYSTEM

Build the streaming layer in TypeScript.

```text
Transaction Simulator
        ↓
Redis Streams
        ↓
Node.js Event Consumer
        ↓
Feature Engine
        ↓
ML Service
```

The simulator should generate:

### Normal traffic

* Normal transaction velocity
* Normal amounts
* Normal account behavior

### Attack scenarios

* Velocity spike
* Credential stuffing
* Coordinated cash-out
* Device reuse
* IP reuse
* Abuse ring
* Merchant targeting

---

# PHASE 3 — REAL-TIME FEATURE ENGINE

Node.js maintains live state for each entity.

```text
Account
Device
IP
Merchant
```

Calculate:

```text
transactions_10s
transactions_1m
transactions_5m

amount_sum_1m
amount_sum_5m

unique_devices
unique_ips
unique_merchants

time_since_previous_transaction

velocity_multiplier
amount_deviation
```

IMPORTANT:

All features must respect:

> **Only information available before/current transaction time can be used.**

No future information → no data leakage.

---

# PHASE 4 — LIGHTGBM REAL-TIME INFERENCE

Node.js sends the feature vector to Python.

```text
Node.js
   │
   │ feature vector
   ▼
Python ML Service
   │
   ▼
LightGBM
   │
   ▼
fraud_probability
```

Example:

```text
Fraud Probability: 0.94
```

The existing cost-sensitive threshold determines the operational decision.

---

# PHASE 5 — SPIKE DETECTION ENGINE

The existing ML system detects transaction-level/spike-level fraud.

Extend it into a realtime event detector.

```text
Normal
   ↓
Velocity increases
   ↓
Anomaly detected
   ↓
LightGBM confirms risk
   ↓
SPIKE ALERT
```

Each spike gets:

```text
Spike ID
Start Time
End Time
Peak TPS
Baseline TPS
Transaction Count
Amount
Affected Accounts
Affected Merchants
Risk Score
Severity
```

---

# PHASE 6 — ABUSE RING SENTINEL 🕸️

This is the NEW major component.

Build a dynamic transaction graph.

### Nodes

```text
Account
Device
IP
Merchant
Payment Instrument
```

### Edges

```text
Account ──uses──> Device
Account ──connects──> IP
Account ──pays──> Merchant
Account ──uses──> Payment Instrument
```

Example:

```text
        Device-17
        /       \
     ACC-1     ACC-2
       │         │
      IP-8      IP-8
       │         │
       └────┬────┘
            │
       Merchant-42
```

---

# PHASE 7 — RING DETECTION

Calculate graph + temporal features.

### Graph features

```text
degree
shared-device-count
shared-IP-count
shared-merchant-count
community-size
graph-density
centrality
```

### Temporal features

```text
transactions within 10 seconds
transactions within 1 minute
timestamp similarity
amount similarity
merchant sequence similarity
```

Use:

```text
Graph construction
      ↓
Community detection
      ↓
Suspicious cluster
      ↓
Ring scoring
      ↓
ABUSE RING
```

---

# PHASE 8 — RISK ENGINE

Create one unified risk engine.

Inputs:

```text
LightGBM score
Spike score
Behavioral score
Graph score
Temporal coordination
```

Output:

```text
FINAL RISK SCORE
```

Example:

```text
Risk Score: 94/100
Severity: CRITICAL
```

Store the individual contributions so the result is explainable.

---

# PHASE 9 — EXPLAINABILITY

For LightGBM:

**SHAP**

Display:

```text
WHY FLAGGED?

+28  Extreme transaction velocity
+22  High LightGBM fraud probability
+18  Device shared by 8 accounts
+15  IP shared by 5 accounts
+11  Temporal synchronization
```

The system should answer:

> **Why is this transaction/account/ring suspicious?**

---

# PHASE 10 — DATABASE

PostgreSQL stores persistent data.

Main tables:

```text
transactions
accounts
devices
ips
merchants

alerts
spikes
abuse_rings

ring_members
graph_edges

risk_scores
investigations
```

Redis handles realtime state.

PostgreSQL handles historical/persistent state.

---

# PHASE 11 — NODE.JS BACKEND

Responsibilities:

```text
REST APIs
WebSockets
Authentication
Alert management
Transaction queries
Investigation APIs
Risk APIs
Ring APIs
Dashboard APIs
```

Realtime:

```text
Redis
  ↓
Node.js
  ↓
WebSocket
  ↓
Next.js
```

---

# PHASE 12 — NEXT.JS COMMAND CENTER

## /dashboard

Show:

```text
LIVE TPS
Transactions
Active Spikes
Active Rings
Critical Alerts
Money At Risk
Detection Latency
ML Latency
```

Charts:

```text
Transaction velocity
Risk distribution
Fraud probability
Transaction volume
Alerts over time
```

---

## /spikes

Show:

```text
Active spikes
Historical spikes
Velocity graphs
Affected entities
Risk scores
```

Click spike → investigation.

---

## /rings

Interactive graph:

```text
Accounts
   ↕
Devices
   ↕
IPs
   ↕
Merchants
```

Click node → show its connections.

---

## /alerts

SOC-style alert queue:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

Filter by:

```text
severity
risk
time
entity
attack type
```

---

## /investigation/:id

Most important page.

Show:

```text
RISK SCORE
WHY FLAGGED
TRANSACTION TIMELINE
NETWORK GRAPH
CONNECTED ACCOUNTS
DEVICES
IPS
MERCHANTS
MODEL EXPLANATION
```

---

# PHASE 13 — REALTIME DEMO

The final demo should work like this:

```text
START SYSTEM
     ↓
Normal traffic
     ↓
Dashboard shows normal baseline
     ↓
INJECT ATTACK
     ↓
Transaction velocity explodes
     ↓
Spike detector fires
     ↓
LightGBM scores transactions
     ↓
Risk engine generates alert
     ↓
Graph begins connecting entities
     ↓
Suspicious community discovered
     ↓
ABUSE RING CREATED
     ↓
Dashboard updates LIVE
     ↓
Analyst opens investigation
     ↓
System explains the attack
```

---

# PHASE 14 — EVALUATION

## ML Performance

Measure:

```text
Precision
Recall
F1
ROC-AUC
PR-AUC
Confusion Matrix
```

But most importantly:

```text
Expected Financial Cost
```

Compare:

```text
Z-Score
Isolation Forest
LightGBM
```

using the existing results.

---

## Realtime Performance

Measure:

```text
Events/sec
Average inference latency
P95 latency
Detection latency
WebSocket latency
```

---

## Ring Detection

Measure:

```text
Ring detection precision
Ring detection recall
Community quality
False positive rate
```

---

# PHASE 15 — DEPLOYMENT

Dockerize:

```text
Next.js
Node.js API
Node.js Workers
Redis
PostgreSQL
Python ML Service
```

Architecture:

```text
              INTERNET
                  │
                  ▼
             NEXT.JS
                  │
                  ▼
             NODE API
             /       \
            /         \
        Redis       PostgreSQL
          │
          ▼
       Workers
          │
          ▼
      ML Service
        Python
          │
          ▼
       LightGBM
```

---

# 🏆 FINAL PROJECT

The finished system should demonstrate:

### ML

* LightGBM fraud detection
* Cost-sensitive threshold optimization
* Leakage-safe feature engineering
* SHAP explainability

### Anomaly Detection

* Statistical baseline
* Isolation Forest
* Spike/burst detection

### Graph Intelligence

* Dynamic transaction graph
* Community detection
* Abuse-ring identification
* Network risk scoring

### Realtime Engineering

* Redis Streams
* Node.js workers
* WebSockets
* Live dashboard

### Full Stack

* Next.js
* TypeScript
* Node.js
* PostgreSQL
* Python ML microservice

### Final intelligence flow

TRANSACTION
↓
FEATURES
↓
LIGHTGBM
↓
SPIKE DETECTION
↓
GRAPH ANALYSIS
↓
ABUSE RING
↓
RISK ENGINE
↓
EXPLANATION
↓
REAL-TIME ALERT
↓
ANALYST INVESTIGATION
