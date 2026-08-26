# StackAudit

> **Open-source contribution intelligence for developers.**

StackAudit helps developers find open-source contribution opportunities
that actually fit **who they are, what they know, and what they are
currently trying to learn**.

Instead of making users search GitHub manually, StackAudit analyzes
their GitHub profile and contribution history, collects explicit
preferences, retrieves relevant open issues, and ranks opportunities
using deterministic matching plus tightly scoped AI assistance.

------------------------------------------------------------------------

## Product Definition

**StackAudit = GitHub developer profile intelligence + contribution
discovery + personalized matching.**

The V1 product answers one core question:

> **"What open-source contribution should I work on next, and why is it
> a good fit for me?"**

GitHub remains the source of truth for repository and contribution data.
StackAudit is the intelligence and decision layer on top of it.

------------------------------------------------------------------------

## V1 Core Flow

``` text
GitHub OAuth
     ↓
Developer Profile Ingestion
     ↓
Profile + Contribution Analysis
     ↓
User Preference / Learning Setup
     ↓
Contribution Search Criteria
     ↓
GitHub Open-Issue Retrieval
     ↓
Deterministic Filtering
     ↓
Candidate Matching
     ↓
Optional AI Relevance Explanation
     ↓
Ranked Contribution Opportunities
     ↓
Open on GitHub
```

The system must never allow an unrestricted AI agent to search GitHub
and invent recommendations.

------------------------------------------------------------------------

## What V1 Includes

### 1. GitHub Authentication

Users sign in with GitHub OAuth.

StackAudit uses the authenticated GitHub identity to retrieve the data
required for personalization.

### 2. GitHub Developer Profile Analysis

StackAudit builds a developer profile from GitHub data, including:

-   GitHub username and public profile information
-   Bio / description
-   Public repositories
-   Repository languages
-   Contribution history
-   Issues
-   Pull requests
-   Commits and other useful contribution signals
-   Technology signals derived from repositories

The system distinguishes between:

-   **Observed:** directly available from GitHub
-   **Inferred:** derived by StackAudit
-   **User-provided:** explicitly supplied by the developer

StackAudit must not present inferred skill levels as verified facts.

### 3. Developer Preferences

GitHub history describes the developer's past. V1 also captures what the
developer wants **now**.

Users can specify:

-   Technologies they know
-   Technologies they are currently learning
-   Desired contribution area
-   Desired contribution complexity
-   Contribution type
-   Learning goals
-   Optional preferred project characteristics

Examples:

``` text
Current focus:
Java, Spring Boot, REST APIs

Contribution area:
Backend

Complexity:
Intermediate

Contribution type:
Bug fixes, features

Learning goal:
Spring Boot + backend engineering
```

### 4. Contribution Discovery

The primary V1 opportunity is an **open GitHub issue that the user can
work on**.

V1 should support controlled filters such as:

-   Complexity
-   Technology / language
-   Framework
-   Contribution type
-   Project activity
-   Issue labels
-   Beginner friendliness
-   Learning goal
-   Repository characteristics

"Good First Issue" is one complexity option, not the entire product.

Open PRs may be used as repository activity / maintainer signals, but
**existing open PRs are not the primary contribution-search target in
V1**.

### 5. Personalized Matching

StackAudit compares:

``` text
Developer Profile
+
Current Preferences
+
Learning Goals
+
Contribution Requirements
```

against:

``` text
Repository
+
Issue
+
Repository Activity
+
Contribution Signals
```

The system produces a ranked set of opportunities.

Each recommendation should explain:

-   Why it matches the user
-   Which skills are relevant
-   What the user may learn
-   What appears to be missing
-   Why the estimated complexity was assigned
-   Which signals influenced the ranking

### 6. Controlled AI Assistance

AI is an **analysis and explanation layer**, not the search engine.

Deterministic systems handle:

-   GitHub retrieval
-   filters
-   labels
-   languages
-   dates
-   repository activity
-   quantitative metrics
-   hard exclusions
-   candidate limits

AI may handle:

-   understanding natural-language issue descriptions
-   semantic relevance
-   contribution explanation
-   learning-value explanation
-   concise guidance for approaching an issue

AI must receive only the necessary candidate context.

AI must not:

-   freely crawl/search GitHub
-   invent repositories or issues
-   override hard user filters
-   fabricate GitHub metrics
-   claim an issue is suitable without evidence
-   determine factual quantitative metrics

### 7. Contribution Opportunity Details

Each result should answer:

``` text
Why this?
What will I work with?
Why does it match me?
What can I learn?
How difficult does it appear?
What should I understand before starting?
Where do I contribute?
```

The final action should lead the user to GitHub rather than attempting
to replace GitHub.

------------------------------------------------------------------------

## V1 Non-Goals

V1 will NOT attempt to become:

-   A Git hosting platform
-   A Git client
-   An IDE
-   A source-code editor
-   An automated PR generator
-   An autonomous coding agent
-   A recruiter intelligence platform
-   A complete GitHub portfolio scoring platform
-   A repository health product
-   A social network
-   A generic AI chatbot
-   A general-purpose GitHub search replacement

