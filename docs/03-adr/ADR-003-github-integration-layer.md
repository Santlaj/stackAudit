# ADR-003: GitHub Integration Layer

## Status

Accepted

---

## Context

Multiple modules require GitHub data. Direct API calls from every module would create duplicated logic and inconsistent error handling.

---

## Decision

Create a dedicated **GitHub Integration Layer** responsible for all communication with GitHub APIs.

---

## Rationale

* Single source of integration
* Centralized rate-limit handling
* Shared caching
* Easier testing
* Provider abstraction

---

## Alternatives

### Direct API Calls

**Decision:** Rejected

Reasons:

* Duplicate code
* Difficult maintenance
* Poor scalability

---

## Consequences

### Positive

* Cleaner architecture
* Centralized retry logic
* Easier future migration

### Negative

* Additional abstraction layer
