---
trigger: always_on
---

# STACKAUDIT — IMPORTANT PRODUCT DIRECTION CORRECTION

You are working on an existing project called StackAudit.

Before making any further UI, feature, or product decisions, understand this carefully.

## THE CORE PRODUCT IS NOT A REPOSITORY ANALYSIS DASHBOARD

StackAudit's primary purpose is:

> Help developers discover, understand, and successfully contribute to open-source projects.

The user should not primarily come to StackAudit because they want "repository insights."

They should come because they want to contribute to open source but don't know:

- Which repository is suitable for them.
- Whether they are technically ready for it.
- Which issue they should work on.
- How difficult the issue is.
- Whether the repository is beginner-friendly.
- What parts of the codebase are relevant to the issue.
- How the unfamiliar code works.
- What they need to understand before contributing.
- How to approach the contribution.

Repository analysis is an IMPORTANT INTERNAL CAPABILITY of StackAudit, but it is NOT the final product experience.

---

# PRODUCT DISTINCTION

A generic repository analysis platform asks:

> "What can you tell me about this repository?"

StackAudit should ask:

> "What open-source contribution is right for this developer, and how can we help them make it?"

That distinction must guide every future product decision.

---

# WHAT WENT WRONG

The current implementation has drifted toward:

GitHub Repository
↓
Repository Analysis
↓
Code / Architecture / Health Insights
↓
Dashboard

That produces a repository intelligence / code analysis website.

That is not the primary StackAudit experience.

DO NOT continue expanding the product in this direction merely because the existing implementation already contains repository analysis features.

Do not add more generic:

- Repository health dashboards
- Code quality dashboards
- Architecture metrics
- Dependency dashboards
- Generic repository statistics

unless they directly support the contribution workflow.

---

# THE CORRECT STACKAUDIT EXPERIENCE

The intended product flow is:

Developer
↓
"I want to contribute to open source."
↓
StackAudit understands the developer
↓
Discover suitable repositories
↓
Evaluate repository suitability
↓
Find suitable issues
↓
Match developer with issues
↓
Explain why the issue is suitable
↓
Analyze the relevant part of the repository
↓
Explain unfamiliar code
↓
Identify relevant files/modules
↓
Explain what needs to change
↓
Guide the developer toward making the contribution

The end result should be:

> "Here is an open-source repository and contribution opportunity that matches your current skills, and here is everything you need to understand before working on it."

---

# CORE PRODUCT MODULES

The product should eventually revolve around these capabilities.

## 1. Developer Profile / Skill Understanding

Understand the developer's:

- Programming languages
- Framework knowledge
- Backend/frontend experience
- Experience level
- Interests
- Preferred contribution types
- Existing GitHub activity

Example:

Languages:

- C++
- Java
- JavaScript

Interests:

- Backend
- Web
- AI

Experience:

- Beginner / Intermediate

Contribution preference:

- Good first issues
- Bug fixes
- Documentation
- Small features

---

## 2. Repository Discovery

StackAudit should help users discover repositories that are appropriate for them.

Evaluation can include:

- Technology compatibility
- Repository activity
- Community health
- Documentation quality
- Issue quality
- Contribution activity
- Project complexity
- Contributor activity
- Language/framework match

The goal is NOT:

"Give me repository statistics."

The goal is:

"Find repositories where I have a realistic chance of contributing."

---

## 3. Contribution Opportunity Discovery

This is one of the most important parts of StackAudit.

StackAudit should identify issues that match the developer.

Example:

Issue #1842
"Fix API response validation"

Difficulty:
Beginner → Intermediate

Why this developer matches:

✓ TypeScript
✓ Backend experience
✓ Express
✓ No deep framework knowledge required

Estimated effort:

2–5 hours

Relevant files:

