# ADR-005: BullMQ for Background Jobs

## Status

Accepted

---

## Context

Repository analysis and AI processing may take several seconds.

Blocking HTTP requests would degrade user experience.

---

## Decision

Use BullMQ for asynchronous job processing.

---

## Rationale

- Non-blocking APIs
- Retry support
- Scheduling
- Job monitoring

---

## Alternatives

### Synchronous Processing

Rejected due to poor scalability.

### RabbitMQ

Rejected because BullMQ integrates naturally with Redis and has lower operational complexity.

---

## Consequences

Positive

- Better user experience
- Scalable processing

Negative

- More moving parts