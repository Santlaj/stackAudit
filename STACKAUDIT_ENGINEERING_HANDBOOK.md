# StackAudit Engineering Handbook

> **Version:** 2.0.0\
> **Status:** Active --- V1 Product Definition\
> **Project Type:** Production-oriented open-source contribution
> platform\
> **Owner:** Santlaj Kumar\
> **Role of ChatGPT:** Lead Engineer, Architect, Reviewer and Technical
> Mentor

------------------------------------------------------------------------

# 1. Purpose

This handbook is the engineering source of truth for StackAudit.

It defines:

-   product boundaries
-   V1 requirements
-   architectural rules
-   module ownership
-   GitHub integration rules
-   AI boundaries
-   data ownership
-   engineering workflow
-   implementation priorities

When an implementation decision conflicts with this document, stop and
resolve the conflict before coding.

Product requirements take precedence over old roadmap assumptions.

------------------------------------------------------------------------

# 2. Product Definition

StackAudit is an **open-source contribution intelligence platform**.

Its V1 purpose is:

> Help a developer discover open-source contribution opportunities that
> match their GitHub history, current technical interests, contribution
> complexity, and learning goals.

StackAudit is not a replacement for GitHub.

GitHub is the source of truth for software-development data and the
destination where the actual contribution happens.

StackAudit provides the intelligence layer between the developer and
GitHub.

------------------------------------------------------------------------

# 3. Product Model

The V1 product has four primary inputs:

``` text
GitHub Developer History
        +
Current Developer Preferences
        +
Learning Goals
        +
Contribution Constraints
```

These inputs produce:

``` text
Relevant GitHub Issues
        ↓
Filtered Candidates
        ↓
Matched Opportunities
        ↓
Ranked Recommendations
        ↓
Actionable Explanation
```

The product is therefore centered on **developer-to-contribution
matching**, not generic repository analysis.

------------------------------------------------------------------------

# 4. V1 Scope

## 4.1 GitHub Authentication

Required.

Users authenticate through GitHub OAuth.

The authentication layer provides the identity and, where authorized,
the GitHub access required for personalized data retrieval.

------------------------------------------------------------------------

## 4.2 Developer Profile Intelligence

StackAudit creates a developer profile from GitHub.

### Observed data

Examples:

-   username
-   name
-   bio
-   public repositories
-   repository languages
-   issues
-   pull requests
-   commits
-   contribution activity
-   repository ownership
-   public contribution history

### Derived signals

Examples:

-   frequently used technologies
-   recurring project areas
-   contribution patterns
-   likely areas of familiarity

Derived signals must be labeled as inferred.

### User-confirmed data

Examples:

-   current skill level
-   technologies being learned
-   desired contribution area
-   learning objectives
-   preferred complexity

User-confirmed information must take precedence over weak inferences.

------------------------------------------------------------------------

# 5. Skill Representation

A technology may have three independent states:

``` text
Observed
Inferred
User-confirmed
```

Example:

``` text
Java
Observed: yes
Inferred familiarity: medium
User-confirmed: learning
```

The system must never convert repository frequency directly into a
definitive skill claim.

The user must be able to correct or override inferred information.

------------------------------------------------------------------------

# 6. Learning Context

Learning goals are first-class V1 data.

A developer may say:

``` text
Currently learning:
Spring Boot

Interested in:
Backend

Want to practice:
REST APIs + testing
```

Contribution recommendations should use this information when ranking
opportunities.

This is important because:

> Past GitHub activity represents experience; current learning goals
> represent intent.

------------------------------------------------------------------------

# 7. Contribution Discovery

## Primary V1 Object

The primary contribution opportunity is an **open GitHub issue** that a
developer can investigate and potentially implement.

Existing open pull requests are not the primary search target in V1.

PR data may be consumed as supporting repository signals such as:

-   maintainer activity
-   review activity
-   contribution responsiveness
-   project activity

Future versions may support direct PR discovery.

------------------------------------------------------------------------

# 8. Search Constraints

The user must be able to constrain the search before candidate
retrieval.

Required V1 constraints:

### Complexity

Use StackAudit's normalized levels:

``` text
Good First Issue
Beginner
Intermediate
Advanced
Hard
```

GitHub labels are signals, not the complete definition of difficulty.

### Technology

Examples:

