# 🧠 Codebase Evolution Predictor

> **Predict where a software codebase is heading before it gets there.**

Codebase Evolution Predictor is an **AI-powered software engineering intelligence platform** that analyzes a repository's **code structure, Git history, developer activity, and dependency graph** to predict which parts of a codebase are likely to become problematic in future development.

Instead of simply detecting bugs that already exist, the system attempts to answer:

> **"Which files, functions, or modules are most likely to experience bugs, high churn, complexity growth, or refactoring pressure in the future — and why?"**

The project combines **Machine Learning, Deep Learning, Graph Neural Networks, Software Repository Mining, LLMs, and Agentic AI** into a single system.

---

## 🚀 Why This Project?

Traditional static analysis tells developers:

> "This code has high complexity."

Traditional monitoring tells developers:

> "This module already has many bugs."

Codebase Evolution Predictor aims to go one step further:

> **"Based on how this codebase has evolved historically, this module is likely to become a problem soon."**

The system learns from the **temporal evolution of software repositories** and combines that information with the structural relationships between components.

---

# ✨ Key Features

### 🔮 1. Code Evolution Prediction

Predict future risk for:

* 🐛 Bug-prone files
* 🔥 High-churn modules
* 📈 Complexity growth
* ♻️ Refactoring candidates
* 🔗 Dependency-risk hotspots
* 👨‍💻 Development bottlenecks

Example:

```text
payment/service.py       91% Risk
auth/controller.py       84% Risk
database/connection.py   78% Risk
user/model.py            19% Risk
```

---

### 🧬 2. Repository Intelligence

Analyze:

* Git commits
* Pull requests
* File history
* Authors
* Lines added/deleted
* Commit frequency
* Bug-fix commits
* File age
* Code complexity
* Dependency relationships

---

### 🕸️ 3. Code Dependency Graph

Represent the repository as a graph.

```text
                auth.py
               /       \
              ↓         ↓
         user.py      session.py
              \         /
               ↓       ↓
             database.py
                  ↓
               cache.py
```

Each node represents a software component and edges represent relationships such as:

* imports
* function calls
* inheritance
* dependencies

This graph can be used by a **Graph Neural Network (GNN)** to understand how changes propagate through a codebase.

---

### 🤖 4. AI Investigation Agents

The ML model predicts a risk score.

The agents investigate **why**.

```text
ML Model
   ↓
Risk Score
   ↓
Investigator Agent
   ↓
┌───────────────────────┐
│ Git History           │
│ Code Structure        │
│ Dependency Graph      │
│ Recent Changes        │
│ Bug History           │
└───────────────────────┘
   ↓
AI Explanation
```

Example:

> `payment/service.py` has an 87% evolution-risk score because its change frequency increased by 42%, its dependency count increased, and multiple recent commits modified shared payment state.

---

### 🛠️ 5. Refactoring Recommendations

The system can identify components that may benefit from refactoring.

Example:

```text
Component:
PaymentService

Problems:
- High cyclomatic complexity
- High coupling
- Rapid growth
- Frequent modifications
- Multiple dependent modules

Recommendation:
Split PaymentService into:

PaymentProcessor
PaymentValidator
PaymentRepository
PaymentEventHandler
```

---

### 📊 6. Codebase Health Dashboard

The dashboard provides:

* Repository health score
* Risk heatmap
* File-level risk
* Dependency graph
* Commit activity
* Risk evolution over time
* Predicted hotspots
* AI explanations
* Refactoring recommendations

---

# 🏗️ System Architecture

```text
                         GitHub Repository
                                │
                ┌───────────────┴───────────────┐
                │                               │
           Git History                     Source Code
                │                               │
                ↓                               ↓
        Repository Miner                  AST Parser
                │                               │
                └───────────────┬───────────────┘
                                ↓
                       Feature Extraction
                                │
                ┌───────────────┴───────────────┐
                ↓                               ↓
        Temporal Features                Dependency Graph
                │                               │
                │                               ↓
                │                              GNN
                │                               │
                └───────────────┬───────────────┘
                                ↓
                         Risk Prediction
                                │
                                ↓
                     ┌─────────────────────┐
                     │ Evolution Risk      │
                     │ Bug Risk            │
                     │ Churn Prediction     │
                     │ Refactoring Risk    │
                     └─────────────────────┘
                                │
                                ↓
                        Agentic Analysis
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
         Investigator       History Agent    Dependency
             Agent                              Agent
                │               │               │
                └───────────────┼───────────────┘
                                ↓
                       Explanation + Action
                                │
                    ┌───────────┴───────────┐
                    ↓                       ↓
              Dashboard              GitHub PR
```

---

# 🧠 Machine Learning Pipeline

## 1. Feature Extraction

For every file/component:

### Git Features

```text
commit_frequency
changes_last_7_days
changes_last_30_days
lines_added
lines_deleted
number_of_authors
file_age
bug_fix_count
```

### Code Features

```text
cyclomatic_complexity
lines_of_code
function_count
class_count
dependency_count
inheritance_depth
```

### Historical Features

```text
previous_bug_count
previous_refactoring_count
historical_churn
time_since_last_change
```

---

## 2. Prediction Target

The model predicts whether a component will experience a significant event within a future time window.

For example:

```text
Input:
Repository state at commit T

Target:
Did this component experience a bug-inducing
change within the next N commits?
```

This turns the problem into a **temporal prediction task**.

---

