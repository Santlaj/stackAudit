# ADR-004: Redis for Caching

## Status

Accepted

---

## Context

Repository analysis is expensive. Frequently requested repositories should not trigger repeated GitHub API requests.

---

## Decision

Redis will be used for:

- Repository cache
- Session storage
- Temporary analysis results
- Rate-limit metadata

---

## Rationale

- Extremely fast
- Simple key-value storage
- TTL support
- Reduces GitHub API usage

---

## Alternatives

### In-memory Cache

Rejected because data disappears on restart.

### Memcached

Rejected due to fewer capabilities and weaker ecosystem.

---

## Consequences

Positive

- Faster response times
- Reduced API costs

Negative

- Additional infrastructure