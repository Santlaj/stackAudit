# ADR-002: PostgreSQL as the Primary Database

## Status

Accepted

## Date

30 June 2026

---

## Context

StackAudit manages relational entities such as users, repositories, analyses, recommendations, subscriptions, and contribution history. Data consistency is essential.

---

## Decision

Use **PostgreSQL** as the primary database.

---

## Rationale

* ACID compliance
* Excellent relational modeling
* Mature indexing
* Full-text search support
* Strong ecosystem
* Reliable backups

---

## Alternatives Considered

### MongoDB

**Pros**

* Flexible schema
* Fast prototyping

**Cons**

* Weak relational modeling
* Complex joins
* Data duplication

**Decision:** Rejected

---

### Neo4j

**Pros**

* Powerful graph relationships

**Cons**

* Unnecessary complexity
* Higher operational cost

**Decision:** Deferred

---

## Consequences

### Positive

* Reliable transactions
* Strong data integrity
* Easier reporting

### Negative

* Schema migrations required
* Slightly more rigid than NoSQL