# 🧠 ML / DL Models

The project can use multiple models.

### Baseline

* Logistic Regression
* Random Forest
* XGBoost

### Deep Learning

* MLP
* LSTM/Temporal model

### Graph Learning

* Graph Neural Network
* GraphSAGE
* GAT

The baseline model provides a benchmark against which more advanced approaches can be evaluated.

---

# 🤖 Agent Architecture

The agentic layer is responsible for **investigation and reasoning**, not replacing the ML model.

### Investigator Agent

Analyzes:

* recent commits
* code changes
* Git blame
* dependency relationships
* previous bugs

### Dependency Agent

Investigates:

> "What happens if this component changes?"

### History Agent

Analyzes:

> "How has this component evolved?"

### Refactoring Agent

Analyzes:

> "What architectural changes could reduce future risk?"

### Report Agent

Combines the findings into a concise engineering report.

---

# 📈 Example Output

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        CODEBASE EVOLUTION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository:
example-project

Overall Health:
72 / 100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 HIGH-RISK COMPONENTS

1. payment/service.py
   Risk: 91%

2. auth/controller.py
   Risk: 84%

3. database/connection.py
   Risk: 78%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PREDICTED EVOLUTION

payment/service.py

Expected churn: HIGH
Complexity growth: HIGH
Dependency risk: HIGH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧠 AI ANALYSIS

The component has experienced significant
recent churn and increasing coupling.

Three recent bug-fix commits modified shared
payment state.

The component is connected to 7 downstream
modules.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 RECOMMENDATION

Consider splitting PaymentService into
smaller domain-specific components.

Estimated affected modules: 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

# 🧪 Evaluation

The system will be evaluated using historical repository data.

The basic methodology:

```text
Repository History

       ↓

Train on:
Commit 1 → Commit N

       ↓

Predict:
Commit N+1 → Commit N+k

       ↓

Compare with:
Actual future changes
```

### Metrics

Depending on the prediction task:

* Precision
* Recall
* F1 Score
* ROC-AUC
* PR-AUC
* Top-K Recall
* Calibration
* False Positive Rate

For ranking risky files:

* Precision@K
* Recall@K
* NDCG

---

# 🛠️ Tech Stack

## Machine Learning

* Python
* PyTorch
* Scikit-learn
* XGBoost
* NetworkX

## Code Intelligence

* Tree-sitter
* GitPython
* AST analysis

## AI

* LLM APIs
* LangGraph / Agent framework
* Embeddings
* RAG

## Backend

* FastAPI
* PostgreSQL
* Redis

## Vector Search

* Qdrant / pgvector

## Frontend

* Next.js
* React
* Tailwind CSS
* D3.js / React Flow

## Infrastructure

* Docker
* GitHub API
* AWS

---

# 📂 Project Structure

```text
codebase-evolution-predictor/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── models/
│   └── database/
│
├── ml/
│   ├── preprocessing/
│   ├── features/
│   ├── training/
│   ├── evaluation/
│   └── inference/
│
├── graph/
│   ├── parser/
│   ├── builder/
│   └── models/
│
├── agents/
│   ├── investigator/
│   ├── dependency/
│   ├── history/
│   ├── refactoring/
│   └── report/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── dashboard/
│
├── data/
├── notebooks/
├── tests/
├── docker/
│
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/your-username/codebase-evolution-predictor.git

cd codebase-evolution-predictor
```

## Create Environment

```bash
python -m venv .venv

source .venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Environment Variables

Create `.env`:

```env
GITHUB_TOKEN=your_github_token

LLM_API_KEY=your_api_key

DATABASE_URL=postgresql://user:password@localhost:5432/codeevolution

REDIS_URL=redis://localhost:6379

VECTOR_DB_URL=your_vector_database_url
```

## Run Backend

```bash
uvicorn backend.main:app --reload
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔬 Research Questions

The project explores several interesting questions:

### RQ1

Can historical software evolution predict future bug-prone components?

### RQ2

Does incorporating dependency graphs improve prediction over traditional tabular ML?

### RQ3

Can temporal information improve code evolution prediction?

### RQ4

Can LLM agents explain ML-generated risk predictions in a useful way?

### RQ5

Can automated refactoring recommendations reduce predicted future risk?

---

# 🎯 Future Improvements

* [ ] Graph Transformer architecture
* [ ] Multi-repository pretraining
* [ ] Reinforcement learning for refactoring decisions
* [ ] Automatic GitHub PR generation
* [ ] CI/CD integration
* [ ] Real-time repository monitoring
* [ ] Learned code embeddings
* [ ] Developer-level collaboration modeling
* [ ] Cross-language repository support
* [ ] Automated refactoring impact simulation

---

# 🌟 What Makes This Different?

Most AI-powered developer tools focus on:

```text
"Fix this bug."
```

Codebase Evolution Predictor focuses on:

```text
"Predict what is likely to become a problem
before it actually becomes one."
```

It combines:

```text
Software Repository Mining
        +
Machine Learning
        +
Deep Learning
        +
Graph Neural Networks
        +
Temporal Modeling
        +
LLM Reasoning
        +
Agentic AI
        +
Software Architecture
```

The goal is not to build another AI coding chatbot.

The goal is to build an **intelligent early-warning system for software evolution.**

---

# 👨‍💻 Team

Built as a collaborative research/engineering project by:

**Saksham Sharma**

---

# 📜 License

This project is licensed under the MIT License.