-   Java
-   C++
-   Python
-   TypeScript
-   JavaScript
-   Go
-   Rust
-   Spring Boot
-   React
-   Next.js
-   Node.js

The technology taxonomy should be extensible.

### Contribution Type

Examples:

-   Bug fix
-   Feature
-   Documentation
-   Testing
-   Refactoring
-   Developer tooling

### Area

Examples:

-   Backend
-   Frontend
-   Full-stack
-   DevOps
-   AI/ML
-   Security
-   Database
-   Developer tools
-   Documentation

### Learning Goal

Optional but strongly recommended.

------------------------------------------------------------------------

# 9. Search Pipeline

The V1 search pipeline is mandatory:

``` text
User Request
    ↓
Validate Search Criteria
    ↓
Build Structured Search Query
    ↓
GitHub Candidate Retrieval
    ↓
Hard Filtering
    ↓
Deterministic Scoring
    ↓
Candidate Limit
    ↓
Optional AI Analysis
    ↓
Final Ranking
    ↓
Response
```

AI must never be placed before hard filtering.

------------------------------------------------------------------------

# 10. Hard Filtering

Hard constraints must be deterministic.

Examples:

If user selects:

``` text
Technology = Java
Complexity = Good First Issue
```

the system must not return an issue that clearly violates those
constraints simply because an AI model thinks it is interesting.

Hard filters may include:

-   issue open state
-   supported language
-   requested technology
-   selected complexity
-   excluded contribution types
-   repository accessibility
-   minimum activity requirements where explicitly requested

Hard constraints cannot be overridden by AI.

------------------------------------------------------------------------

# 11. Matching and Ranking

After hard filtering, candidates are scored using deterministic signals.

Possible V1 signals:

  Signal                             Purpose
  ---------------------------------- ----------------------------------------
  Technology match                   Measures technical alignment
  Learning-goal match                Measures relevance to current learning
  Complexity match                   Measures difficulty alignment
  Contribution-type match            Measures task preference
  Repository activity                Measures project freshness
  Issue freshness                    Measures opportunity freshness
  Beginner signals                   Measures accessibility
  Previous contribution similarity   Measures familiarity
  Repository documentation           Measures approachability

The exact weights should be configurable and tested.

The scoring engine must be explainable.

------------------------------------------------------------------------

# 12. AI Boundary

AI is an enhancement layer.

## AI MAY

-   interpret issue descriptions
-   identify semantic technology relevance
-   summarize contribution requirements
-   explain why an issue matches
-   explain likely learning value
-   generate a concise "before you start" guide
-   identify ambiguity in an issue

## AI MUST NOT

-   freely search GitHub
-   invent issues
-   invent repositories
-   fabricate metrics
-   override hard filters
-   determine factual GitHub counts
-   decide whether an issue exists
-   replace deterministic ranking signals
-   silently change the user's constraints

AI receives a controlled candidate payload.

------------------------------------------------------------------------

# 13. AI Cost Policy

Because AI cost is a project constraint, V1 must avoid unnecessary
inference calls.

Preferred strategy:

``` text
Retrieve many
    ↓
Deterministically filter
    ↓
Keep top N
    ↓
AI only for top candidates
```

AI should be:

-   on-demand where possible
-   cached where appropriate
-   provider-independent
-   observable for cost and failures

A search must remain useful even when AI is unavailable.

------------------------------------------------------------------------

# 14. AI Provider Architecture

Business logic must never import an AI SDK.

Required architecture:

``` text
Contribution Matching
        ↓
AI Analysis Interface
        ↓
AI Provider Adapter
        ↓
Provider SDK
        ↓
AI Provider
```

The provider can change without changing contribution business logic.

------------------------------------------------------------------------

# 15. GitHub Integration Architecture

GitHub is an external dependency.

Business modules must not directly depend on Octokit or another GitHub
SDK.

Required pattern:

``` text
Application Service
       ↓
GitHub Provider Interface
       ↓
GitHub Adapter
       ↓
GitHub API / SDK
```

The GitHub provider owns:

-   authentication integration
-   API requests
-   pagination
-   rate-limit handling
-   retries
-   response mapping
-   GitHub-specific errors

Business modules own:

-   filtering
-   scoring
-   matching
-   recommendation rules
-   user-facing explanations

------------------------------------------------------------------------

# 16. Core Modules

