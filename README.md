<img width="1535" height="837" alt="Screenshot 2026-09-05 232340" src="https://github.com/user-attachments/assets/34d75a4f-e600-4955-a43c-48f66c71b748" />
<img width="1535" height="842" alt="Screenshot 2026-09-05 232542" src="https://github.com/user-attachments/assets/77214647-8ae9-4c81-b906-96450ffbac64" />
<img width="1535" height="837" alt="Screenshot 2026-09-05 232523" src="https://github.com/user-attachments/assets/ef589653-970a-463f-ac04-6ad6f379e401" />
<img width="1535" height="838" alt="Screenshot 2026-09-05 232455" src="https://github.com/user-attachments/assets/a0e4408c-4467-41bd-8b7d-652fae48a6bb" />
<img width="1531" height="836" alt="Screenshot 2026-09-05 232422" src="https://github.com/user-attachments/assets/d7a0eead-f236-48fc-8663-0f0da8c0f507" />
<img width="1535" height="840" alt="Screenshot 2026-09-05 232408" src="https://github.com/user-attachments/assets/977494f4-1986-427f-a27e-d3f9e5cb4a52" />
# StackAudit

> **AI-Native Open-Source Contribution Intelligence Platform**
> 
> *Detects developer technical DNA, matches open-source contribution opportunities with deterministic scoring and Groq/Graphify AI synthesis, performs deep repository architecture analysis, and guides developers from issue discovery to merged pull requests.*

---

## 📑 Table of Contents