src/api/validation/*
src/routes/user.ts

This is much more valuable than simply showing:

"Repository health score: 82/100."

---

## 4. Developer ↔ Issue Matching

StackAudit should eventually answer:

> "Why is this issue suitable for me?"

Matching factors can include:

- Developer skills
- Programming language
- Framework
- Issue labels
- Issue complexity
- Required files/modules
- Estimated effort
- Required domain knowledge
- Previous contribution experience

The system should explain the match instead of producing an unexplained score.

---

# 5. Repository Understanding

This is where the existing repository-analysis functionality becomes useful.

DO NOT throw away repository analysis.

Instead, reposition it as an internal capability that helps developers understand a contribution.

For example:

Issue
↓
Relevant module
↓
Relevant files
↓
Existing implementation
↓
Dependencies
↓
What needs to change

Repository analysis should answer:

> "What do I need to understand in this codebase to work on this issue?"

rather than simply:

> "Here are some statistics about this repository."

---

# 6. Contribution Guidance

After a developer selects an issue, StackAudit should eventually help them understand:

- What the issue is asking.
- Why the issue exists.
- Which files are relevant.
- Which modules are involved.
- How the existing code works.
- What part likely needs modification.
- What concepts they need to understand first.
- What an implementation approach could look like.

The developer should move from:

"I don't understand this repository."

to:

"I understand what I need to work on."

---

# PRODUCT LOOP

The long-term StackAudit loop should look like:

Developer Profile
↓
Repository Discovery
↓
Repository Evaluation
↓
Issue Discovery
↓
Developer–Issue Matching
↓
Contribution Context
↓
Codebase Understanding
↓
Contribution Guidance
↓
Developer Makes Contribution
↓
StackAudit can eventually help evaluate/learn from the contribution

This is the core product loop.

---

# HOW TO TREAT THE CURRENT REPOSITORY ANALYSIS WEBSITE

Do NOT automatically delete the existing repository analysis work.

Instead, classify existing functionality into three categories.

### KEEP

Anything that directly helps developers understand whether and how they can contribute.

### REPOSITION

Existing repository analysis features that are useful internally but are currently presented as the main product.

For example:

Repository architecture analysis can become:

"Understand the architecture relevant to this issue."

Repository health can become:

"Is this repository a good contribution target?"

Code analysis can become:

"Understand the code you need to modify."

### REMOVE / DEPRIORITIZE

Features that only exist to make a generic repository analytics dashboard and don't contribute meaningfully to the open-source contribution workflow.

Do not expand these features merely because they already exist.

---

# IMPORTANT PRODUCT RULE

Every major feature should pass this question:

> "Does this help a developer discover, understand, or successfully contribute to open source?"

If YES:
Proceed.

If MAYBE:
Explain why it is necessary.

If NO:
Do not prioritize it.

---

# UX DIRECTION

The primary CTA should NOT simply be:

"Analyze Repository"

The product should feel more like:

"Find an open-source contribution for me."

Possible primary experience:

"Find My Contribution"

or:

"Discover Projects"

The interface should guide the developer toward contribution rather than toward inspecting arbitrary repository metrics.

---

# DO NOT CHANGE THE ENGINEERING ARCHITECTURE

This product correction does NOT mean redesigning the backend architecture.

The existing StackAudit architecture remains valid:

- Turborepo
- Next.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Better Auth
- Redis
- BullMQ
- Docker
- GitHub Actions

The backend remains a modular monolith.

Repository analysis can be one of the backend capabilities/modules supporting the larger contribution-intelligence system.

Do not introduce microservices or new technologies to solve this product-direction issue.

---

# DO NOT RESTART THE PROJECT

The project already has:

- Product documentation
- Architecture documentation
- ADRs
- Engineering Handbook
- Monorepo
- Frontend foundation
- Backend foundation
- Repository-analysis implementation

Do not throw away existing work.

Do not restart planning.

Do not redesign the entire project.

Instead:

1. Understand the original product goal.
2. Audit the current implementation.
3. Identify product drift.
4. Preserve useful repository-analysis capabilities.
5. Reposition them as supporting capabilities.
6. Build the contribution-discovery workflow around them.

---

# BEFORE CHANGING ANY CODE

First inspect the existing implementation and give me a short assessment:

1. What currently exists.
2. Which parts align with the actual StackAudit goal.
3. Which parts have drifted toward a generic repository-analysis product.
4. Which existing features can be reused.
5. What important contribution-focused capabilities are missing.
6. What the recommended next implementation step is.

DO NOT immediately start rewriting the UI.

DO NOT generate code yet.

First understand the product direction and current implementation.

The goal is to make StackAudit a genuine:

> OPEN-SOURCE CONTRIBUTION INTELLIGENCE PLATFORM

not merely a:

> GITHUB REPOSITORY ANALYSIS DASHBOARD.