These may be considered later only if they support the core
contribution-discovery mission.

------------------------------------------------------------------------

## Product Principles

### Personalization Before Search

Do not search broadly and personalize afterward.

Build the user's search context first.

### Deterministic Before AI

Use deterministic filters and signals to reduce the candidate set before
invoking AI.

### Explain Every Recommendation

A recommendation without a reason is not useful.

### GitHub Is the Source of Truth

StackAudit must link recommendations back to GitHub and avoid
duplicating GitHub as a workflow platform.

### User Intent Matters

The user's current learning goals can be more relevant than historical
GitHub activity.

### Observed ≠ Inferred

Never confuse GitHub facts with StackAudit's interpretation.

### Trust Over Quantity

Five strong recommendations are better than fifty weak ones.

### Cost-Aware AI

AI should be invoked only where it creates measurable value.

------------------------------------------------------------------------

## V1 Architecture

StackAudit uses a modular monolith.

``` text
Frontend
   │
   ▼
API
   │
   ├── Authentication
   ├── Developer Profile
   ├── Contribution Discovery
   ├── Matching
   ├── AI Analysis
   └── Platform
         │
         ▼
     PostgreSQL
         │
         └── GitHub Provider
```

External providers are isolated behind adapters.

Business logic must never depend directly on a GitHub SDK or AI SDK.

------------------------------------------------------------------------

## Core V1 Modules

### Authentication

Owns:

-   GitHub OAuth
-   sessions
-   authorization
-   GitHub token lifecycle

### Developer Profile

Owns:

-   GitHub identity
-   observed profile data
-   contribution history
-   detected technology signals
-   user-confirmed skills
-   learning goals
-   preferences

### Contribution Discovery

Owns:

-   contribution search
-   candidate retrieval
-   filters
-   pagination
-   GitHub issue mapping

### Contribution Matching

Owns:

-   deterministic matching
-   hard constraints
-   relevance scoring
-   ranking signals
-   match explanations

### AI Analysis

Owns:

-   semantic issue understanding
-   qualitative relevance
-   learning-value explanation
-   contribution guidance

It does not own retrieval or hard filtering.

------------------------------------------------------------------------

## V1 User Experience

### Onboarding

``` text
Connect GitHub
      ↓
Analyze profile
      ↓
Review detected technologies
      ↓
Tell StackAudit what you are learning
      ↓
Choose contribution preferences
      ↓
Find opportunities
```

The user should be able to correct detected information.

### Search Setup

Before searching, ask for the constraints needed to produce useful
results.

Example:

``` text
Complexity
[ Good First Issue ] [ Beginner ] [ Intermediate ] [ Advanced ] [ Hard ]

Technology
[ Java ] [ Spring Boot ]

Contribution
[ Bug Fix ] [ Feature ] [ Documentation ] [ Testing ]

Focus
[ Backend ]

Learning Goal
[ Spring Boot / REST APIs ]

              Find Contributions
```

### Results

Results should prioritize fit, not popularity.

Example:

``` text
Improve request validation in API module

Intermediate
Java · Spring Boot · REST

92% match

Why it fits
- Matches your current Spring Boot focus
- Uses Java and REST APIs
- Similar to your backend experience

You may learn
- Bean validation
- REST error handling
- Integration testing

[View issue on GitHub]
```

------------------------------------------------------------------------

## Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

### Backend

-   Node.js
-   Express
-   TypeScript

### Database

-   PostgreSQL
-   Prisma ORM

### Authentication

-   Better Auth
-   GitHub OAuth

### Infrastructure

-   Redis and BullMQ only where justified by workload
-   Docker
-   GitHub Actions

### External Integrations

-   GitHub API
-   AI provider behind an internal provider interface

Technology choices are implementation details. Product requirements must
not depend on a specific provider.

------------------------------------------------------------------------

## V1 Success Criteria

V1 is successful when a new user can:

1.  Sign in with GitHub.
2.  See a useful analysis of their GitHub profile and contributions.
3.  Confirm or correct their detected technologies.
4.  Specify what they are learning and what kind of contribution they
    want.
5.  Search for relevant open issues.
6.  Receive a small, ranked set of personalized opportunities.
7.  Understand why each opportunity matches them.
8.  Open the selected issue on GitHub.

If these steps work reliably, V1 has solved its core problem.

------------------------------------------------------------------------

## Current Engineering Status

### Sprint 1 --- Foundation

Completed.

The repository foundation, monorepo, frontend/backend bootstrap, shared
tooling, environment validation, health module, logging, error handling,
and development standards have been established. fileciteturn5file14

The next implementation work should prioritize the V1 product flow
rather than expanding repository-analysis features.

------------------------------------------------------------------------

## Development Rule

Every feature must answer:

> **Does this help a developer find and successfully approach a relevant
> open-source contribution?**

If not, it should not be part of V1.