## Authentication Module

Owns:

-   GitHub OAuth
-   sessions
-   authorization
-   token lifecycle

Does not own profile analysis.

------------------------------------------------------------------------

## Developer Profile Module

Owns:

-   developer identity
-   observed GitHub profile
-   contribution history
-   technology observations
-   inferred signals
-   user-confirmed skills
-   learning goals
-   preferences

This module is the source of truth for developer-specific context.

------------------------------------------------------------------------

## Contribution Discovery Module

Owns:

-   issue retrieval requests
-   search criteria
-   candidate normalization
-   pagination
-   GitHub issue mapping

It does not decide whether a candidate is a good match.

------------------------------------------------------------------------

## Contribution Matching Module

Owns:

-   hard constraints
-   deterministic scoring
-   ranking
-   match explanations
-   candidate selection for AI

It consumes Developer Profile data and Contribution Discovery data
through interfaces.

------------------------------------------------------------------------

## AI Analysis Module

Owns:

-   AI provider abstraction
-   candidate semantic analysis
-   qualitative explanation
-   learning-value explanation
-   contribution guidance

It does not own GitHub retrieval.

------------------------------------------------------------------------

## Platform Module

Owns:

-   settings
-   feature flags
-   audit logs
-   notifications
-   future subscriptions

Premium functionality is not a V1 priority.

------------------------------------------------------------------------

# 17. Dependency Rules

Allowed:

``` text
Authentication
      ↓
Developer Identity

Developer Profile
      ↓
Contribution Matching

Contribution Discovery
      ↓
Contribution Matching

Contribution Matching
      ↓
AI Analysis
```

Forbidden:

``` text
AI → GitHub API
AI → Database directly
Frontend → GitHub API
Controller → Prisma directly
Controller → AI SDK
```

No circular module dependencies are allowed.

------------------------------------------------------------------------

# 18. Data Ownership

Every module owns its data.

Examples:

``` text
Developer Profile
    → developer preferences

Contribution Discovery
    → normalized opportunity cache

Contribution Matching
    → matching/ranking records

Authentication
    → identity/session records
```

Modules communicate through application services and stable interfaces.

No module may directly manipulate another module's persistence layer.

------------------------------------------------------------------------

# 19. V1 Data Model --- Conceptual

The implementation may evolve, but V1 needs concepts equivalent to:

``` text
User
GitHubIdentity
DeveloperProfile
TechnologySignal
LearningGoal
ContributionPreference
SearchPreference
ContributionOpportunity
RepositorySnapshot
IssueSnapshot
MatchResult
AIAnalysis
SavedOpportunity
```

Do not create database entities simply because a concept exists. Persist
only data required for product behavior, caching, auditing, or
performance.

------------------------------------------------------------------------

# 20. Recommendation Result Contract

Every recommendation should contain enough information to explain the
decision.

Conceptually:

``` text
Opportunity
- repository
- issue
- technology
- complexity
- contribution type

Match
- score
- matched signals
- missing signals
- learning relevance
- confidence

Explanation
- why it matches
- what to learn
- suggested prerequisites

Source
- GitHub URL
- fetched timestamp
```

The GitHub URL is mandatory for an actionable result.

------------------------------------------------------------------------

# 21. V1 Screens

The minimum product experience should contain:

1.  GitHub sign-in
2.  Profile analysis / onboarding
3.  Developer profile
4.  Contribution preferences
5.  Contribution search
6.  Search results
7.  Opportunity details
8.  Saved opportunities
9.  Basic settings

Do not build a generic analytics dashboard unless it directly supports
contribution discovery.

------------------------------------------------------------------------

# 22. Frontend Product Rule

The UI must communicate that StackAudit is a professional engineering
product.

Avoid:

-   generic AI-dashboard aesthetics
-   excessive gradients
-   arbitrary glowing effects
-   oversized decorative cards
-   unnecessary charts
-   "AI magic" visual language
-   information density without hierarchy

The interface should prioritize:

-   clear information hierarchy
-   credible engineering-tool aesthetics
-   precise filters
-   readable technical metadata
-   strong typography
-   restrained visual language
-   fast interaction
-   explainable recommendations

The frontend should look like it was designed by a product/UI
engineering team, not generated from a generic AI dashboard template.

------------------------------------------------------------------------

# 23. V1 User Journey