- [Executive Summary](#executive-summary)
- [1. The Problem](#1-the-problem)
- [2. The Solution & Paradigm](#2-the-solution--paradigm)
- [3. Why StackAudit Outperforms Generic Discovery](#3-why-stackaudit-outperforms-generic-discovery)
- [4. End-to-End System Architecture](#4-end-to-end-system-architecture)
- [5. Core Algorithms & Intelligence Engine](#5-core-algorithms--intelligence-engine)
  - [A. Deterministic Match Scoring Engine (DMS 0–100%)](#a-deterministic-match-scoring-engine-dms-0100)
  - [B. 4-Stage Repository Analysis Pipeline (Graphify + Groq)](#b-4-stage-repository-analysis-pipeline-graphify--groq)
  - [C. Developer DNA Profiling & Signal Extraction](#c-developer-dna-profiling--signal-extraction)
  - [D. Bounded Contribution Lifecycle & State Machine](#d-bounded-contribution-lifecycle--state-machine)
  - [E. Truthful Daily Active-Time Signal](#e-truthful-daily-active-time-signal)
  - [F. Deterministic 9-Badge Developer Achievement Engine](#f-deterministic-9-badge-developer-achievement-engine)
- [6. Enterprise & Developer Features Showcase](#6-enterprise--developer-features-showcase)
  - [A. Find My Contribution & Discovery Feed](#a-find-my-contribution--discovery-feed)
  - [B. Contextual Contribution Workspace Drawer](#b-contextual-contribution-workspace-drawer)
  - [C. Real-Time Repository Analysis Pipeline](#c-real-time-repository-analysis-pipeline)
  - [D. 9-Badge Achievement Gallery & Baseline Alignment](#d-9-badge-achievement-gallery--baseline-alignment)
  - [E. Daily Activity Heatmap & Engagement Meter](#e-daily-activity-heatmap--engagement-meter)
  - [F. Enterprise Theme Engine (Dark, Light, System)](#f-enterprise-theme-engine-dark-light-system)
- [7. Visual Showcase & UI Gallery](#7-visual-showcase--ui-gallery)
- [8. Mathematical Formulation & Scoring Weights](#8-mathematical-formulation--scoring-weights)
- [9. Technology Stack](#9-technology-stack)
- [10. Monorepo Project Directory Structure](#10-monorepo-project-directory-structure)
- [11. Local Setup & Reproduction Guide](#11-local-setup--reproduction-guide)
- [12. Environment Configuration](#12-environment-configuration)
- [13. REST API Reference](#13-rest-api-reference)
- [14. Security, Governance & Architecture Rules](#14-security-governance--architecture-rules)
- [15. Automated Verification & Test Matrix](#15-automated-verification--test-matrix)
- [16. Future Roadmap](#16-future-roadmap)

---

## Executive Summary

- **Product Category:** Developer Infrastructure / Open-Source Contribution Intelligence
- **Core Paradigm:** **Hybrid Deterministic-AI Architecture** — Deterministic algorithmic services evaluate technology overlap, repository health, maintainer activity, PR acceptance rates, and difficulty constraints, while tightly-bounded AI services (Graphify AST knowledge graphs + Groq LLM synthesis) provide contextual codebase understanding, target file identification, and step-by-step implementation guidance.
- **Mission:** Eliminate the friction of open-source contributions. Move developers from *"I want to contribute but don't know where to start"* to *"I understand the codebase and know exactly what to modify."*

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           StackAudit Core Loop                              │
│                                                                             │
│   [ Developer Profile ] ──▶ [ Ingest GitHub DNA & Preferences ]             │
│                                           │                                 │
│                                           ▼                                 │
│   [ Candidate Discovery ] ──▶ [ Ingest & Index Open GitHub Issues ]         │
│                                           │                                 │
│                                           ▼                                 │
│   [ Deterministic Matching ] ──▶ [ Multi-Factor Scoring (0–100%) ]          │
│                                           │                                 │
│                                           ▼                                 │
│   [ Architectural Analysis ] ──▶ [ 4-Stage Pipeline: Graphify + Groq ]      │
│                                           │                                 │
│                                           ▼                                 │
│   [ Contribution Workspace ] ──▶ [ Target Files + Actionable Guidance ]     │
│                                           │                                 │
│                                           ▼                                 │
│   [ Lifecycle Tracking ] ──▶ [ Started ──▶ PR Submitted ──▶ Merged ]        │
│                                           │                                 │
│                                           ▼                                 │
│   [ Developer Achievements ] ──▶ [ Badges + Truthful Active Time ]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. The Problem

Contributing to open-source software is widely recognized as the most effective path to technical mastery and career advancement. Yet over **80% of aspiring contributors drop out** before submitting their first pull request.

The breakdown occurs across four critical failure points:

1. **The Discovery Paradox:** Developers search GitHub using generic labels (`good first issue`, `help wanted`). They encounter either trivial documentation typos or stale, unmaintained repositories where issues sit unattended for years.
2. **Context Blindness:** A developer might know TypeScript and React, but opening a 100,000-line unfamiliar codebase is paralyzing. They do not know which modules are involved, how data flows through the application, or where to make changes.
3. **Skill & Goal Mismatch:** Traditional search engines treat a developer's past as fixed. They ignore **what the developer is currently learning** (e.g., a Python engineer transitioning to Go or a frontend developer learning backend architectures).
4. **Maintainer Responsiveness Void:** Developers spend hours crafting pull requests only to discover that the repository has a 5% PR merge rate and maintainers have been inactive for six months.

---

## 2. The Solution & Paradigm

StackAudit re-architects open-source contribution into a **closed-loop intelligence and preparation journey**:

$$\text{DISCOVER} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{MATCH} \longrightarrow \text{PREPARE} \longrightarrow \text{CONTRIBUTE}$$

- **Personalization Before Search:** Constructs the developer's technical DNA from observed GitHub activity (languages, repositories, commits) and explicit current learning goals.
- **Deterministic Match Scoring (DMS):** Evaluates issues against a calibrated 6-factor mathematical model rather than generic keyword searches.
- **Automated Repository Intelligence:** Runs a 4-stage pipeline combining **Graphify AST knowledge graphs** and **Groq (`openai/gpt-oss-120b`)** to inspect codebase architecture, identify target files, and synthesize implementation approaches.
- **Lifecycle Accountability:** Tracks contributions through a formal state machine (`DISCOVERED` $\to$ `SAVED` $\to$ `ANALYZED` $\to$ `STARTED` $\to$ `PR_SUBMITTED` $\to$ `MERGED`).
- **Truthful Developer Proof:** Measures engagement through a **privacy-respecting, focus-verified active-time signal** and grants deterministic achievement badges.

---

## 3. Why StackAudit Outperforms Generic Discovery

| Capability | Generic GitHub Search / Discovery Bots | StackAudit Contribution Intelligence |
| :--- | :--- | :--- |
| **Search Paradigm** | Keyword & label matching (`good-first-issue`) | Multi-dimensional scoring combining developer DNA + learning goals |
| **Codebase Understanding** | None. Developer must read raw source code | Automated 4-stage pipeline with Graphify knowledge graphs |
| **Maintainer Signal** | Unchecked open issue counts | Deterministic PR acceptance rate, activity level, and issue freshness filters |
| **Target Scope** | Entire repository | Precise relevant files identified before code modification |
| **AI Safety Model** | Unbounded generative hallucinations | Tightly bounded: deterministic search + Graphify AST facts + Groq synthesis |
| **Developer Tracking** | None | 7-stage lifecycle state machine with GitHub PR linking |
| **Engagement Metric** | Unverified vanity streaks | Privacy-first, active-time heartbeats (strict tab visibility + window focus) |
| **Achievements** | Generic commit counts | 9 deterministic contribution badges derived strictly from database events |

---

## 4. End-to-End System Architecture

StackAudit is engineered as a **modular monolith** within a high-performance **Turborepo monorepo**, strictly separating concerns across 5 architectural tiers:

```text
═══════════════════════════════════════════════════════════════════════════════════
TIER 1 — PRESENTATION LAYER (Next.js 16 · React 19 · Tailwind CSS · shadcn/ui)
═══════════════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🖥️ Modern Developer Workspace                        │
│                                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐  │
│  │ 🧭 Discovery    │ │ 📁 Saved        │ │ 📊 Profile      │ │ ⚙️ Theme   │  │
│  │    Parameters   │ │    Workspace    │ │    & Activity   │ │   Studio  │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └───────────┘  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │ ⚡ 4-Stage      │ │ 🏆 9-Badge      │ │ 📈 30-Day / 365 │                │
│  │    Analysis Hub │ │    Gallery      │ │    Heatmaps     │                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST (Credentials & Session Cookie)
                                       ▼
═══════════════════════════════════════════════════════════════════════════════════
TIER 2 — API GATEWAY & APPLICATION MIDDLEWARE (Node.js · Express 5 · Better Auth)
═══════════════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────────────────────────┐
│  REQUEST ──▶ [ 🛡️ CORS Guard ] ──▶ [ 🍪 Cookie Parser ]                      │
│          ──▶ [ 🔑 Better Auth Session ] ──▶ [ 🚦 Rate Limiter ]             │
│          ──▶ [ ✅ Zod Request Validator ] ──▶ [ 🎛️ Feature Controllers ]    │
└──────────────────┬───────────────┬───────────────┬───────────────┬──────────┘
                   │               │               │               │
                   ▼               ▼               ▼               ▼
═══════════════════════════════════════════════════════════════════════════════════
TIER 3 — DOMAIN SERVICES (Core Business Logic & Intelligence)
═══════════════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────┐       ┌───────────────────────────────────┐  │
│  │ 📐 MATCHING ENGINE        │       │ 🔬 REPOSITORY ANALYSIS ENGINE     │  │
│  │ • 6-Factor DMS Algorithm  │       │ • 4-Stage Async Queue Pipeline    │  │
│  │ • Repo Language Proportions│      │ • Git Fetcher & Metadata Parser   │  │
│  │ • Framework Topic Scoring │       │ • AST Knowledge Graph Generator   │  │
│  └─────────────┬─────────────┘       └─────────────────┬─────────────────┘  │
│                │                                       │                    │
│                ▼                                       ▼                    │
│  ┌───────────────────────────┐       ┌───────────────────────────────────┐  │
│  │ 👤 DEVELOPER DNA SERVICE  │       │ ⏱️ ACTIVE TIME & BADGE SERVICE    │  │
│  │ • GitHub Ingest & Signals │       │ • Bounded 30s Focus Heartbeats    │  │
│  │ • Explicit Goal Store     │       │ • Deterministic 9-Badge Derivation│  │
│  └───────────────────────────┘       └───────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Prisma ORM 6
                                       ▼
═══════════════════════════════════════════════════════════════════════════════════
TIER 4 — PERSISTENCE & QUEUE LAYER (PostgreSQL · Redis · BullMQ)
═══════════════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌────────────┐  │
│  │ 👤 users     │ │ 📁 issue_matches │ │ 📄 github_issues │ │ ⚡ daily_  │  │
│  │    & profile │ │    & lifecycle   │ │    & raw metrics │ │    activity│  │
│  └──────────────┘ └──────────────────┘ └──────────────────┘ └────────────┘  │
│  ┌───────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │ 📦 repository_analyses (Context)  │ │ 🐇 BullMQ + Redis (Async Ingest) │  │
│  └───────────────────────────────────┘ └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
═══════════════════════════════════════════════════════════════════════════════════
TIER 5 — EXTERNAL AI & INTELLIGENCE INTEGRATIONS (Graphify · Groq · GitHub)
═══════════════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────┐       ┌───────────────────────────────────┐  │
│  │ 🐙 GitHub REST & GraphQL  │       │ 🧠 Groq LLM (openai/gpt-oss-120b) │  │
│  │ • Profile & Commit Signals│       │ • Structured Context Synthesis    │  │
│  │ • Issues & Label Metadata │       │ • Zero-Hallucination Guardrails   │  │
│  └───────────────────────────┘       └───────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 🕸️ Graphify Engine (AST-Level Knowledge Graph & Architectural Traversal│  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Core Algorithms & Intelligence Engine

### A. Deterministic Match Scoring Engine (DMS 0–100%)

The **Deterministic Match Score (DMS)** computes compatibility between a developer and an open-source issue across 6 weighted mathematical dimensions:

$$\text{DMS} = \text{clamp}_{0}^{100}\left( S_{\text{lang}} + S_{\text{fw}} + S_{\text{diff}} + S_{\text{type}} + S_{\text{activity}} + S_{\text{freshness}} + S_{\text{pr}}\right)$$

```text
┌──────────────────────────┬──────────┬──────────────────────────────────────────────────────────┐
│ Dimension                │ Weight   │ Evaluation Logic & Calibrated Heuristics                 │
├──────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 1. Language Match        │ 35%      │ Proportion of repo in developer languages:               │
│                          │          │ • >50% of codebase matching: +35 pts                     │
│                          │          │ • 10%–50% of codebase matching: +25 pts                  │
│                          │          │ • <10% presence: +15 pts                                 │
├──────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 1b. Framework Bonus      │ +10%     │ Matched via repo topics or description (React, Node, etc)│
├──────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 2. Difficulty Match      │ 20%      │ Exact match to preference (Beginner / Inter / Adv): +20  │
├──────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 3. Contribution Type     │ 15%      │ Preferred type (Bug Fix, Feature, Docs, Refactor): +15   │
├──────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 4. Repository Activity   │ 10%      │ Maintenance status: Active (+10), Moderate (+5), Low (+0)│
├──────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 5. Issue Freshness       │ 10%      │ Age/Staleness: Fresh (+10), Aging (+5), Stale (+0)       │
├──────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 6. PR Acceptance Rate    │ 10%      │ Historical merge rate: >70% (+10), >40% (+5), <40% (+0)  │
└──────────────────────────┴──────────┴──────────────────────────────────────────────────────────┘
```

### B. 4-Stage Repository Analysis Pipeline (Graphify + Groq)

When a developer explores an issue, StackAudit executes an automated 4-stage intelligence pipeline:

```text
Stage 1: REPOSITORY_LOADING
  │ • Shallow git clone / API tree fetch
  │ • Metadata validation (stars, open issues, commit SHA verification)
  ▼
Stage 2: ARCHITECTURE_ANALYZED
  │ • Graphify parses project directory tree & AST
  │ • Detects module boundaries, package managers, and core entrypoints
  ▼
Stage 3: RELEVANT_FILES_IDENTIFIED
  │ • Maps issue description tokens against AST symbols and filenames
  │ • Isolates 3–5 concrete target files needing inspection
  ▼
Stage 4: CONTEXT_SYNTHESIZED
    • Groq (openai/gpt-oss-120b) synthesizes factual Graphify context
    • Generates: Architecture Overview, Target Area Scope, What You'll Do
```

### C. Developer DNA Profiling & Signal Extraction

StackAudit constructs a unified developer profile across three signal tiers:

1. **Observed Signals (GitHub Truth):** Public repositories, primary languages, commit distribution, stars, PRs submitted, and organizations.
2. **Inferred Signals (Derived):** Frequently paired frameworks, architectural domains (Frontend, Backend, Systems), and issue difficulty sweet-spot.
3. **Explicit Signals (User Intent):** Current learning goals, desired contribution areas, and difficulty sliders configured in the discovery panel.

### D. Bounded Contribution Lifecycle & State Machine

Every contribution opportunity is tracked through an atomic state machine:

$$\text{DISCOVERED} \longrightarrow \text{VIEWED} \longrightarrow \text{SAVED} \longrightarrow \text{ANALYZED} \longrightarrow \text{STARTED} \longrightarrow \text{PR\_SUBMITTED} \longrightarrow \text{MERGED}$$

- **`STARTED`:** Triggers redirect to the GitHub issue and records active contribution status.
- **`PR_SUBMITTED`:** Links the developer's pull request URL to the opportunity record.
- **`MERGED`:** Terminal success state confirming contribution completion.

### E. Truthful Daily Active-Time Signal

StackAudit implements an honest active-time metric that measures **true developer engagement**, rejecting vanity metrics:

- **Strict Visibility Guard:** Only ticks when `document.visibilityState === "visible"`.
- **Strict Focus Guard:** Only ticks when `document.hasFocus() === true`. Background tabs, minimized windows, and idle periods are completely excluded.
- **PostgreSQL Persistence:** Aggregates time into `daily_activity` records under canonical UTC dates via atomic upserts.

### F. Deterministic 9-Badge Developer Achievement Engine

Badges are derived strictly from database events, preventing arbitrary gamification:

1. 🥇 **First Contribution:** Started your first contribution (`STARTED`).
2. 🚀 **First PR:** Submitted your first pull request (`PR_SUBMITTED`).
3. 🏆 **Merged:** First pull request merged into upstream repository (`MERGED`).
4. ⚡ **Contributor ×5:** Started 5 qualifying contributions.
5. 🌟 **Contributor ×10:** Started 10 qualifying contributions.
6. 🔍 **Issue Explorer:** Explored $\ge 5$ distinct open-source issues.
7. 🌐 **Repository Explorer:** Explored $\ge 5$ distinct open-source repositories.
8. 🧩 **Multi-Stack:** Contributed across $\ge 3$ distinct programming languages.
9. 🏛️ **Repository Contributor:** Reached `STARTED` across $\ge 3$ distinct repositories.

---

## 6. Enterprise & Developer Features Showcase

### A. Find My Contribution & Discovery Feed
- Configurable **Discovery Parameters** across 13+ languages (TypeScript, Python, Java, C++, Go, Rust, etc.) and 10+ frameworks (React, Next.js, Node.js, Spring Boot, etc.).
- Continuous difficulty slider from **Beginner** to **Intermediate** to **Advanced**.
- Real-time matching feed with match percentages, active maintainer signals, and issue tags.

### B. Contextual Contribution Workspace Drawer
- Side-by-side issue brief inspection without leaving the discovery feed.
- **At A Glance** metrics: Last updated, opened date, open issues count, PR acceptance rate, and maintainer activity.
- **Contribution Context Preview**: Architecture summary, Target Area files, and "What you'll do" guide.

### C. Real-Time Repository Analysis Pipeline
- Visual 4-stage pipeline execution with progress animation.
- Real-time radar visualization displaying AST entity parsing and dependency mapping.
- Factual code context generation powered by Graphify and Groq.

### D. 9-Badge Achievement Gallery & Baseline Alignment
- Mathematically centered **5-over-4 gallery layout**: Row 1 contains 5 equal badges; Row 2 centers 4 equal badges as a unified group.
- Uniform horizontal baseline alignment across artwork, title (wrapped up to 2 lines without aggressive ellipsis), description, status pill, and earned date.

### E. Daily Activity Heatmap & Engagement Meter
- 30-day interactive mini-strip on Profile with real-time active-time updates.
- 52-week (365-day) GitHub-style contribution calendar on `/activity`.
- Honest duration tooltips (e.g., `<1m active`, `24m active`, `2h 15m active`).

### F. Enterprise Theme Engine (Dark, Light, System)
- High-contrast developer Dark Mode.
- Clean, editorial Light Mode for documentation and daytime workflows.
- Native System preference synchronization via `next-themes`.

---

## 7. Visual Showcase & UI Gallery

> *Production UI screenshots captured from live StackAudit development builds.*

### A. Developer Profile & Achievement Operations Overview
*Comprehensive profile inspection showing developer DNA, contribution history metrics, 30-day active-time heatmap, tech stack badges, and the centered 9-badge achievement gallery.*

![Developer Profile Overview](docs/screenshots/01-profile-overview.png)

---

### B. Enterprise Theme Engine (Dark, Light & System)
*Theme management interface supporting seamless switching between high-contrast Dark Mode, technical Light Mode, and System synchronization.*

![Theme Settings](docs/screenshots/02-theme-settings.png)

---

### C. Find My Contribution (Discovery Engine with Language & Framework Filters)
*Interactive discovery feed with dynamic parameters for programming languages, framework tags, difficulty slider, and ranked matching candidate cards.*

![Find My Contribution](docs/screenshots/03-find-my-contribution.png)

---

### D. Contextual Contribution Workspace & At-a-Glance Repository Signals
*Split-view workspace drawer providing immediate repository health signals, PR acceptance rate, issue brief, architecture preview, and direct GitHub action buttons.*

![Contribution Workspace Drawer](docs/screenshots/04-contribution-workspace.png)

---

### E. 4-Stage Repository Analysis Pipeline in Progress
*Live execution of the deep repository intelligence engine showing staged progress across Loading, Architecture Inspection, Relevant Files Identification, and Context Generation.*

![Analysis Pipeline](docs/screenshots/05-analysis-pipeline.png)

---

## 8. Mathematical Formulation & Scoring Weights

The Deterministic Match Score (DMS) calculates opportunity compatibility through strict numerical criteria:

```text
       Factor              Range    Weight                       Formula / Criteria
────────────────────────────────────────────────────────────────────────────────────────────────
Language Overlap (L)       0 – 35    35%     Ratio = (Bytes of matched languages) / (Total repo bytes)
                                             Ratio > 0.50 ──▶ 35 pts
                                             Ratio > 0.10 ──▶ 25 pts
                                             Ratio > 0.00 ──▶ 15 pts

Framework Topic (F)        0 – 10    +10%    Matched framework keywords in repo topics / description

Difficulty Target (D)      0 – 20    20%     Issue difficulty matches developer preference:
                                             Exact match ──▶ 20 pts
                                             Mismatch    ──▶ 0 pts

Contribution Type (T)      0 – 15    15%     Issue type matches preferred type:
                                             Match       ──▶ 15 pts
                                             Mismatch    ──▶ 0 pts

Repository Activity (A)    0 – 10    10%     Repository commit & issue cadence:
                                             "active"    ──▶ 10 pts
                                             "moderate"  ──▶ 5 pts
                                             "inactive"  ──▶ 0 pts

Issue Freshness (S)        0 – 10    10%     Issue creation & update recency:
                                             "fresh"     ──▶ 10 pts
                                             "aging"     ──▶ 5 pts
                                             "stale"     ──▶ 0 pts

PR Acceptance Rate (P)     0 – 10    10%     Historical PR merge percentage:
                                             Rate > 70%  ──▶ 10 pts
                                             Rate > 40%  ──▶ 5 pts
                                             Rate <= 40% ──▶ 0 pts
────────────────────────────────────────────────────────────────────────────────────────────────
Total Compatibility Score  0 – 100  100%     Sum clamped to [0, 100]
```

---

## 9. Technology Stack

### Frontend Application
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) with React 19
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with custom developer design tokens
- **Component Primitives:** [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/) & [Tabler Icons](https://tabler-icons.io/)
- **Animation:** [Motion](https://motion.dev/) (Framer Motion)
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes)
- **Client Testing:** [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/)

### Backend REST API
- **Runtime:** [Node.js v20+ / v24 (ES Modules)](https://nodejs.org/)
- **Server Framework:** [Express 5](https://expressjs.com/)
- **Language:** [TypeScript 5.8+](https://www.typescriptlang.org/)
- **Database ODM:** [Prisma ORM 6](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Authentication:** [Better Auth](https://www.better-auth.com/) (GitHub OAuth & Google OAuth)
- **Queues & Jobs:** [BullMQ 5](https://docs.bullmq.io/) & [ioredis](https://github.com/redis/ioredis)
- **Validation:** [Zod 4](https://zod.dev/)

### Intelligence & Analysis Engines
- **Knowledge Graph:** [Graphify](https://github.com/) (AST Code Parsing & Architecture Graph)
- **LLM Synthesis:** [Groq API](https://groq.com/) (`openai/gpt-oss-120b` inference)
- **Google Gemini:** Semantic feature extraction
- **GitHub Ingestion:** [Octokit Rest API](https://github.com/octokit/rest.js/)

---

## 10. Monorepo Project Directory Structure

```text
StackAudit/
├── apps/
│   ├── api/                           # Express 5 Backend REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Database schema (users, matches, issues, activity)
│   │   │   └── migrations/            # SQL migration history
│   │   └── src/
│   │       ├── config/                # Environment variables & constants
│   │       ├── infrastructure/        # Prisma, Redis, BullMQ, and Better Auth setup
│   │       ├── middleware/            # Auth guards, error handlers, and loggers
│   │       ├── modules/
│   │       │   ├── activity/          # Heartbeat tracking & daily activity endpoints
│   │       │   ├── analysis/          # 4-stage pipeline, Graphify, and Groq synthesis
│   │       │   ├── auth/              # Better Auth controller & session helpers
│   │       │   ├── badges/            # Deterministic 9-badge calculation engine
│   │       │   ├── discovery/         # GitHub issue search & 6-factor DMS scoring
│   │       │   ├── github/            # Octokit client & repository ingestion
│   │       │   ├── health/            # Liveness & database connection checks
│   │       │   └── user/              # Developer DNA profile & preference routes
│   │       ├── app.ts                 # Express application configuration
│   │       └── server.ts              # HTTP server entrypoint
│   │
│   └── web/                           # Next.js 16 App Router Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── activity/          # 12-month calendar heatmap page
│       │   │   ├── analyze/           # Dedicated repository analysis workspace
│       │   │   ├── discover/          # Find My Contribution discovery page
│       │   │   ├── profile/           # Developer profile & badge showcase
│       │   │   ├── saved/             # Saved contributions workspace
│       │   │   ├── settings/          # Appearance & theme studio
│       │   │   └── layout.tsx         # Root layout with ActiveTimeTracker & ThemeProvider
│       │   ├── components/
│       │   │   ├── activity/          # ActiveTimeTracker & DailyActivityCard
│       │   │   ├── analysis/          # PipelineProgress, Radar visual, ContextGuide
│       │   │   ├── layout/            # Sidebar, Topbar, Shell, ProtectedRoute
│       │   │   ├── profile/           # ContributionBadges & BadgeArtwork
│       │   │   └── ui/                # shadcn/ui buttons, dialogs, sliders, badges
│       │   ├── lib/                   # API client, auth client, utils, formatters
│       │   └── globals.css            # Tailwind 4 design tokens & CSS variables
│       └── vitest.config.ts           # Vitest configuration for UI components
│
├── docs/                              # Technical specs, ADRs, handbook
├── graphify-out/                      # Graphify AST knowledge graph outputs
├── turbo.json                         # Turborepo task pipeline configuration
├── pnpm-workspace.yaml                # Monorepo workspace configuration
└── package.json                       # Root scripts (turbo dev, build, test)
```

---

## 11. Local Setup & Reproduction Guide

### Prerequisites
- **Node.js:** `v20.0.0` or higher (Node.js 22+ recommended)
- **Package Manager:** `pnpm` (`v9.0.0` or higher)
- **PostgreSQL:** Running locally on port `5432` (or a hosted PostgreSQL URI)
- **Redis:** Running locally on port `6379` (or Upstash Redis)

### Step 1: Clone Repository
```bash
git clone https://github.com/santlaj/StackAudit.git
cd StackAudit
```

### Step 2: Install Monorepo Dependencies
```bash
pnpm install
```

### Step 3: Configure Environment Variables
Copy example files and set credentials:
```bash
cp apps/api/.env.example apps/api/.env
```

### Step 4: Run Database Migrations & Generate Prisma Client
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
cd ../..
```

### Step 5: Start Development Servers
Start both backend (Port 4000) and frontend (Port 3000) concurrently via Turborepo:
```bash
pnpm dev
```

Open your browser at: **`http://localhost:3000`**

---

## 12. Environment Configuration

### Backend API Configuration (`apps/api/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Express listening port | `4000` |
| `NODE_ENV` | Application environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/stackaudit` |
| `REDIS_URL` | Redis instance connection string | `redis://localhost:6379` |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth encryption | `32-byte-hex-string` |
| `BETTER_AUTH_URL` | Base URL of auth service | `http://localhost:4000` |
| `GITHUB_CLIENT_ID` | GitHub OAuth application client ID | `Ov23lii...` |
| `GITHUB_CLIENT_SECRET`| GitHub OAuth application client secret | `f298e04...` |
| `GROQ_API_KEY` | Groq API Key for LLM inference | `gsk_...` |
| `GROQ_MODEL` | Groq model identifier | `openai/gpt-oss-120b` |
| `FRONTEND_URL` | Allowed CORS frontend origin | `http://localhost:3000` |

### Frontend Client Configuration (`apps/web/.env.local`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL for backend REST API | `http://localhost:4000` |

---

## 13. REST API Reference

### Health & Observability
- **`GET /api/health`** — Liveness probe, database connection status, and server uptime.

### Authentication & Developer Identity
- **`GET /api/auth/get-session`** — Better Auth session resolution.
- **`GET /api/users/profile`** — Fetch current developer profile, observed languages, and learning goals.
- **`PATCH /api/users/profile`** — Update focus areas, learning goals, and contribution preferences.
- **`GET /api/users/badges`** — Evaluates and returns all 9 deterministic achievement badges.

### Contribution Discovery & Matching
- **`GET /api/discovery/feed`** — Retrieves personalized, ranked contribution opportunities using the 6-factor DMS algorithm.
- **`POST /api/discovery/search`** — Executes parameter-constrained issue search across language, framework, and difficulty filters.
- **`PATCH /api/discovery/match/:matchId/status`** — Transitions opportunity status (`VIEWED`, `SAVED`, `STARTED`, `PR_SUBMITTED`, `MERGED`).

### Repository Intelligence & Analysis
- **`POST /api/analysis/:matchId/start`** — Triggers asynchronous 4-stage Graphify + Groq analysis.
- **`GET /api/analysis/:matchId`** — Polls status and retrieves generated architecture overview and relevant files.

### Truthful Daily Active Time
- **`POST /api/activity/heartbeat`** — Records a bounded 30s active-time heartbeat for authenticated, focused sessions.
- **`GET /api/activity/daily?days=30`** — Returns daily active-time records for heatmap rendering.

---

## 14. Security, Governance & Architecture Rules

- **Zero Arbitrary AI Inventions:** The system never allows an unrestricted AI agent to invent issues or repositories. AI is strictly bounded to contextualizing pre-validated GitHub records.
- **Observed vs. Inferred Separation:** Inferred developer skills are always explicitly labeled and never presented as verified facts.
- **No Hallucinated Quantitative Signals:** Quantitative metrics (stars, PR acceptance rates, commit dates) are derived strictly from deterministic GitHub metadata.
- **Privacy-First Tracking:** Active time is measured entirely through local focus events and aggregated into bounded daily totals. No mouse movement, keystroke logging, or screen monitoring is ever implemented.
- **Session Credentials Protection:** All mutating endpoints require authenticated session cookies with strict SameSite and CORS validation.

---

## 15. Automated Verification & Test Matrix

Run automated test suites across the monorepo:

```bash
# Run all monorepo unit and integration test suites
pnpm test

# Run frontend UI component tests
cd apps/web && pnpm test

# Run backend typecheck
cd apps/api && pnpm typecheck
```

### Verified Test Matrix:
- ✅ **Deterministic DMS Scoring:** Validates exact 0–100 score bounds, language weighting, and PR rate calculations.
- ✅ **ActiveTimeTracker:** Verifies focus and visibility guards, interval timer accumulation, and listener cleanup on unmount.
- ✅ **9-Badge Evaluation:** Verifies deterministic badge eligibility across started counts, PRs, distinct repositories, and technology sets.
- ✅ **Profile Presentation:** Verifies 5-over-4 badge gallery layout, artwork heights, and baseline horizontal alignment.
- ✅ **TypeScript Strictness:** Complete monorepo compilation with zero type errors.

---

## 16. Future Roadmap

- [ ] **Live Webhook Ingestion:** Ingest real-time GitHub repository webhooks to index newly labeled `good first issue` opportunities within seconds.
- [ ] **Interactive Code Walkthroughs:** Expand Graphify AST output to generate step-by-step interactive call-graph diagrams directly inside the browser.
- [ ] **Automated Fork & Clone Assistant:** 1-click GitHub CLI command generator for instant local reproduction and branch initialization.
- [ ] **PR Review Readiness Pre-check:** Automated static lint and test execution against draft contributions before submission to upstream maintainers.

---

<p align="center">
  <b>StackAudit</b> — Engineered for developers who build the open-source ecosystem.
</p>