``` text
GitHub OAuth
    ↓
Profile Analysis
    ↓
Review detected skills
    ↓
Add current learning goals
    ↓
Choose contribution preferences
    ↓
Search
    ↓
Deterministic filtering
    ↓
Ranked opportunities
    ↓
Understand recommendation
    ↓
Open issue on GitHub
    ↓
Optional save
```

------------------------------------------------------------------------

# 24. V1 Acceptance Criteria

V1 cannot be considered complete unless a new user can:

### Identity

-   authenticate with GitHub
-   retrieve their profile

### Profile

-   view GitHub-derived information
-   view contribution history
-   view detected technologies
-   distinguish observed and inferred information
-   correct user preferences

### Intent

-   select complexity
-   select technologies
-   select contribution type
-   select area
-   specify learning goals

### Discovery

-   retrieve open issues
-   filter them deterministically
-   avoid obvious constraint violations
-   paginate results

### Matching

-   rank candidates using explainable signals
-   connect recommendations to developer context
-   provide a reason for every recommendation

### AI

-   use AI only on controlled candidates
-   operate without AI when unavailable
-   never override hard constraints

### Action

-   open the original GitHub issue
-   save an opportunity if saving is enabled

------------------------------------------------------------------------

# 25. V1 Out of Scope

Explicitly excluded:

-   automated coding
-   automatic branch creation
-   automatic PR creation
-   autonomous issue claiming
-   autonomous GitHub actions
-   recruiter intelligence
-   organization intelligence
-   portfolio scoring
-   advanced repository health scoring
-   repository architecture reverse engineering
-   generalized AI chat
-   GitHub replacement functionality
-   direct open-PR marketplace
-   subscriptions and billing

These require separate product decisions.

------------------------------------------------------------------------

# 26. Revised Development Roadmap

The previous roadmap over-invested in generic repository analysis before
validating the contribution-matching product.

V1 should instead follow the user's journey.

## Sprint 1 --- Foundation

Status: Completed.

Foundation includes:

-   monorepo
-   Next.js
-   Express
-   TypeScript
-   shared tooling
-   validation
-   health API
-   logging
-   error handling

------------------------------------------------------------------------

## Sprint 2 --- GitHub Authentication

Objective:

Establish secure GitHub identity.

Deliverables:

-   GitHub OAuth
-   session management
-   protected routes
-   GitHub identity storage
-   token handling

Definition of Done:

A user can sign in and access protected StackAudit endpoints.

------------------------------------------------------------------------

## Sprint 3 --- Developer Profile Intelligence

Objective:

Build the user's GitHub-derived profile.

Deliverables:

-   GitHub profile retrieval
-   repository retrieval
-   contribution retrieval
-   technology extraction
-   observed/inferred distinction
-   profile persistence

Definition of Done:

A signed-in user receives a meaningful developer profile derived from
GitHub.

------------------------------------------------------------------------

## Sprint 4 --- Developer Intent and Preferences

Objective:

Capture what the developer wants now.

Deliverables:

-   current technologies
-   learning goals
-   complexity
-   contribution types
-   areas of interest
-   preference persistence

Definition of Done:

A user can create and edit their contribution-search profile.

------------------------------------------------------------------------

## Sprint 5 --- Contribution Discovery

Objective:

Retrieve open GitHub issues.

Deliverables:

-   GitHub issue provider
-   search criteria
-   normalized issue model
-   hard filters
-   pagination
-   rate-limit handling

Definition of Done:

The system can reliably return open issues matching explicit
constraints.

------------------------------------------------------------------------

## Sprint 6 --- Contribution Matching

Objective:

Rank issues against the developer.

Deliverables:

-   deterministic scoring
-   developer-to-issue matching
-   ranking
-   match reasons
-   missing-signal detection

Definition of Done:

Results are personalized and explainable without requiring AI.

------------------------------------------------------------------------

## Sprint 7 --- Controlled AI Analysis

Objective:

Improve qualitative understanding.

Deliverables:

-   AI provider abstraction
-   candidate analysis
-   semantic relevance
-   learning-value explanation
-   contribution guidance
-   AI caching/cost controls

Definition of Done:

AI improves explanations without becoming responsible for search or
factual data.

------------------------------------------------------------------------

## Sprint 8 --- Opportunity Experience

Objective:

Turn recommendations into actionable contribution decisions.

Deliverables:

-   results page
-   opportunity details
-   match explanation
-   learning section
-   GitHub action
-   save opportunity

Definition of Done:

A user can select an opportunity and confidently continue on GitHub.

------------------------------------------------------------------------

## Sprint 9 --- V1 Hardening

Objective:

Make the core workflow reliable.

Deliverables:

-   integration tests
-   rate-limit resilience
-   AI failure handling
-   caching where justified
-   observability
-   security review
-   performance review

Definition of Done:

The complete V1 flow works reliably under expected failure conditions.

------------------------------------------------------------------------

# 27. Redis and Queues

Redis and BullMQ are not automatically required for every feature.

Use them only when there is a demonstrated need for:

-   asynchronous GitHub ingestion
-   expensive AI processing
-   retries
-   cache workloads
-   background profile refreshes

Do not introduce infrastructure merely because it exists in the
technology stack.

------------------------------------------------------------------------

# 28. Repository Analysis Policy

Generic repository analysis is **supporting infrastructure**, not the
primary V1 product.

Useful repository signals may include:

-   README
-   contributing guide
-   languages
-   activity
-   issue labels
-   pull requests
-   maintainer activity

Only collect or analyze data that improves contribution discovery or
recommendation quality.

Do not build a large repository-health platform before the contribution
workflow is useful.

------------------------------------------------------------------------

# 29. Engineering Workflow

Every feature follows:

``` text
Requirement
    ↓
Acceptance Criteria
    ↓
Architecture Review
    ↓
Task Breakdown
    ↓
Implementation
    ↓
Testing
    ↓
Self Review
    ↓
Refactoring
    ↓
Verification
    ↓
Commit
```

No feature should begin as "build whatever seems useful."

------------------------------------------------------------------------

# 30. API Rules

Every endpoint must define:

-   purpose
-   authentication requirement
-   request schema
-   response schema
-   validation
-   error behavior
-   pagination where applicable
-   rate-limit implications
-   test strategy

Controllers contain orchestration only.

Business rules belong in application/domain services.

Persistence belongs in repositories.

------------------------------------------------------------------------

# 31. External Provider Rules

External providers include:

-   GitHub
-   AI provider

All external integrations use adapters.

Business code must depend on interfaces, not SDKs.

This allows provider replacement and keeps external failures isolated.

------------------------------------------------------------------------

# 32. Reliability Rules

Important principles:

1.  Incorrect data is worse than missing data.
2.  GitHub is the source of truth.
3.  AI output is untrusted until validated.
4.  User constraints must be preserved.
5.  External API failures must be handled explicitly.
6.  Recommendations must be traceable to actual signals.

Never hide uncertainty behind confident AI language.

------------------------------------------------------------------------

# 33. Security Rules

Always verify:

-   OAuth security
-   token storage
-   authorization
-   input validation
-   secret management
-   external API permissions
-   rate limiting
-   output handling
-   dependency security

Never expose GitHub access tokens to the frontend unnecessarily.

Never send unnecessary private/user data to an AI provider.

------------------------------------------------------------------------

# 34. Engineering Decision Framework

Evaluate technical choices in this order:

1.  Correctness
2.  Product fit
3.  Simplicity
4.  Maintainability
5.  Readability
6.  Security
7.  Scalability
8.  Performance
9.  Cost

For AI specifically, also evaluate:

-   value per inference
-   latency
-   fallback behavior
-   cacheability
-   provider portability

------------------------------------------------------------------------

# 35. Current Project State

Sprint 1 is complete.

The repository foundation has been established and verified.

The product direction is now explicitly centered on:

``` text
Developer
    ↓
Profile Intelligence
    ↓
Learning Intent
    ↓
Contribution Constraints
    ↓
Open Issues
    ↓
Deterministic Matching
    ↓
Controlled AI Explanation
    ↓
GitHub Contribution
```

The next product milestone is **Sprint 2 --- GitHub Authentication**.

------------------------------------------------------------------------

# 36. Final Product Rule

Before implementing any feature, ask:

> **Does this materially improve a developer's ability to find,
> understand, or act on a relevant open-source contribution?**

If the answer is no, it is not a V1 priority.

StackAudit succeeds by being focused, trustworthy, and useful---not by
containing the largest number of features.
